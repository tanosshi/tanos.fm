/** @file index.js
 * @description The server file for tanos.fm, handles every request and functionality.
 */

"use strict";
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");

const fs = require("fs");
const path = require("path");

const rateLimitStore = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const sec = 6 * 10;
  const windowMs = sec * 1000;
  const maxRequests = sec / 10 + 1 * 10;

  const requests = rateLimitStore.get(ip) || [];

  const recentRequests = requests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0];
    const timeLeft = Math.ceil((windowMs - (now - oldestRequest)) / 1000);

    return res.status(429).json({
      valid: false,
      message: `Rate limit exceeded. Please wait ${timeLeft} seconds before trying again.`,
      timeLeft,
    });
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  if (Math.random() < 0.01) {
    for (const [ip, requests] of rateLimitStore.entries()) {
      const recent = requests.filter((time) => now - time < windowMs);
      if (recent.length === 0) {
        rateLimitStore.delete(ip);
      } else {
        rateLimitStore.set(ip, recent);
      }
    }
  }

  next();
};

// -- Importing all the code, seperated them for better organization and maintainability
const { Client } = require("lrclib-api");
const lrcClient = new Client();

const { ytmp3, ytmp4, ttdl, igdl } = require("ruhend-scraper");
const getYoutubeInfo = require("./services/info/getYoutubeInfo.js");
const getSpotifyInfo = require("./services/info/getSpotifyInfo.js");
const getSpotifyAccessToken = require("./services/info/getSpotifyAccessToken.js");
const getSoundCloudInfo = require("./services/info/getSoundCloudInfo.js");
const getAlbumCoverFromSoundCloud = require("./services/albums/getAlbumCoverFromSoundCloud.js");
const getAlbumCoverFromLastFM = require("./services/albums/getAlbumCoverFromLastFM.js");
const { searchQQMusic, searchNetease } = require("./services/lyrics/search.js");
const getNeteaseCloudMusicLyrics = require("./services/lyrics/getNeteaseCloudMusicLyrics.js");

// -- Unnecessary but might be fixing something
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

// -- Loading the site
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "build")));

// -- Second part of importing all the codes
const fetchRoutes = require("./functions/fetch");
const downloadRoutes = require("./functions/download");
const streamRoutes = require("./functions/stream");

app.use("/fetch", fetchRoutes);
app.use("/download", downloadRoutes);
app.use("/stream", streamRoutes);

// -- Load the built static page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

app.use(rateLimiter);

// -- Small utility to clean up generated files
const cleanupTempFiles = () => {
  const tempFilePatterns = [
    /^temp_cover_.*\.png$/,
    /^temp_output.*$/,
    /^temp_.*\.mp3$/,
  ];

  const dirsToCheck = [
    "..",
    ".",
    "/",
    "./server",
    "./client",
    "../server",
    "../client",
    "../server/functions",
    "./functions",
    "./temp",
    "./tmp",
  ];

  dirsToCheck.forEach((dir) => {
    fs.readdir(dir, (err, files) => {
      if (err) return;

      files.forEach((file) => {
        if (tempFilePatterns.some((pattern) => pattern.test(file))) {
          const filePath = path.join(dir, file);
          fs.unlink(filePath, (err) => {
            if (err && err.code !== "ENOENT") {
              console.error(
                `Critical error deleting temp file ${filePath}:`,
                err
              );
            }
          });
        }
      });
    });
  });
};

setInterval(cleanupTempFiles, 5 * 60 * 1000); // Toggle
cleanupTempFiles(); // Toggle

// -- Used by a couple codes, append any new domains here
function isValidUrl(url) {
  try {
    new URL(url);
    const supportedDomains = [
      "youtube.com",
      "youtu.be",
      "music.youtube.com",
      "soundcloud.com",
      "spotify.com",
      "spoti.fy",
      "music.apple.com",
      "tiktok.com",
      "vm.tiktok.com",
      "cn.tiktok.com",
      "cn.tiktok.com",
      "instagram.com",
      "instagr.am",
      "twitter.com",
      "x.com",
      "twitterfx.com",
      "fxtwitter.com",
    ];
    const hostname = new URL(url).hostname;
    return supportedDomains.some((domain) => hostname.includes(domain));
  } catch (err) {
    return false;
  }
}

