/** @file download.js
 * @description Handles downloading media files from various sources.
 * TODO: Add option to download anything other than mp4 or mp3, e.g. FLAC, webm or similar.
 * TODO: Google Drive direct download support (download to server then send to user)
 * TODO: Support Bandcamp downloads
 * TODO: Fix title/album/artist metadata **((UsE LASTFM API.))
 */

const express = require("express");
const router = express.Router();
const scdl = require("soundcloud-downloader").default;
const ytdl = require("@distube/ytdl-core");
const { TwitterDL } = require("twitter-downloader");
const redditscraper = require("@tanosshi/reddit-scraper");
const { Readable } = require("stream");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");
const archiver = require("archiver");
const getSpotifyAccessToken = require("../services/info/getSpotifyAccessToken.js");
const getSpotifyInfo = require("../services/info/getSpotifyInfo.js");

const getAlbumCoverFromLastFM = require("../services/albums/getAlbumCoverFromLastFM.js");
const getAlbumCoverFromSoundCloud = require("../services/albums/getAlbumCoverFromSoundCloud.js");

const ffmpeg = require("fluent-ffmpeg");
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

const tempFiles = new Set();

const Converter = require("ascii-fullwidth-halfwidth-convert");
const conv = new Converter();

let currentDir = __dirname;
let parentOfServer = null;

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

  if (
    !format ||
    !["mp3", "mp4", "alt", "txt", "full", "zip"].includes(format)
  ) {
    return res.status(400).json({
      valid: false,
      message: "Invalid format.",
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

  if (url.includes(".redd")) {
    if (format == "mp4") {
      const result = await redditscraper.download(url, {
        outDir: "server/temp/",
      });

      if (result) {
        try {
          const file = fs.createReadStream(result);
          const filename = sanitizeFilename(result.split("\\").pop());
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          file.pipe(res);
          return;
        } catch {
          while (currentDir !== path.parse(currentDir).root) {
            const possible = path.join(currentDir, "server");
            if (
              fs.existsSync(possible) &&
              fs.lstatSync(possible).isDirectory()
            ) {
              parentOfServer = currentDir;
              break;
            }
            currentDir = path.dirname(currentDir);
          }

          const file = fs.createReadStream(parentOfServer + "\\" + result);
          const filename = sanitizeFilename(result.split("\\").pop());
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          file.pipe(res);
          return;
        }
      } else {
        res.status(500).json({
          valid: false,
          message: "Failed to download Reddit media",
        });
        return;
      }
      return;
    } else if (format == "txt") {
      const result = await redditscraper.scrape(url, {
        outDir: "server/temp/",
        mode: "comments",
      });
      const file = fs.createReadStream(result.commentsPath);
      const filename = sanitizeFilename(result.commentsPath.split("\\").pop());
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      file.pipe(res);
      return;
    } else if (format == "zip" || format == "full") {
      const result = await redditscraper.scrape(url, {
        outDir: "server/temp/",
        mode: "all",
      });

      const filename = sanitizeFilename(
        result.commentsPath
          .split("\\")
          .pop()
          .replace("_comments.txt", "")
          .replace(".comments.txt", "")
      );
      const zipFilename = `${filename}.zip`;

      /*const file = fs.createReadStream(result.commentsPath);
      const filename = sanitizeFilename(result.commentsPath.split("\\").pop());*/

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${zipFilename}"`
      );
      res.setHeader("Content-Type", "application/zip");

      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      archive.on("error", (err) => {
        console.error("Archiver error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            valid: false,
            message: "Failed to create ZIP archive",
            error: err.message,
          });
        }
      });

      archive.pipe(res);

      // result.imagePath result.commentsPath result.textPath should be all i added in the api
      if (result.imagePath && fs.existsSync(result.imagePath)) {
        archive.file(result.imagePath, {
          name: path.basename(result.imagePath),
        });
      }
      if (result.commentsPath && fs.existsSync(result.commentsPath)) {
        archive.file(result.commentsPath, {
          name: path.basename(result.commentsPath),
        });
      }
      if (result.textPath && fs.existsSync(result.textPath)) {
        archive.file(result.textPath, { name: path.basename(result.textPath) });
      }

      archive.finalize();
      return;
    }
    return;
  }

  if (
    url.includes("instagram.com") ||
    url.includes("rapidcdn") ||
    url.includes("cdn")
  ) {
    url = url + "#format=mp4";
  }
  try {
    const isFromSpotify = url.includes("#from_spotify");
    const isFromSoundCloud = url.includes("soundcloud.com");

    // YouTube
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

        // (gonna comment for my own sake and easier reading)

        // The MP3 part
        if (format === "mp3") {
          // Grab info about the __VIDEO__ first
          const info = await ytdl.getInfo(ytdl.getVideoID(url));

          // Grab video title (This'll be replaced by Last.fm/Spotify if available)
          const videoTitle = sanitizeFilename(info.videoDetails.title);

          // Grab author for metadata, saves a partial search on Last.fm (i guess)
          const author = sanitizeFilename(
            info.videoDetails.author?.name || "Unknown_Artist"
          );

          // log for myself
          console.log(`Downloading MP3: ${videoTitle} by ${author}`);

          // Set variables
          let artworkFailed = false;
          let imageBuffer = null;
          let genre = null;

          // Attempt to grab album cover
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

          // Second attempt to grab album cover
          if (!imageBuffer && artworkFailed) {
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

          // Set headers for early ffmpeg output
          const safeFilename = `${videoTitle}.mp3`;
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${safeFilename}"`
          );
          res.setHeader("Content-Type", "audio/mpeg");

          const audioStream = ytdl(url, ytdlOptions);

          // Download for conversion
          audioStream.on("error", (error) => {
            console.error("YouTube stream error:", error);
            if (!res.headersSent) {
              res.status(500).json({
                valid: false,
                message: "Download error on server side",
                error: "BFR_FMPG:" + error.message,
              });
            }
          });

          // !!!!! FFMPEg here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

          // Turn into MP3 (future will be others like webm, flac, etc)
          const ffmpegCommand = ffmpeg(audioStream)
            .audioCodec("libmp3lame")
            .audioBitrate("320k")
            .format("mp3")
            .on("start", (cmd) => {
              console.log("Starting MP3 conversion...");
              console.log("FFmpeg command:", cmd);
            })
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

          // change things that might interfere
          const escapeMetadata = (str) => {
            let value = String(str || "");
            value = value.replace(/^[-\s]+/, "");
            return value
              .replace(/=/g, "\\=") // Escape equals signs
              .replace(/:/g, "\\:") // Escape colons
              .replace(/#/g, "\\#") // Escape hashes
              .replace(/\n/g, " ") // Remove newlines
              .trim();
          };

          // Artwork-less output
          if (!imageBuffer || artworkFailed) {
            // Create options
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

            // Generate temp-file name
            const randomFileNameNoArt = crypto.randomBytes(16).toString("hex");
            const tempOutputPathNoArt = path.join(
              __dirname,
              `temp_output_${randomFileNameNoArt}.mp3`
            );
            tempFiles.add({ path: tempOutputPathNoArt, timestamp: Date.now() });

            // Start conversion
            ffmpegCommand
              .on("start", (cmd) => {
                console.log("FFmpeg (no artwork) started");
                console.log("FFmpeg (no artwork) command:", cmd);
              })
              .on("end", () => {
                const readStream = fs.createReadStream(tempOutputPathNoArt);
                readStream.pipe(res);
                readStream.on("end", () => {
                  tempFiles.delete({ path: tempOutputPathNoArt });
                  fs.unlink(tempOutputPathNoArt, (err) => {
                    if (err)
                      console.error("Error deleting temp output file:", err);
                  });
                });
              })
              .on("error", (err) => {
                console.error("FFmpeg error (no artwork):", err);
                tempFiles.delete({ path: tempOutputPathNoArt });
                fs.unlink(tempOutputPathNoArt, (unlinkErr) => {
                  if (unlinkErr)
                    console.error(
                      "Error deleting temp output file:",
                      unlinkErr
                    );
                });
                if (!res.headersSent) {
                  res.status(500).json({
                    valid: false,
                    message: "Error converting audio",
                    error: err.message,
                  });
                }
              })
              .saveToFile(tempOutputPathNoArt);

            return;
          }

          // Artwork-full output
          try {
            // Create proper buffer
            let pngBuffer;
            try {
              pngBuffer = await sharp(imageBuffer).png().toBuffer();
            } catch (e) {
              pngBuffer = imageBuffer;
            }

            console.log("Sharp processing complete.");

            // Random file name
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

            // FFmpeg part with artwork...................
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
              .addOutputOption(
                "-metadata",
                `title=${escapeMetadata(videoTitle)}`
              )
              .addOutputOption("-metadata", `artist=${escapeMetadata(author)}`)
              .addOutputOption(
                "-metadata",
                `album=${escapeMetadata(`${videoTitle}`)}`
              )
              .addOutputOption("-metadata", `genre=${genre || "Unknown"}`)
              .toFormat("mp3")
              .on("start", (cmd) => {
                console.log("FFmpeg processing started");
                console.log("FFmpeg (with artwork) command:", cmd);
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
            // As a fallback, save the converted audio to a temp file and stream
            // it. This avoids piping to stdout which can fail on Windows
            // (as long as it works, if i find another error ill add another fallb.).

            console.error("Error processing artwork:", error);

            const randomFileNameFb = crypto.randomBytes(16).toString("hex");
            const tempOutputPathFb = path.join(
              __dirname,
              `temp_output_${randomFileNameFb}.mp3`
            );
            tempFiles.add({ path: tempOutputPathFb, timestamp: Date.now() });

            ffmpeg()
              .input(audioStream)
              .audioCodec("libmp3lame")
              .audioBitrate("320k")
              .addOutputOption(
                "-metadata",
                `title=${escapeMetadata(videoTitle)}`
              )
              .addOutputOption("-metadata", `artist=${escapeMetadata(author)}`)
              .addOutputOption(
                "-metadata",
                `album=${escapeMetadata(`${videoTitle} - ${author}`)}`
              )
              .addOutputOption("-metadata", `genre=${genre || "Unknown"}`)
              .toFormat("mp3")
              .on("start", (cmd) => {
                console.log("FFmpeg (fallback) command:", cmd);
              })
              .on("end", () => {
                const readStream = fs.createReadStream(tempOutputPathFb);
                readStream.pipe(res);
                readStream.on("end", () => {
                  tempFiles.delete({ path: tempOutputPathFb });
                  fs.unlink(tempOutputPathFb, (err) => {
                    if (err)
                      console.error("Error deleting temp output file:", err);
                  });
                });
              })
              .on("error", (err) => {
                console.error("FFmpeg error (fallback):", err);
                tempFiles.delete({ path: tempOutputPathFb });
                fs.unlink(tempOutputPathFb, (unlinkErr) => {
                  if (unlinkErr)
                    console.error(
                      "Error deleting temp output file:",
                      unlinkErr
                    );
                });
                if (!res.headersSent) {
                  res.status(500).json({
                    valid: false,
                    message: "FFmpeg error occurred.",
                  });
                }
              })
              .saveToFile(tempOutputPathFb);

            return res.status(500).json({
              valid: false,
              message: "Ended abruptly, try again if no download has started.",
            });
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
            quality: "highest",
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

    // SoundCloud (should have cover already)
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

    // Tiktok, instagram or any cdn related to it
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

    // Twitter
    if (url.includes("twitter.com") || url.includes("x.com")) {
      const result = await TwitterDL(url);
      let highestQualityMedia;
      let isTwtImage = false;
      try {
        if (
          result.result.media &&
          result.result.media[0] &&
          Array.isArray(result.result.media[0].videos) &&
          result.result.media[0].videos.length > 0
        ) {
          highestQualityMedia = result.result.media[0].videos.reduce(
            (prev, current) => (prev.bitrate > current.bitrate ? prev : current)
          );
        } else {
          highestQualityMedia = result.result.media[0].image;
          isTwtImage = true;
        }
      } catch {
        highestQualityMedia = result.result.media[0].image;
        isTwtImage = true;
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizeFilename(
          result.result.description || "Twitter Media"
        )}.${isTwtImage ? "jpg" : "mp4"}"`
      );
      res.setHeader("Content-Type", isTwtImage ? "image/png" : "video/mp4");

      try {
        const response = await axios({
          method: "get",
          url: isTwtImage ? highestQualityMedia : highestQualityMedia.url,
          responseType: "stream",
        });

        response.data.pipe(res);
      } catch (error) {
        console.error("Error downloading media:", error);
        return res.status(500).json({
          valid: false,
          message: "Failed to download media " + error,
        });
      }
      return;
    }

    // Spotify beforehand
    if (isFromSpotify) {
      url = url.replace("#from_spotify", "");
      format = "mp3";
    }

    // Spotify
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

    if (
      url.includes("pin.") ||
      url.includes("pinterest.") ||
      url.includes("pinimg.") ||
      url.includes("i.pin")
    ) {
      try {
        const response = await axios({
          method: "get",
          url,
          responseType: "stream",
        });

        const ext = (() => {
          const urlPath = new URL(url).pathname;
          const extMatch = urlPath.match(/\.(\w{2,5})(?:$|\?)/);
          if (extMatch) return `.${extMatch[1]}`;
          const contentType = response.headers["content-type"] || "";
          if (contentType.includes("image/jpeg")) return ".jpg";
          if (contentType.includes("image/png")) return ".png";
          if (contentType.includes("image/gif")) return ".gif";
          if (contentType.includes("video/mp4")) return ".mp4";
          return "";
        })();

        const randomFileName = `temp_pin_${crypto
          .randomBytes(8)
          .toString("hex")}${ext}`;
        const tempFilePath = path.join(__dirname + "/../temp/", randomFileName);
        tempFiles.add({ path: tempFilePath, timestamp: Date.now() });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        const num = Math.floor(Math.random() * 1000000000) + 1;

        writer.on("finish", () => {
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="pin${num}${ext}"`
          );
          res.setHeader(
            "Content-Type",
            response.headers["content-type"] || "application/octet-stream"
          );
          const readStream = fs.createReadStream(tempFilePath);
          readStream.pipe(res);
        });
        return;
      } catch (error) {
        console.error("Error downloading Pinterest media:", error);
        res.status(500).json({
          valid: false,
          message: "Sending you to alternative download, " + error,
        });
        return;
      }
    }

    // Anything else
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

        if (contentType.includes("image/jpeg")) ext = ".jpg";
        else if (contentType.includes("image/png")) ext = ".png";
        else if (contentType.includes("image/gif")) ext = ".gif";
        else if (contentType.includes("video/mp4")) ext = ".mp4";
        else ext = "";
      }

      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      if (res.headersSent) {
        return;
      }
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
