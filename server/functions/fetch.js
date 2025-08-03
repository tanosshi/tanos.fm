const express = require("express");
const router = express.Router();
const { ttdl, igdl } = require("ruhend-scraper");
const getYoutubeInfo = require("../services/info/getYoutubeInfo.js");
const getSpotifyInfo = require("../services/info/getSpotifyInfo.js");
const getSpotifyAccessToken = require("../services/info/getSpotifyAccessToken.js");
const getSoundCloudInfo = require("../services/info/getSoundCloudInfo.js");

const btch = require("btch-downloader");

const fs = require("fs");
const path = require("path");

const { TwitterDL } = require("twitter-downloader");

const rateLimitStore = new Map();

function isValidUrl(url) {
  try {
    new URL(url);
    const supportedDomains = [
      "youtube.com",
      "youtu.be",
      "music.youtube.com",
      "soundcloud.com",
      "spotify.com",
      "music.apple.com",
      "tiktok.com",
      "instagram.com",
      "pin.it",
      "pinit.com",
      "pinterest.com",
      "pinterest.c",
      "reddit.com",
      "reddit.co.uk",
      "reddit.fr",
      "reddit.de",
      "reddit.it",
      "mediafire.com",
      "twitter.com",
      "x.com",
    ];
    const hostname = new URL(url).hostname;
    return supportedDomains.some((domain) => hostname.includes(domain));
  } catch (err) {
    return false;
  }
}

function logToHistory(requestData) {
  const historyPath = path.join(__dirname, "history.json");
  let history = [];

  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    } catch (error) {
      console.error("Error reading history.json:", error);
    }
  }

  history.push({
    timestamp: new Date().toISOString(),
    url: requestData.url,
    success: requestData.success,
    mediaType: requestData.mediaType,
    userIP: requestData.userIP,
  });

  if (history.length > 1000) {
    history = history.slice(-1000);
  }

  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Error writing to history.json:", error);
  }
}

router.post("/", async (req, res) => {
  const { url } = req.body;
  switch (true) {
    case url.includes("nsfw_content"):
      return res.status(400).json({
        valid: false,
        message: "Downloading NSFW media is not allowed for free users.",
      });
    case url.toLowerCase() == "hi":
      return res.status(400).json({ valid: false, message: "heelloooo" });
  }

  try {
    const logData = {
      url: url,
      userIP: rateLimitStore.get(req.ip) || req.ip,
      success: false,
      mediaType: "unknown",
    };

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        valid: false,
        message: "Please enter a valid URL",
      });
    }

    const isValid = isValidUrl(url.trim());
    if (!isValid) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or unsupported URL",
      });
    }

    let mediaInfo;
    const isMusic = url.includes("music.youtube.com");
    const isFromSpotify = url.includes("spotify.com");
    const isFromSoundCloud = url.includes("soundcloud.com");

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      logData.mediaType = "youtube";
      mediaInfo = await getYoutubeInfo(url, isMusic);
    } else if (isFromSpotify) {
      logData.mediaType = "spotify";
      const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
      if (!trackIdMatch || !trackIdMatch[1]) {
        return res.status(400).json({
          valid: false,
          message: "Invalid Spotify URL format",
        });
      }

      const trackId = trackIdMatch[1];
      const accessToken = await getSpotifyAccessToken();
      mediaInfo = await getSpotifyInfo(trackId, accessToken);
    } else if (isFromSoundCloud) {
      logData.mediaType = "soundcloud";
      if (url.includes("/sets") || url.includes("/playlists")) {
        return res.status(400).json({
          valid: false,
          message: "SoundCloud sets and playlists are not supported",
        });
      }
      mediaInfo = await getSoundCloudInfo(url);
    } else if (url.includes("pin.") || url.includes("pinterest.")) {
      const pindata = await btch.pinterest(url);

      console.log(pindata);

      mediaInfo = {
        isPinterest: true,
        title: pindata.result.description || "Pinterest Pin",
        url: pindata.result.image || pindata.result.images.orig,
        image: pindata.result.image || pindata.result.images.orig,
        author: pindata.result.user.username || "Unknown user",
        profilePicture:
          pindata.result.user.avatar_url ||
          "https://abs.twimg.com/sticky/default_profile_images/default_profile.png",
      };
    } else if (url.includes("tiktok.com")) {
      logData.mediaType = "tiktok";
      const tiktokData = await ttdl(url);
      const randomNumber = Math.floor(Math.random() * 6) + 5;

      mediaInfo = {
        title: tiktokData.title,
        duration: tiktokData.published,
        quality: "HD",
        size: "~" + randomNumber + " MB",
        url: tiktokData.video,
        isTikTok: true,
        likes: tiktokData.like,
        comments: tiktokData.comment,
        bookmark: tiktokData.bookmark,
        views: tiktokData.views,
        author: tiktokData.author,
        username: tiktokData.username,
        profilePicture: tiktokData.avatar,
        thumbnail: tiktokData.cover,
      };
    } else if (url.includes("instagram.com")) {
      logData.mediaType = "instagram";
      const instagramData = await igdl(url);
      let igdata = await instagramData.data;

      mediaInfo = {
        title: "Instagram Media",
        url: igdata[0].url,
        isEMedia: true,
      };
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      logData.mediaType = "twitter";
      try {
        const result = await TwitterDL(url);
        console.log("Twitter result:", result);
        mediaInfo = {
          title: result.result.description || "Twitter Media",
          url: result.result.media[0].url || url,
          isTwitter: true,
          author: result.result.author.bio || "Twitter User",
          username: result.result.author.username || "user",
          profilePicture:
            result.result.author.profileImageUrl ||
            "https://abs.twimg.com/sticky/default_profile_images/default_profile.png",
          likes: result.result.statistics.favoriteCount || 0,
          retweets: result.result.statistics.retweetCount || 0,
          replies: result.result.statistics.replieCount || 0,
          views: result.result.statistics.viewCount || 0,
        };
      } catch (error) {
        console.error("Twitter download error:", error);
        return res.status(400).json({
          valid: false,
          message: "Downloading NSFW media is not allowed for free users.",
        });
      }
    }

    logData.success = true;

    logToHistory(logData);

    return res.status(200).json({
      valid: true,
      message: "Valid URL detected!",
      mediaInfo,
      isFromSpotify,
      isFromSoundCloud,
    });
  } catch (error) {
    logToHistory({
      url: req.body.url,
      userIP: req.ip,
      success: false,
      mediaType: "error",
      error: error.message,
    });

    console.error("Server error:", error);
    return res.status(500).json({
      valid: false,
      message: error.message || "Error processing URL. Please try again.",
    });
  }
});

module.exports = router;
