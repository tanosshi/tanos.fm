"use strict";

const scdl = require("soundcloud-downloader").default;

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

async function getSoundCloudInfo(url) {
  try {
    const info = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
    return {
      title: info.title,
      duration: new Date(info.duration).toISOString().substr(11, 8),
      quality: "320kbps",
      size: "~10 MB",
      url: url,
      isFromSoundCloud: true,
      thumbnail: info.artwork_url || info.user.avatar_url,
      author: info.user.username,
    };
  } catch (error) {
    console.error("Error getting SoundCloud info:", error);
    throw new Error("Failed to retrieve SoundCloud track information");
  }
}

module.exports = getSoundCloudInfo;