// -- Create a log, it's stated in the ToS that it'll be logged anyway
function logToHistory(requestData) {
  const historyPath = path.join(__dirname, "history.json");
  let history = [];

  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    } catch (error) {
      console.error("Error reading history.json:", error);
    }
  }

  history.push({
    timestamp: new Date().toISOString(),
    url: requestData.url,
    success: requestData.success,
    mediaType: requestData.mediaType,
    userIP: requestData.userIP,
  });

  if (history.length > 1000) {
    history = history.slice(-1000);
  }

  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Error writing to history.json:", error);
  }
}

// -- Create a pattern for search variations, to grab the best results
function generateSearchVariations(title, artist) {
  const variations = [];

  const cleanTitle = title
    .replace(/['"!@#$%^&*()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const cleanArtist = artist
    ? artist
        .replace(/['"!@#$%^&*()]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  if (cleanArtist) {
    variations.push(`${cleanTitle} ${cleanArtist}`);
  }

  variations.push(cleanTitle);

  const noParentheses = cleanTitle
    .replace(/\([^)\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]*\)/g, "")
    .replace(/\[[^\]\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]*\]/g, "")
    .trim();

  if (noParentheses !== cleanTitle) {
    if (cleanArtist) {
      variations.push(`${noParentheses} ${cleanArtist}`);
    }
    variations.push(noParentheses);
  }

  return [...new Set(variations)];
}

// -- Translation part.
const wanakana = require("wanakana");
const translate = require("@iamtraction/google-translate");

async function translateAndRomanize(lrcContent) {
  const lines = lrcContent.split("\n");
  const processedLines = [];

  for (const line of lines) {
    const match = line.match(/(\[\d{2}:\d{2}.\d{2}\])(.*)/);
    if (!match) {
      processedLines.push(line);
      continue;
    }

    const [_, timestamp, text] = match;
    if (!text.trim()) {
      processedLines.push(line);
      continue;
    }

    try {
      const cleanedText = text.replace(/\([^)]*\)/g, "").trim();

      let processedText = cleanedText
        .replace(/ no /g, " の ")
        .replace(/ ni /g, " に ")
        .replace(/ wo /g, " を ")
        .replace(/no(\S)/g, "の$1")
        .replace(/ni(\S)/g, "に$1")
        .replace(/wo(\S)/g, "を$1");

      const segments = processedText
        .split(/([a-zA-Z]+|[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+|\s+)/g)
        .filter((segment) => segment.length > 0);

      let romanizedText = "";
      for (const segment of segments) {
        if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(segment)) {
          romanizedText += wanakana.toRomaji(segment);
        } else {
          romanizedText += segment;
        }
      }

      romanizedText = romanizedText
        .replace(/\s+/g, " ")
        .replace(/no\s+/g, " no ")
        .replace(/ni\s+/g, " ni ")
        .replace(/wo\s+/g, " wo ")
        .replace(/\s+/g, " ")
        .trim();

      try {
        const result = await translate(cleanedText, { from: "ja", to: "en" });
        const translation = result.text;

        processedLines.push(`${timestamp}${romanizedText} (${translation})`);
      } catch (err) {
        console.warn("Translation failed:", err);
        processedLines.push(`${timestamp}${romanizedText}`);
      }
    } catch (error) {
      console.error("Processing error:", error);
      processedLines.push(line);
    }
  }

  return processedLines.join("\n");
}

function sanitizeFilename(filename) {
  const romaji = wanakana.toRomaji(filename);
  return romaji.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
}

