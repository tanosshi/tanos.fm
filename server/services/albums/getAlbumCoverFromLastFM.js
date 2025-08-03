"use strict";

const axios = require("axios");

async function getAlbumCoverFromLastFM(artist, track, apiKey) {
  if (apiKey === undefined || apiKey === null) {
    console.error("API key is required for LastFM requests.");
    return { imageBuffer: null, genre: "Unknown" };
  }

  const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&track=${encodeURIComponent(track)}&format=json`;

  try {
    const response = await axios.get(url);
    const trackData = response.data.track;

    // console.log("LastFM Track Data:", trackData);
    //console.log("LastFM response:", response.data);

    let imageData = null;
    if (trackData && trackData.album && trackData.album.image) {
      imageData = trackData.album.image;

      if (imageData && imageData.length > 0) {
        const largestImage = imageData.reduce((prev, current) => {
          return parseInt(prev.size) > parseInt(current.size) ? prev : current;
        });
        const imageResponse = await axios.get(largestImage["#text"], {
          responseType: "arraybuffer",
        });
        return {
          imageBuffer: imageResponse.data,
          genre:
            trackData.toptags.tag.slice(0, 1).map((tag) => tag.name) ||
            "Unknown",
        };
      }
    }
    return { imageBuffer: null, genre: genre };
  } catch (error) {
    console.error("Error getting LastFM artwork:", error);
    artworkFailed = true;
    return {
      imageBuffer: null,
      genre:
        trackData.toptags.tag.slice(0, 1).map((tag) => tag.name) || "Unknown",
    };
  }
}

module.exports = getAlbumCoverFromLastFM;
