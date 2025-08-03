const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const {
  searchQQMusic,
  searchNetease,
} = require("../services/lyrics/search.js");
const getNeteaseCloudMusicLyrics = require("../services/lyrics/getNeteaseCloudMusicLyrics.js");

router.get("/", async (req, res) => {
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

module.exports = router;
