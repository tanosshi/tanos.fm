"use strict";

const ytdl = require("@distube/ytdl-core");

async function getYoutubeInfo(url, isMusic = false) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error("Invalid YouTube URL");
    }

    const info = await ytdl.getInfo(ytdl.getURLVideoID(url));

    if (!info || !info.formats || !info.formats.length) {
      console.error("Failed to retrieve valid video formats.");
      throw new Error(
        "Could not retrieve video formats. The video may be region-locked or unavailable."
      );
    }

    const durationInSeconds = parseInt(info.videoDetails.lengthSeconds);
    const isLongVideo = durationInSeconds > 1800;

    let bestFormat;

    if (isMusic) {
      bestFormat = ytdl.chooseFormat(info.formats, {
        quality: "highestaudio",
      });
    } else {
      bestFormat = ytdl.chooseFormat(info.formats, {
        quality: "highestvideo",
      });

      if (!bestFormat) {
        bestFormat = ytdl.chooseFormat(info.formats, {
          quality: "highest",
          filter: "video",
        });
      }
    }

    if (!bestFormat) throw new Error("No suitable format found");

    let estimatedSize = "Unknown";
    if (bestFormat.contentLength) {
      estimatedSize = `~${(bestFormat.contentLength / 1024 / 1024).toFixed(
        1
      )} MB`;
    } else {
      if (isMusic) {
        const bitrate = bestFormat.audioBitrate || 128;
        const sizeInBytes = (bitrate * 1000 * durationInSeconds) / 8;
        estimatedSize = `~${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
      } else {
        const qualityMultiplier = {
          "144p": 4,
          "240p": 8,
          "360p": 12,
          "480p": 20,
          "720p": 45,
          "1080p": 90,
          "1440p": 150,
          "2160p": 300,
        };

        let multiplier = 45;
        if (bestFormat.qualityLabel) {
          const quality = bestFormat.qualityLabel.toLowerCase();
          for (const [label, value] of Object.entries(qualityMultiplier)) {
            if (quality.includes(label.replace("p", ""))) {
              multiplier = value;
              break;
            }
          }
        }

        const sizeInMB = (multiplier * durationInSeconds) / 60;
        estimatedSize = `~${sizeInMB.toFixed(1)} MB`;
      }
    }

    const thumbnail =
      info.videoDetails.thumbnails && info.videoDetails.thumbnails.length > 0
        ? info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
            .url
        : null;

    return {
      title:
        info.videoDetails.title +
        (info.videoDetails.author?.name
          ? " - " + info.videoDetails.author.name.replace(" - Topic", "")
          : ""),
      duration: new Date(parseInt(info.videoDetails.lengthSeconds) * 1000)
        .toISOString()
        .substr(11, 8),
      quality: isMusic
        ? bestFormat.audioBitrate
          ? `${bestFormat.audioBitrate}kbps`
          : bestFormat.audioQuality === "AUDIO_QUALITY_LOW"
          ? "128kbps"
          : bestFormat.audioQuality === "AUDIO_QUALITY_MEDIUM"
          ? "192kbps"
          : bestFormat.audioQuality === "AUDIO_QUALITY_HIGH"
          ? "256kbps"
          : "128kbps"
        : `${bestFormat.qualityLabel || bestFormat.quality || "HD"}`,
      size: estimatedSize,
      hasLyrics: info.videoDetails.category === "Music",
      thumbnail: thumbnail,
      url: url,
      format: bestFormat,
      downloadUrl: bestFormat.url,
      durationError: isLongVideo
        ? "Video is too long. Maximum duration for MP4 download is 30 minutes."
        : null,
    };
  } catch (error) {
    console.error("Error getting YouTube info:", error);
    if (error.message.includes("age-restricted")) {
      throw new Error("This video is age-restricted");
    } else if (error.message.includes("private")) {
      throw new Error("This video is private");
    } else if (
      error.message.includes("not found") ||
      error.message.includes("404")
    ) {
      throw new Error("Video not found");
    } else if (error.message.includes("Invalid YouTube URL")) {
      throw new Error("Invalid YouTube URL");
    }
    throw new Error("Could not fetch video information");
  }
}

module.exports = getYoutubeInfo;
