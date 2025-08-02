/** @file download.js
 * @description Handles downloading media files from various sources.
 * TODO: [Line 111] Add as many metadata to the mp3 downloading as possible.
 * TODO: Fix low quality YouTube downloads.
 * TODO: Clean up the code, remove unused variables and imports.
 * TODO: Add more error handling and logging.
 */

const express = require("express");
const router = express.Router();
const scdl = require("soundcloud-downloader").default;
const ytdl = require("@distube/ytdl-core");
const { TwitterDL } = require("twitter-downloader");
const axios = require("axios");
const getSpotifyAccessToken = require("../services/info/getSpotifyAccessToken.js");
const getSpotifyInfo = require("../services/info/getSpotifyInfo.js");

const getAlbumCoverFromLastFM = require("../services/albums/getAlbumCoverFromLastFM.js");
const getAlbumCoverFromSoundCloud = require("../services/albums/getAlbumCoverFromSoundCloud.js");

const ffmpeg = require("fluent-ffmpeg");
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

const sanitizeFilename = (filename) => {
  if (!filename) return "untitled";
  // might aswell make chatgpt do this
  return (
    filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") // Remove invalid Windows filename characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[\u{0080}-\u{FFFF}]/gu, "") // Remove non-ASCII characters
      .replace(/_+/g, "_") // Replace multiple underscores with a single one
      .replace(/^[_.]|[_.]$/g, "") // Remove leading/trailing dots and underscores
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

        let artworkFailed = false;
        let imageBuffer = null;
        let genre = null;

        const info = await ytdl.getInfo(ytdl.getURLVideoID(url));
        const videoTitle = sanitizeFilename(info.videoDetails.title);

        if (format === "mp3") {
          const info = await ytdl.getInfo(ytdl.getVideoID(url));
          const videoTitle = sanitizeFilename(info.videoDetails.title);
          const author = sanitizeFilename(
            info.videoDetails.author?.name || "Unknown_Artist"
          );

          console.log(`Downloading MP3: ${videoTitle} by ${author}`);

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

          ffmpegCommand.outputOptions([
            "-metadata",
            `title=${escapeMetadata(videoTitle)}`,
            "-metadata",
            `artist=${escapeMetadata(author)}`,
            "-metadata",
            `album=${escapeMetadata(videoTitle)}`,
            "-metadata",
            "comment=Downloaded via tanos.fm",
          ]);

          ffmpegCommand.pipe(res, { end: true });
        } else if (format === "mp4") {
          console.log("Downloading MP4 from YouTube");

          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${videoTitle}.mp4"`
          );
          res.setHeader("Content-Type", "video/mp4");

          const videoStream = ytdl(url, {
            ...ytdlOptions,
            quality: "highest",
            filter: "audioandvideo",
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

    res.redirect(url);
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
