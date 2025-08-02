const express = require("express");
const router = express.Router();
const ytdl = require("ytdl-core");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ffmpeg = require("fluent-ffmpeg");
const { Readable } = require("stream");

const { TwitterDL } = require("twitter-downloader");

const tempDir = path.join(__dirname, "..", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const streamCache = new Map();

router.get("/", async (req, res) => {
  try {
    const { url, title } = req.query;

    const streamId = crypto.randomBytes(16).toString("hex");
    const filePath = path.join(tempDir, `${streamId}.mp4`);

    streamCache.set(streamId, {
      url,
      title,
      filePath,
      timestamp: Date.now(),
    });

    const videoStream = ytdl(url, {
      quality: "highest",
      filter: "videoandaudio",
    });

    videoStream.pipe(fs.createWriteStream(filePath));

    res.json({
      streamUrl: `video/${streamId}`,
    });
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({ error: "Failed to process video" });
  }
});

module.exports = router;
