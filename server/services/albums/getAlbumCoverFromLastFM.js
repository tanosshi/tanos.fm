"use strict";

const axios = require("axios");

async function getAlbumCoverFromLastFM(artist, track, apiKey) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&track=${encodeURIComponent(track)}&format=json`;

  try {
    const response = await axios.get(url);
    const trackData = response.data.track;

    let genre = null;
    if (trackData && trackData.tags && trackData.tags.tag) {
      genre = trackData.tags.tag[0].name;
    }

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
          genre: genre,
        };
      }
    }
    return { imageBuffer: null, genre: genre };
  } catch (error) {
    console.error("Error getting LastFM artwork:", error);
    artworkFailed = true;
    return { imageBuffer: null, genre: null };
  }
}

module.exports = getAlbumCoverFromLastFM;
