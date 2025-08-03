"use strict";

const axios = require("axios");

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

async function getAlbumCoverFromSoundCloud(artist, track) {
  if (
    !SOUNDCLOUD_CLIENT_ID ||
    SOUNDCLOUD_CLIENT_ID === "" ||
    SOUNDCLOUD_CLIENT_ID === null
  ) {
    console.error("SOUNDCLOUD_CLIENT_ID is required for SoundCloud requests.");
    return null;
  }
  const searchUrl = `https://api.soundcloud.com/search/tracks?q=${encodeURIComponent(
    `${artist} ${track}`
  )}&client_id=${SOUNDCLOUD_CLIENT_ID}`;

  try {
    const response = await axios.get(searchUrl);
    const tracks = response.data.collection;

    if (tracks && tracks.length > 0) {
      const bestMatch = tracks[0];
      if (bestMatch.artwork_url) {
        const highResArtwork = bestMatch.artwork_url.replace(
          "-large",
          "-t500x500"
        );
        const imageResponse = await axios.get(highResArtwork, {
          responseType: "arraybuffer",
        });
        return imageResponse.data;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

module.exports = getAlbumCoverFromSoundCloud;
