const express = require('express');
const router = express.Router();
const { ytmp3, ytmp4 } = require("ruhend-scraper");
const scdl = require("soundcloud-downloader").default;
const { TwitterDL } = require("twitter-downloader");
const axios = require("axios");
const cheerio = require("cheerio");
const tinyurl = require("tinyurl");
const getSpotifyAccessToken = require("../services/info/getSpotifyAccessToken.js");
const getSpotifyInfo = require("../services/info/getSpotifyInfo.js");
const getAlbumCoverFromLastFM = require("../services/albums/getAlbumCoverFromLastFM.js");
const getAlbumCoverFromSoundCloud = require("../services/albums/getAlbumCoverFromSoundCloud.js");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const tempFiles = new Set();

router.get("/", async (req, res) => {
  console.log("Starting download for ", req.query);
  let { url, format } = req.query;

  if (!url) {
    return res.status(400).json({
      valid: false,
      message: "URL is required.",
    });
  }

  if (
    url.includes("mega") ||
    url.includes("mediafire") ||
    url.includes("zippyshare") ||
    url.includes("4shared") ||
    url.includes("drive") ||
    url.includes("dropbox")
  ) {
    res.redirect(url);
  }

  if (
    url.includes("kayoanime") ||
    url.includes("instagram.com") ||
    url.includes("rapidcdn") ||
    url.includes("cdn")
  ) {
    url = url + "#format=mp4";
  }

  if (!format || !["mp3", "mp4"].includes(format)) {
    return res.status(400).json({
      valid: false,
      message: "Invalid format. Must be mp3 or mp4.",
    });
  }

  try {
    const isFromSpotify = url.includes("#from_spotify");
    const isFromSoundCloud = url.includes("soundcloud.com");

    if (isFromSpotify) {
      url = url.replace("#from_spotify", "");
      format = "mp3";
    }

    if (isFromSoundCloud) {
      format = "mp3";
      const info = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
      res.header(
        "Content-Disposition",
        `attachment; filename="${info.title}.mp3"`
      );
      res.header("Content-Type", "audio/mpeg");

      const stream = await scdl.download(url, SOUNDCLOUD_CLIENT_ID);
      stream.pipe(res);
      return;
    }

    if (
      url.includes("tiktok.com") ||
      url.includes("tikwm.com") ||
      url.includes("akamaized.net") ||
      url.includes("cdn") ||
      url.includes("rapidcdn") ||
      url.includes("instagram.com")
    ) {
      res.redirect(url);
      return;
    }

    if (url.includes("twitter.com") || url.includes("x.com")) {
      const result = await TwitterDL(url);
      const highestQualityVideo = result.result.media[0].videos.reduce(
        (prev, current) => {
          return prev.bitrate > current.bitrate ? prev : current;
        }
      );
      console.log("Highest quality video URL:", highestQualityVideo.url);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.result.description || "Twitter Media"}.mp4"`
      );
      res.setHeader("Content-Type", "video/mp4");

      try {
        const response = await axios({
          method: "get",
          url: highestQualityVideo.url,
          responseType: "stream",
        });

        response.data.pipe(res);
      } catch (error) {
        console.error("Error downloading video:", error);
        return res.status(500).json({
          valid: false,
          message: "Failed to download video " + error,
        });
      }
    }

    if (url.includes("spotify.com")) {
      const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
      if (!trackIdMatch || !trackIdMatch[1]) {
        return res.status(400).json({
          valid: false,
          message: "Invalid Spotify URL format",
        });
      }
      const trackId = trackIdMatch[1];
      const accessToken = await getSpotifyAccessToken();
      const spotifyInfo = await getSpotifyInfo(trackId, accessToken);
      if (!spotifyInfo.url) {
        return res.status(404).json({
          valid: false,
          message: "Could not find equivalent YouTube track",
        });
      }
      url = spotifyInfo.url.replace("#from_spotify", "");
    }

    if (url.includes("kayoanime")) {
      try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let downloadLink = $(".shortc-button.small.blue").attr("href");
        if (!downloadLink)
          downloadLink = $(".shortc-button.small.black").attr("href");
        if (!downloadLink)
          downloadLink = $(".shortc-button.small.green").attr("href");
        if (!downloadLink) downloadLink = $(".shortc-button").attr("href");

        if (downloadLink) {
          try {
            const resolvedLink = await tinyurl.resolve(downloadLink);
            return res.redirect(resolvedLink);
          } catch {
            try {
              const resolvedLink = await tinyurl.resolve(
                $(".shortc-button.small.black").attr("href")
              );
              return res.redirect(resolvedLink);
            } catch {
              try {
                const resolvedLink = await tinyurl.resolve(
                  $(".shortc-button.small.green").first().attr("href")
                );
                return res.redirect(resolvedLink);
              } catch {
                console.error("Invalid link");
                return res.redirect(url);
              }
            }
          }
        } else {
          console.error("Invalid link");
          return res.redirect(url);
        }
      } catch (error) {
        console.error("Error getting download link:", error);
        return res.send("The link is not valid");
      }
    }

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (format === "mp3") {
        console.log("Downloading mp3");
        const mediaData = await ytmp3(url);
        if (!mediaData || !mediaData.audio) {
          return res.status(404).json({
            valid: false,
            message: "No suitable mp3 format found.",
          });
        }

        const audioStream = (
          await axios({
            url: mediaData.audio,
            method: "GET",
            responseType: "stream",
          })
        ).data;

        let artworkFailed = false;
        let imageBuffer = null;
        let genre = null;
        try {
          const lastFMData = await getAlbumCoverFromLastFM(
            mediaData.author,
            mediaData.title,
            process.env.LASTFM_API_KEY
          );
          imageBuffer = lastFMData.imageBuffer;
          genre = lastFMData.genre;
        } catch (error) {
          console.warn("Failed to get LastFM artwork:", error);
          artworkFailed = true;
        }

        if (!imageBuffer && !artworkFailed) {
          try {
            console.warn(
              "No album data found on Last.fm, trying SoundCloud..."
            );
            imageBuffer = await getAlbumCoverFromSoundCloud(
              mediaData.author,
              mediaData.title
            );
            if (!imageBuffer) {
              console.warn("No artwork found on SoundCloud either.");
              artworkFailed = true;
            }
          } catch (error) {
            console.warn("Failed to get SoundCloud artwork:", error);
            artworkFailed = true;
          }
        }

        res.header(
          "Content-Disposition",
          `attachment; filename="${mediaData.title} - ${mediaData.author}.mp3"`
        );
        res.header("Content-Type", "audio/mpeg");

        if (artworkFailed || !imageBuffer) {
          ffmpeg(audioStream)
            .audioCodec("libmp3lame")
            .audioBitrate("320k")
            .outputFormat("mp3")
            .addOutputOption("-metadata", `title=${mediaData.title}`)
            .addOutputOption("-metadata", `artist=${mediaData.author}`)
            .addOutputOption(
              "-metadata",
              `album=${mediaData.title} - ${mediaData.author}`
            )
            .addOutputOption("-metadata", `genre=${genre || "Unknown"}`)
            .on("error", (err) => {
              console.error("FFmpeg error:", err);
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "FFmpeg error occurred.",
                });
              }
            })
            .pipe(res, { end: true });
          return;
        }

        try {
          const pngBuffer = await sharp(imageBuffer).png().toBuffer();
          console.log("Sharp processing complete.");
          const randomFileName = crypto.randomBytes(16).toString("hex");
          const tempImagePath = path.join(
            __dirname,
            `temp_cover_${randomFileName}.png`
          );
          const tempOutputPath = path.join(
            __dirname,
            `temp_output_${randomFileName}.mp3`
          );

          tempFiles.add({ path: tempImagePath, timestamp: Date.now() });
          tempFiles.add({ path: tempOutputPath, timestamp: Date.now() });

          console.log(`Writing temp image to: ${tempImagePath}`);
          fs.writeFileSync(tempImagePath, pngBuffer);
          console.log("Temp image written.");

          ffmpeg()
            .input(audioStream)
            .input(tempImagePath)
            .audioCodec("libmp3lame")
            .audioBitrate("320k")
            .addOutputOption("-id3v2_version", "3")
            .addOutputOption("-map", "0:a")
            .addOutputOption("-map", "1")
            .addOutputOption("-metadata:s:v", "title=Album cover")
            .addOutputOption("-metadata:s:v", "comment=Cover (front)")
            .addOutputOption("-disposition:v", "attached_pic")
            .addOutputOption("-metadata", `title=${mediaData.title}`)
            .addOutputOption("-metadata", `artist=${mediaData.author}`)
            .addOutputOption(
              "-metadata",
              `album=${mediaData.title} - ${mediaData.author}`
            )
            .addOutputOption("-metadata", `genre=${genre || "Unknown"}`)
            .toFormat("mp3")
            .on("start", () => {
              console.log("FFmpeg processing started");
            })
            .on("end", () => {
              console.log("FFmpeg processing finished");
              const readStream = fs.createReadStream(tempOutputPath);
              readStream.pipe(res);
              readStream.on("end", () => {
                tempFiles.delete({ path: tempImagePath });
                tempFiles.delete({ path: tempOutputPath });
                fs.unlink(tempImagePath, (err) => {
                  if (err)
                    console.error("Error deleting temp image file:", err);
                });
                fs.unlink(tempOutputPath, (err) => {
                  if (err)
                    console.error("Error deleting temp output file:", err);
                });
              });
            })
            .on("error", (err) => {
              console.error("FFmpeg error during processing:", err);
              tempFiles.delete({ path: tempImagePath });
              tempFiles.delete({ path: tempOutputPath });
              fs.unlink(tempImagePath, (err) => {
                if (err) console.error("Error deleting temp image file:", err);
              });
              fs.unlink(tempOutputPath, (err) => {
                if (err) console.error("Error deleting temp output file:", err);
              });
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "FFmpeg error occurred.",
                });
              }
            })
            .saveToFile(tempOutputPath);
        } catch (error) {
          console.error("Error processing artwork:", error);
          ffmpeg(audioStream)
            .audioCodec("libmp3lame")
            .audioBitrate("320k")
            .outputFormat("mp3")
            .addOutputOption("-metadata", `title=${mediaData.title}`)
            .addOutputOption("-metadata", `artist=${mediaData.author}`)
            .addOutputOption(
              "-metadata",
              `album=${mediaData.title} - ${mediaData.author}`
            )
            .addOutputOption("-metadata", `genre=${genre || "Unknown"}`)
            .on("error", (err) => {
              console.error("FFmpeg error:", err);
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "FFmpeg error occurred.",
                });
              }
            })
            .pipe(res, { end: true });
        }
      } else if (format === "mp4") {
        const mediaData = await ytmp4(url);
        if (!mediaData || !mediaData.video) {
          return res.status(404).json({
            valid: false,
            message: "No suitable mp4 format found.",
          });
        }
        res.header(
          "Content-Disposition",
          `attachment; filename="${mediaData.title}.mp4"`
        );
        res.header("Content-Type", "video/mp4");

        const videoStream = (
          await axios({
            url: mediaData.video,
            method: "GET",
            responseType: "stream",
          })
        ).data;

        videoStream.pipe(res);
      }
    }
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({
      valid: false,
      message: "Download failed.",
    });
  }
});

module.exports = router;
