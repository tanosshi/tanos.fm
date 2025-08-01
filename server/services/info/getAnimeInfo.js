"use strict";

const axios = require("axios");
const cheerio = require("cheerio");

async function getAnimeInfo(url) {
  let query = url;
  let searchUrl = `https://kayoanime.com/?s=${encodeURIComponent(query)}`;

  try {
    let result = null;

    const response = await axios.get(searchUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    searchUrl = `https://kayoanime.com/top-100-of-all-time-2021/`;
    const topResponse = await axios.get(searchUrl);
    const topHtml = topResponse.data;
    const $top = cheerio.load(topHtml);
    const firstResult = $(".posts-items > li:first-child > a").attr("href");

    if (firstResult.toLowerCase().includes("top")) {
      console.log(`Top 100 URL: ${searchUrl}`);
      $top(".toggle-head").each((index, element) => {
        const title = $(element).text().trim();
        const titleLower = title.toLowerCase();
        console.log(`Top 100 titel: ${title}`);

        if (titleLower.includes(query.toLowerCase())) {
          const link = $(element).parent().find("a").attr("href");
          console.log(`Overeenkomende titel gevonden in top 100: ${title}`);
          result = {
            title: title,
            link: link,
            url: link,
            isAnime: true,
          };
          return false;
        }
      });
    } else {
      if (firstResult) {
        let titlez = firstResult
          .replace("https://kayoanime.com/", "")
          .replace("/", "")
          .replace(/-/g, " ")
          .replace("%20", " ")
          .replace(/\b(\w)/g, (char) => char.toUpperCase())
          .replace("Re ", "Re:")
          .replace("Re: zero", "Re:ZERO")
          .replace("zero", "Zero")
          .split(" Episode")[0]
          .split(" dual")[0]
          .split(" sub")[0]
          .split(" eng")[0]
          .split(" raw")[0];

        result = {
          title: titlez,
          link: firstResult,
          url: firstResult,
          isAnime: true,
        };
      }
    }

    if (!result) {
      console.log(`Geen resultaat gevonden.`);
      return null;
    }
    return result;
  } catch (error) {
    console.error("Fout tijdens het zoeken:", error);
    return null;
  }
}

module.exports = getAnimeInfo;