// -- cba to explain this, it's a lyrics endpoint thats all
app.get("/lyrics", async (req, res) => {
  try {
    console.log("Lyrics request received:", req.query);
    const { url, romanized } = req.query;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Please provide a song title",
      });
    }

    let clean_url = url.replace(" - Topic", "").trim().replace(" - Ep", "");

    let artist_name = "";
    let track_name = "";
    const dashIndex = clean_url.indexOf(" - ");
    if (dashIndex !== -1) {
      artist_name = clean_url.substring(dashIndex + 3).trim();
      track_name = clean_url.substring(0, dashIndex).trim();
    } else {
      track_name = clean_url;
    }

    const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(
      track_name + artist_name
    );

    if (hasJapanese) {
      console.log(
        "Japanese characters detected, using specific search methods"
      );
      try {
        const query = {
          track_name: track_name,
          artist_name: artist_name,
        };

        console.log("Attempting exact match with:", query);
        const syncedLyrics = await lrcClient.getSynced(query);
        if (syncedLyrics && typeof syncedLyrics === "string") {
          if (romanized === "true") {
            console.log("Processing romanization and translation...");
            const processedLyrics = await translateAndRomanize(syncedLyrics);
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader("Content-Type", "text/plain");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${safeFilename}.lrc"`
            );
            return res.send(processedLyrics);
          } else {
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader("Content-Type", "text/plain");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${safeFilename}.lrc"`
            );
            return res.send(syncedLyrics);
          }
        }
      } catch (error) {
        console.log("Exact match failed:", error.message);
      }
    }

    const searchVariations = generateSearchVariations(track_name, artist_name);
    console.log("Generated search variations:", searchVariations);

    const limitedVariations = hasJapanese
      ? searchVariations.slice(0, 3)
      : searchVariations.slice(0, 5);
    console.log("Using variations:", limitedVariations);

    for (const searchQuery of limitedVariations) {
      try {
        const query = {
          track_name: searchQuery,
          artist_name: artist_name,
        };

        console.log("Attempting LrcLib with:", query);
        const syncedLyrics = await lrcClient.getSynced(query);
        if (syncedLyrics && typeof syncedLyrics === "string") {
          if (romanized === "true") {
            console.log("Processing romanization and translation...");
            const processedLyrics = await translateAndRomanize(syncedLyrics);
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader("Content-Type", "text/plain");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${safeFilename}.lrc"`
            );
            return res.send(processedLyrics);
          } else {
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader("Content-Type", "text/plain");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${safeFilename}.lrc"`
            );
            return res.send(syncedLyrics);
          }
        }

        if (hasJapanese) {
          console.log("Attempting QQ Music with exact match:", track_name);
          const songMid = await searchQQMusic(track_name);
          if (songMid) {
            const qqLyrics = await getQQMusicLyrics(songMid);
            if (
              qqLyrics &&
              qqLyrics.original &&
              typeof qqLyrics.original === "string"
            ) {
              if (romanized === "true") {
                console.log("Processing romanization and translation...");
                const processedLyrics = await translateAndRomanize(
                  qqLyrics.original
                );
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(qqLyrics.original);
              }
            }
          }
        } else {
          console.log("Attempting QQ Music with:", searchQuery);
          const songMid = await searchQQMusic(searchQuery);
          if (songMid) {
            const qqLyrics = await getQQMusicLyrics(songMid);
            if (
              qqLyrics &&
              qqLyrics.original &&
              typeof qqLyrics.original === "string"
            ) {
              if (romanized === "true") {
                console.log("Processing romanization and translation...");
                const processedLyrics = await translateAndRomanize(
                  qqLyrics.original
                );
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(qqLyrics.original);
              }
            }
          }
        }

        if (hasJapanese) {
          console.log("Attempting NetEase with exact match:", track_name);
          const songId = await searchNetease(track_name);
          if (songId) {
            const neteaseLyrics = await getNeteaseCloudMusicLyrics(songId);
            if (
              neteaseLyrics &&
              neteaseLyrics.original &&
              typeof neteaseLyrics.original === "string"
            ) {
              if (romanized === "true") {
                console.log("Processing romanization and translation...");
                const processedLyrics = await translateAndRomanize(
                  neteaseLyrics.original
                );
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(neteaseLyrics.original);
              }
            }
          }
        } else {
          console.log("Attempting NetEase with:", searchQuery);
          const songId = await searchNetease(searchQuery);
          if (songId) {
            const neteaseLyrics = await getNeteaseCloudMusicLyrics(songId);
            if (
              neteaseLyrics &&
              neteaseLyrics.original &&
              typeof neteaseLyrics.original === "string"
            ) {
              if (romanized === "true") {
                console.log("Processing romanization and translation...");
                const processedLyrics = await translateAndRomanize(
                  neteaseLyrics.original
                );
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader("Content-Type", "text/plain");
                res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename}.lrc"`
                );
                return res.send(neteaseLyrics.original);
              }
            }
          }
        }
      } catch (variationError) {
        console.log(
          "Error with variation:",
          searchQuery,
          variationError.message
        );
        continue;
      }
    }

    console.log("No lyrics found after trying variations");
    return res.status(404).json({
      success: false,
      message: "No lyrics found for this song",
    });
  } catch (error) {
    console.error("Lyrics error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process lyrics request",
    });
  }
});

// -- push the files
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
