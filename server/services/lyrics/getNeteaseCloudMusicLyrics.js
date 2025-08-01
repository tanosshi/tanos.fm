"use strict";

const axios = require("axios");

async function getNeteaseCloudMusicLyrics(songId) {
  try {
    const response = await axios.get(`https://music.163.com/api/song/lyric`, {
      params: {
        id: songId,
        lv: 1,
        tv: 1,
      },
      headers: {
        Referer: "https://music.163.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const lyricData = response.data;
    const lyric =
      lyricData.lrc && lyricData.lrc.lyric ? lyricData.lrc.lyric : null;
    const translatedLyric =
      lyricData.tlyric && lyricData.tlyric.lyric
        ? lyricData.tlyric.lyric
        : null;

    if (lyric || translatedLyric) {
      return {
        original: lyric,
        translated: translatedLyric,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching NetEase lyrics:", error);
    return null;
  }
}

module.exports = getNeteaseCloudMusicLyrics;
