/** @file download.js
 * @description Handles downloading media files from various sources.
 * TODO: Add option to download anything other than mp4 or mp3, e.g. FLAC, webm or similar.
 */

const express = require("express");
const router = express.Router();
const scdl = require("soundcloud-downloader").default;
const ytdl = require("@distube/ytdl-core");
const { TwitterDL } = require("twitter-downloader");
const { Readable } = require("stream");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");
const getSpotifyAccessToken = require("../services/info/getSpotifyAccessToken.js");
const getSpotifyInfo = require("../services/info/getSpotifyInfo.js");

const getAlbumCoverFromLastFM = require("../services/albums/getAlbumCoverFromLastFM.js");
const getAlbumCoverFromSoundCloud = require("../services/albums/getAlbumCoverFromSoundCloud.js");

const ffmpeg = require("fluent-ffmpeg");
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

const tempFiles = new Set();

const Converter = require("ascii-fullwidth-halfwidth-convert");
const conv = new Converter();

const sanitizeFilename = (filename) => {
  if (!filename) return "untitled";
  // might aswell make chatgpt do this
  return (
    filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") // Remove invalid Windows filename characters
      .replace(/[\u{0080}-\u{FFFF}]/gu, "") // Remove non-ASCII characters
      .replace(/_+/g, "_") // Replace multiple underscores with a single one
      .replace(/^[_.]|[_.]$/g, "") // Remove leading/trailing dots and underscores
      .replace("- EP", "")
      .replace("- Single", "")
      .replace("- Album", "")
      .replace("- Playlist", "")
      .replace("- Video", "")
      .replace("- Official", "")
      .replace("- Official Music Video", "")
      .replace("- Lyrics", "")
      .replace("- Live", "")
      .replace("- Topic", "")
      .substring(0, 100) // Limit length to 100 characters
      .trim() || "untitled"
  ); // Fallback to 'untitled' if empty after sanitization
};

const ytdlOptions = {
  quality: "highestaudio",
  filter: "audioonly",
  highWaterMark: 1 << 25,
  requestOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  },
};

