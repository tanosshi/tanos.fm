const axios = require("axios");

async function searchQQMusic(query) {
  try {
    const response = await axios.get(
      `https://c.y.qq.com/soso/fcgi-bin/client_search_cp`,
      {
        params: {
          w: query,
          format: "json",
          p: 1,
          n: 1,
          aggr: 1,
          lossless: 1,
          cr: 1,
          new_json: 1,
        },
        headers: {
          Referer: "https://y.qq.com/portal/player.html",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const data = response.data;
    if (
      data.data &&
      data.data.song &&
      data.data.song.list &&
      data.data.song.list.length > 0
    ) {
      return data.data.song.list[0].mid;
    }
    return null;
  } catch (error) {
    console.error("Error searching QQ Music:", error);
    return null;
  }
}

async function searchNetease(query) {
  try {
    const response = await axios.get(`https://music.163.com/api/search/get`, {
      params: {
        s: query,
        type: 1,
        limit: 1,
        offset: 0,
      },
      headers: {
        Referer: "https://music.163.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const data = response.data;
    if (data.result && data.result.songs && data.result.songs.length > 0) {
      return data.result.songs[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error searching NetEase:", error);
    return null;
  }
}

module.exports = { searchQQMusic, searchNetease };
