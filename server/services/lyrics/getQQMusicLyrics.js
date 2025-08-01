"use strict";

const axios = require("axios");

async function getQQMusicLyrics(songMid) {
  try {
    const response = await axios.get(
      `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg`,
      {
        params: {
          songmid: songMid,
          pcachetime: new Date().getTime(),
          platform: "yqq",
          hostUin: 0,
          needNewCode: 0,
          ct: 20,
          cv: 1878,
        },
        headers: {
          Referer: "https://y.qq.com/portal/player.html",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const lyricData = response.data;
    const lyricBase64 = lyricData.lyric;
    const tlyricBase64 = lyricData.trans;

    if (lyricBase64) {
      const lyricBuffer = Buffer.from(lyricBase64, "base64");
      const lyric = lyricBuffer.toString("utf-8");

      let translatedLyric = null;
      if (tlyricBase64) {
        const tlyricBuffer = Buffer.from(tlyricBase64, "base64");
        translatedLyric = tlyricBuffer.toString("utf-8");
      }

      return {
        original: lyric,
        translated: translatedLyric,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching QQ Music lyrics:", error);
    return null;
  }
}

module.exports = getQQMusicLyrics;