router.get("/", async (req, res) => {
  console.log("Starting download for", req.query);
  let { url, format } = req.query;

  if (!url) {
    return res.status(400).json({
      valid: false,
      message: "URL is required.",
    });
  }

  if (!format || !["mp3", "mp4"].includes(format)) {
    return res.status(400).json({
      valid: false,
      message: "Invalid format. Must be 'mp3' or 'mp4'.",
    });
  }

  const fileHostingServices = [
    "mega",
    "mediafire",
    "zippyshare",
    "4shared",
    "drive",
    "dropbox",
  ];
  if (fileHostingServices.some((service) => url.includes(service))) {
    return res.redirect(url);
  }

  if (
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
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      try {
        if (!ytdl.validateURL(url)) {
          return res.status(400).json({
            valid: false,
            message: "Invalid YouTube URL",
          });
        }

        const info = await ytdl.getInfo(ytdl.getURLVideoID(url));
        const videoTitle = sanitizeFilename(info.videoDetails.title);

        if (format === "mp3") {
          const info = await ytdl.getInfo(ytdl.getVideoID(url));
          const videoTitle = sanitizeFilename(info.videoDetails.title);
          const author = sanitizeFilename(
            info.videoDetails.author?.name || "Unknown_Artist"
          );

          console.log(`Downloading MP3: ${videoTitle} by ${author}`);

          let artworkFailed = false;
          let imageBuffer = null;
          let genre = null;
          try {
            const lastFMData = await getAlbumCoverFromLastFM(
              author,
              videoTitle,
              process.env.LASTFM_API_KEY
            );
            genre = lastFMData.genre;
            console.log(lastFMData);
            imageBuffer = lastFMData.imageBuffer;
          } catch (error) {
            console.log("Failed to get LastFM artwork:", error);
            artworkFailed = true;
          }

          if (!imageBuffer && !artworkFailed) {
            try {
              console.log(
                "No album data found on Last.fm, trying SoundCloud..."
              );
              imageBuffer = await getAlbumCoverFromSoundCloud(
                author,
                videoTitle
              );
              if (!imageBuffer) {
                console.log("No artwork found on SoundCloud either.");
                artworkFailed = true;
              }
            } catch (error) {
              console.log("Failed to get SoundCloud artwork:", error);
              artworkFailed = true;
            }
          }

          const safeFilename = `${videoTitle}.mp3`;
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${safeFilename}"`
          );
          res.setHeader("Content-Type", "audio/mpeg");

          const audioStream = ytdl(url, ytdlOptions);

          audioStream.on("error", (error) => {
            console.error("YouTube stream error:", error);
            if (!res.headersSent) {
              res.status(500).json({
                valid: false,
                message: "Error streaming YouTube audio",
                error: error.message,
              });
            }
          });

          const ffmpegCommand = ffmpeg(audioStream)
            .audioCodec("libmp3lame")
            .audioBitrate(320)
            .format("mp3")
            .on("start", () => console.log("Starting MP3 conversion..."))
            .on("error", (err) => {
              console.error("FFmpeg error:", err);
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "Error converting audio",
                  error: err.message,
                });
              }
            });

          // go go go
          const escapeMetadata = (str) => {
            return String(str)
              .replace(/=/g, "\\=") // Escape equals signs
              .replace(/:/g, "\\:") // Escape colons
              .replace(/#/g, "\\#") // Escape hashes
              .replace(/\n/g, " ") // Remove newlines
              .trim();
          };

          if (!imageBuffer || artworkFailed) {
            ffmpegCommand.outputOptions([
              "-metadata",
              `title=${escapeMetadata(videoTitle)}`,
              "-metadata",
              `artist=${escapeMetadata(author)}`,
              "-metadata",
              `album=${escapeMetadata(videoTitle)}`,
              "-metadata",
              "comment=Downloaded via tanos.fm - No Artwork",
            ]);

            return ffmpegCommand.pipe(res, { end: true });
          }
          try {
            const pngBuffer = await sharp(imageBuffer).png().toBuffer();
            if (!pngBuffer) pngBuffer = imageBuffer;

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
              .addOutputOption("-metadata", `title=${videoTitle}`)
              .addOutputOption("-metadata", `artist=${author}`)
              .addOutputOption("-metadata", `album=${videoTitle} - ${author}`)
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
                  if (err)
                    console.error("Error deleting temp image file:", err);
                });
                fs.unlink(tempOutputPath, (err) => {
                  if (err)
                    console.error("Error deleting temp output file:", err);
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
              .addOutputOption("-metadata", `title=${videoTitle}`)
              .addOutputOption("-metadata", `artist=${author}`)
              .addOutputOption("-metadata", `album=${videoTitle} - ${author}`)
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
          console.log("Downloading MP4 from YouTube");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${conv.toHalfWidth(
              videoTitle.normalize("NFKC")
            )}.mp4"`
          );
          res.setHeader("Content-Type", "video/mp4");
          const bestFormat = ytdl.chooseFormat(info.formats, {
            quality: "highestvideo",
          });

          const videoStream = ytdl.downloadFromInfo(info, {
            ...ytdlOptions,
            format: bestFormat,
          });

          videoStream.on("error", (error) => {
            console.error("YouTube stream error:", error);
            if (!res.headersSent) {
              res.status(500).json({
                valid: false,
                message: "Error streaming YouTube video",
                error: error.message,
              });
            }
          });

          videoStream.pipe(res);

          videoStream.on("end", () => {
            console.log("YouTube download completed successfully");
          });
        }
      } catch (error) {
        console.error("Error in YouTube download:", error);
        if (!res.headersSent) {
          res.status(500).json({
            valid: false,
            message: "Error processing YouTube download",
            error: error.message,
          });
        }
      }
      return;
    }

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
      url.includes("tiktokcdn.com") ||
      url.includes("tik") ||
      url.includes("tikwm.com") ||
      url.includes("akamaized.net") ||
      url.includes("akamai") ||
      url.includes("cdn") ||
      url.includes("rapidcdn") ||
      url.includes("instagram.com")
    ) {
      res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
      res.setHeader("Content-Type", "video/mp4");
      try {
        const response = await axios({
          method: "get",
          url,
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
        `attachment; filename="${
          result.result.description || "Twitter Media"
        }.mp4"`
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

    try {
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      let ext = "";
      const urlPath = new URL(url).pathname;
      const extMatch = urlPath.match(/\.(\w{2,5})(?:$|\?)/);
      if (extMatch) {
        ext = `.${extMatch[1]}`;
      } else {
        const contentType = response.headers["content-type"] || "";
        if (contentType.includes("video")) ext = ".gif";
        else if (contentType.includes("image")) ext = ".png";
        else ext = "";
      }

      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="download${ext}"`
      );
      res.setHeader("Content-Type", contentType);
      response.data.pipe(res);
    } catch (error) {
      console.error("Error downloading media:", error);
      return res.status(500).json({
        valid: false,
        message: "Failed to download media " + error,
      });
    }
    return;
    res.status(404).json({
      valid: false,
      message: "Couldnt identify the URL, sending you to the URL.",
    });
    return;
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        valid: false,
        message: "Download failed",
        error: error.message,
      });
    }
  }
});

module.exports = router;
