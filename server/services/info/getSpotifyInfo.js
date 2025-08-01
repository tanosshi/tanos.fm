"use strict";

const axios = require("axios");
const YouTube = require("youtube-sr").default;

async function searchYouTubeMusicfromSpotify(searchQuery) {
  try {
    const results = await YouTube.search(searchQuery, {
      limit: 1,
      type: "video",
    });

    if (results && results.length > 0) {
      return results[0].url;
    } else {
      console.warn("No YouTube results found for query:", searchQuery);
      return null;
    }
  } catch (error) {
    console.error("Error searching YouTube Music:", error);
    console.error("Search query was:", searchQuery);
    return null;
  }
}

async function getSpotifyInfo(url, accessToken) {
  const options = {
    url: `https://api.spotify.com/v1/tracks/${url}`,
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    json: true,
  };

  try {
    const response = await axios(options);
    const track = response.data;
    const searchQuery =
      track.name + " " + track.artists.map((artist) => artist.name).join(" ");

    const youtubeUrl = await searchYouTubeMusicfromSpotify(searchQuery);
    if (!youtubeUrl) {
      throw new Error("Could not find matching YouTube video");
    }

    const urlWithHash = youtubeUrl + "#from_spotify";

    return {
      title: `${track.name} - ${track.artists
        .map((artist) => artist.name.replace(" - Topic", ""))
        .join(", ")}`,
      duration: new Date(track.duration_ms).toISOString().substr(14, 5),
      quality: "320kbps",
      size: "~10 MB",
      url: urlWithHash,
      isFromSpotify: true,
    };
  } catch (error) {
    console.error(
      "Error getting track info:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to retrieve track information");
  }
}

module.exports = getSpotifyInfo;
