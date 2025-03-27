'use strict';
require('dotenv').config();

const express = require("express");
const cors = require("cors");

const rateLimitStore = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const sec = 6 * 10;
  const windowMs = sec * 1000;
  const maxRequests = sec / 10 + (1 * 10); // making sure it's not too much

  const requests = rateLimitStore.get(ip) || [];
  
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0];
    const timeLeft = Math.ceil((windowMs - (now - oldestRequest)) / 1000);
    
    return res.status(429).json({
      valid: false,
      message: `Rate limit exceeded. Please wait ${timeLeft} seconds before trying again.`,
      timeLeft
    });
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  
  if (Math.random() < 0.01) {
    for (const [ip, requests] of rateLimitStore.entries()) {
      const recent = requests.filter(time => now - time < windowMs);
      if (recent.length === 0) {
        rateLimitStore.delete(ip);
      } else {
        rateLimitStore.set(ip, recent);
      }
    }
  }
  
  next();
};

/////// ===== Youtube ===== ///////
const ytdl = require("ytdl-core");
const { ytmp3, ytmp4, ttdl, igdl } = require("ruhend-scraper"); 
const YouTube = require("youtube-sr").default;

/////// ===== Spotify ===== ///////
const querystring = require("querystring");
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

/////// ===== SoundCloud ===== ///////
const scdl = require('soundcloud-downloader').default;

/////// ===== File Editing ===== ///////
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

const ffmpeg = require("fluent-ffmpeg");
const { Readable } = require("stream");

/////// ===== Twitter ===== ///////
const { TwitterDL } = require("twitter-downloader");

/////// ===== Anime ===== ///////
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const tinyurl = require('tinyurl');

/////// ===== Lyrics ===== ///////
const { Client } = require("lrclib-api");
const lrcClient = new Client();

/////// ===== Server ===== ///////
const app = express();
app.use(cors());
app.use(express.json());

app.use(rateLimiter);

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

const tempFiles = new Set();
const cleanupTempFiles = () => {
  const tempFilePatterns = [
    /^temp_cover_.*\.png$/,
    /^temp_output.*$/,
    /^temp_.*\.mp3$/
  ];

  const dirsToCheck = [
    '..',
    '.',
    '/',
    './server',
    './client',
    '../server',
    '../client'
  ];

  dirsToCheck.forEach(dir => {
    fs.readdir(dir, (err, files) => {
      if (err) return; //mightve been the wind

      files.forEach(file => {
        if (tempFilePatterns.some(pattern => pattern.test(file))) {
          const filePath = path.join(dir, file);
          fs.unlink(filePath, err => {
            if (err && err.code !== 'ENOENT') {
              console.error(`Critical error deleting temp file ${filePath}:`, err);
            }
          });
        }
      });
    });
  });
};

setInterval(cleanupTempFiles, 5 * 60 * 1000);
cleanupTempFiles();

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
      "twitter.com",
      "x.com"
    ];
    const hostname = new URL(url).hostname;
    return supportedDomains.some(domain => hostname.includes(domain));
  } catch (err) {
    return false;
  }
}

async function getYoutubeInfo(url, isMusic = false) {
  try {
    const info = await ytdl.getBasicInfo(url, {
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      }
    });

    // Check video duration (30 minutes = 1800 seconds)
    const durationInSeconds = parseInt(info.videoDetails.lengthSeconds);
    const isLongVideo = durationInSeconds > 1800;

    let formats = info.formats;
    let bestFormat;

    if (isMusic) {
      const audioOnlyFormats = formats.filter(f => f.hasAudio && !f.hasVideo);
      const combinedFormats = formats.filter(f => f.hasAudio && f.hasVideo);
      const anyAudioFormats = formats.filter(f => f.hasAudio);

      formats =
        audioOnlyFormats.length > 0
          ? audioOnlyFormats
          : combinedFormats.length > 0
            ? combinedFormats
            : anyAudioFormats.length > 0 ? anyAudioFormats : formats;

      bestFormat = formats.reduce((prev, current) => {
        if (!prev) return current;

        if (!prev.audioBitrate && current.audioBitrate) return current;
        if (prev.audioBitrate && !current.audioBitrate) return prev;

        const prevBitrate = prev.audioBitrate || 0;
        const currentBitrate = current.audioBitrate || 0;
        return currentBitrate > prevBitrate ? current : prev;
      }, formats[0]);
    } else {
      const combinedFormats = formats.filter(f => f.hasVideo && f.hasAudio);
      const videoOnlyFormats = formats.filter(f => f.hasVideo);

      formats =
        combinedFormats.length > 0
          ? combinedFormats
          : videoOnlyFormats.length > 0 ? videoOnlyFormats : formats;

      bestFormat = formats.reduce((prev, current) => {
        if (!prev) return current;

        if (!prev.height && current.height) return current;
        if (prev.height && !current.height) return prev;

        const prevHeight = prev.height || 0;
        const currentHeight = current.height || 0;
        return currentHeight > prevHeight ? current : prev;
      }, formats[0]);
    }

    if (!bestFormat) {
      console.error("No format found after selection process");
      throw new Error("No suitable format found");
    }

    let estimatedSize = "Unknown";
    if (bestFormat.contentLength) {
      estimatedSize = `~${(bestFormat.contentLength / 1024 / 1024).toFixed(
        1
      )} MB`;
    } else {
      const durationInSeconds = parseInt(info.videoDetails.lengthSeconds);
      if (isMusic) {
        const bitrate = bestFormat.audioBitrate || 128;
        const sizeInBytes = bitrate * 1000 * durationInSeconds / 8;
        estimatedSize = `~${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
      } else {
        const qualityMultiplier = {
          "144p": 4,
          "240p": 8,
          "360p": 12,
          "480p": 20,
          "720p": 45,
          "1080p": 90,
          "1440p": 150,
          "2160p": 300
        }; // because i cant be bothered to do it right

        let multiplier = 45;
        if (bestFormat.qualityLabel) {
          const quality = bestFormat.qualityLabel.toLowerCase();
          for (const [label, value] of Object.entries(qualityMultiplier)) {
            if (quality.includes(label.toLowerCase())) {
              multiplier = value;
              break;
            }
          }
        }

        const sizeInMB = multiplier * durationInSeconds / 60;
        estimatedSize = `~${sizeInMB.toFixed(1)} MB`;
      }
    }

    return {
      title:
        info.videoDetails.title +
        " - " +
        info.videoDetails.author.name.replace(" - Topic", ""),
      duration: new Date(parseInt(info.videoDetails.lengthSeconds) * 1000)
        .toISOString()
        .substr(11, 8),
      quality: isMusic
        ? bestFormat.audioBitrate
          ? `${bestFormat.audioBitrate}kbps`
          : bestFormat.audioQuality === "AUDIO_QUALITY_LOW"
            ? "128kbps"
            : bestFormat.audioQuality === "AUDIO_QUALITY_MEDIUM"
              ? "192kbps"
              : bestFormat.audioQuality === "AUDIO_QUALITY_HIGH"
                ? "256kbps"
                : "128kbps"
        : `${bestFormat.qualityLabel || bestFormat.quality || "HD"}`,
      size: estimatedSize,
      hasLyrics: info.videoDetails.category === "Music",
      thumbnail: info.videoDetails.thumbnails[0].url,
      url: url,
      format: bestFormat,
      durationError: isLongVideo ? "Video is too long. Maximum duration for MP4 download is 30 minutes." : null
    };
  } catch (error) {
    console.error("Error getting YouTube info:", error);
    if (error.message.includes("age-restricted")) {
      throw new Error("This video is age-restricted");
    } else if (error.message.includes("private")) {
      throw new Error("This video is private");
    } else if (
      error.message.includes("not found") ||
      error.message.includes("404")
    ) {
      throw new Error("Video not found");
    }
    throw new Error("Could not fetch video information");
  }
}

async function getSpotifyInfo(url, accessToken) {
  const options = {
    url: `https://api.spotify.com/v1/tracks/${url}`,
    headers: {
      Authorization: "Bearer " + accessToken
    },
    json: true
  };

  try {
    const response = await axios(options);
    const track = response.data;
    const searchQuery =
      track.name + " " + track.artists.map(artist => artist.name).join(" ");

    const youtubeUrl = await searchYouTubeMusicfromSpotify(searchQuery);
    if (!youtubeUrl) {
      throw new Error("Could not find matching YouTube video");
    }

    const urlWithHash = youtubeUrl + "#from_spotify";

    return {
      title: `${track.name} - ${track.artists
        .map(artist => artist.name.replace(" - Topic", ""))
        .join(", ")}`,
      duration: new Date(track.duration_ms).toISOString().substr(14, 5),
      quality: "320kbps",
      size: "~10 MB",
      url: urlWithHash,
      isFromSpotify: true
    };
  } catch (error) {
    console.error(
      "Error getting track info:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to retrieve track information");
  }
}

async function searchYouTubeMusicfromSpotify(searchQuery) {
  try {
    const results = await YouTube.search(searchQuery, {
      limit: 1,
      type: "video"
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

async function getSpotifyAccessToken() {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: querystring.stringify({ grant_type: "client_credentials" }),
    json: true
  };

  try {
    const response = await axios(authOptions);
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

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
      author: info.user.username
    };
  } catch (error) {
    console.error("Error getting SoundCloud info:", error);
    throw new Error("Failed to retrieve SoundCloud track information");
  }
}

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
      const firstResult = $('.posts-items > li:first-child > a').attr('href');

      if (firstResult.toLowerCase().includes("top")) { // Q1
        console.log(`Top 100 URL: ${searchUrl}`);
        $top('.toggle-head').each((index, element) => {
          const title = $(element).text().trim();
          const titleLower = title.toLowerCase();
          console.log(`Top 100 titel: ${title}`);
          
          if (titleLower.includes(query.toLowerCase())) {
            const link = $(element).parent().find('a').attr('href');
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
      } else { // Q2
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

let toggleAnime = false;

// Add history logging function
function logToHistory(requestData) {
  const historyPath = path.join(__dirname, 'history.json');
  let history = [];
  
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (error) {
      console.error('Error reading history.json:', error);
    }
  }
  
  history.push({
    timestamp: new Date().toISOString(),
    url: requestData.url,
    success: requestData.success,
    mediaType: requestData.mediaType,
    userIP: requestData.userIP
  });
  
  if (history.length > 1000) {
    history = history.slice(-1000);
  }
  
  // Write back to file
  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error writing to history.json:', error);
  }
}

app.post("/fetch", async (req, res) => {
  const { url } = req.body;
  switch (true) {
    case url.includes("nsfw_content"):
      return res.status(400).json({valid: false, message: "Downloading NSFW media is not allowed for free users."});
    case url.toLowerCase() === "fuck you":
      return res.status(400).json({valid: false, message: "fuck you too"});
    case url.toLowerCase() === "bitch":
      return res.status(400).json({valid: false, message: "you the bitch"});
    case url.toLowerCase() === "retard":
      return res.status(400).json({valid: false, message: "kys"});
    case url.toLowerCase().includes("nigga"):
      return res.status(400).json({valid: false, message: "nigga is not allowed"});
    case url.toLowerCase() == "kys":
      return res.status(400).json({valid: false, message: "kill yourself"});
    case url.toLowerCase() == "kill yourself":
      return res.status(400).json({valid: false, message: "kys !!!"});
    case url.toLowerCase() == "hi":
      return res.status(400).json({valid: false, message: "heelloooo"});
  }

  toggleAnime = false;
  try {
    // Log data
    const logData = {
      url: url,
      userIP: rateLimitStore.get(req.ip) || req.ip,
      success: false,
      mediaType: 'unknown'
    };

    // Checks for anime
    if (!url.includes("https://") && !url.includes("http://") || !url.includes(":/")) {
      toggleAnime = true;
      logData.mediaType = 'anime';
    }

    // Toggles anime
    if (!url || typeof url !== "string") {
      if(!toggleAnime) {
        return res.status(400).json({
          valid: false,
          message: "Please enter a URL"
        });
      }
    }

    // Checks if the url is valid
    const isValid = isValidUrl(url.trim());
    if (!isValid) {
      if(!toggleAnime) {
        return res.status(400).json({
          valid: false,
          message: "Invalid or unsupported URL"
        });
      }
    }

    // Checks if the url is music
    let mediaInfo;
    const isMusic = url.includes("music.youtube.com");
    const isFromSpotify = url.includes("spotify.com");
    const isFromSoundCloud = url.includes("soundcloud.com");

    // Checks if the url is youtube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      logData.mediaType = 'youtube';
      mediaInfo = await getYoutubeInfo(url, isMusic);
    } else if (isFromSpotify) {
      logData.mediaType = 'spotify';
      const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
      if (!trackIdMatch || !trackIdMatch[1]) {
        return res.status(400).json({
          valid: false,
          message: "Invalid Spotify URL format"
        });
      }

      const trackId = trackIdMatch[1];
      const accessToken = await getSpotifyAccessToken();
      mediaInfo = await getSpotifyInfo(trackId, accessToken);
    } else if (isFromSoundCloud) {
      logData.mediaType = 'soundcloud';
      if (url.includes("/sets") || url.includes("/playlists")) {
        return res.status(400).json({
          valid: false,
          message: "SoundCloud sets and playlists are not supported"
        });
      }
      mediaInfo = await getSoundCloudInfo(url);
    } else if (url.includes("tiktok.com")) {
      logData.mediaType = 'tiktok';
      const tiktokData = await ttdl(url);
      const randomNumber = Math.floor(Math.random() * 6) + 5;

      mediaInfo = {
        title: tiktokData.title,
        duration: tiktokData.published,
        quality: "HD",
        size: "~" + randomNumber + " MB", // after all tiktok doesnt allow me to see the size without downloading it first
        url: tiktokData.video,
        isTikTok: true,
        likes: tiktokData.like,
        comments: tiktokData.comment,
        bookmark: tiktokData.bookmark,
        views: tiktokData.views,
        author: tiktokData.author,
        username: tiktokData.username,
        profilePicture: tiktokData.avatar,
        thumbnail: tiktokData.cover
      };
    } else if (url.includes("instagram.com")) {
      logData.mediaType = 'instagram';
      const instagramData = await igdl(url);
      let igdata = await instagramData.data;

      mediaInfo = {
        title: "Instagram Media",
        url: igdata[0].url,
        isAnime: true // just for the sake of it
      };
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      logData.mediaType = 'twitter';
      try {
        const result = await TwitterDL(url);
        console.log("Twitter result:", result);
        mediaInfo = {
          title: result.result.description || "Twitter Media",
          url: result.result.media[0].url || url,
          isTwitter: true,
          author: result.result.author.bio || "Twitter User",
          username: result.result.author.username || "user",
          profilePicture: result.result.author.profileImageUrl || "https://abs.twimg.com/sticky/default_profile_images/default_profile.png",
          likes: result.result.statistics.favoriteCount || 0,
          retweets: result.result.statistics.retweetCount || 0,
          replies: result.result.statistics.replieCount || 0,
          views: result.result.statistics.viewCount || 0
        };
      } catch (error) {
        console.error("Twitter download error:", error);
        return res.status(400).json({
          valid: false,
          message: "Downloading NSFW media is not allowed for free users."
        });
      }
    }
    if (toggleAnime) {
      logData.mediaType = 'anime';
      mediaInfo = await getAnimeInfo(url);
    }

    // Update success status
    logData.success = true;

    // Log the request
    logToHistory(logData);

    return res.status(200).json({
      valid: true,
      message: "Valid URL detected!",
      mediaInfo,
      isFromSpotify,
      isFromSoundCloud
    });
  } catch (error) {
    // Log failed request
    logToHistory({
      url: req.body.url,
      userIP: req.ip,
      success: false,
      mediaType: 'error',
      error: error.message
    });

    console.error("Server error:", error);
    return res.status(500).json({
      valid: false,
      message: error.message || "Error processing URL. Please try again."
    });
  }
});

app.get('/stream', async (req, res) => {
  try {
    const { url, title } = req.query;
    
    // Generate a secure token for this stream
    const streamId = crypto.randomBytes(16).toString('hex');
    const filePath = path.join(tempDir, `${streamId}.mp4`);

    // Store stream info in cache
    streamCache.set(streamId, {
      url,
      title,
      filePath,
      timestamp: Date.now()
    });

    // Start downloading the video in the background
    const videoStream = ytdl(url, {
      quality: 'highest',
      filter: 'videoandaudio'
    });

    // Save the video to a temporary file
    videoStream.pipe(fs.createWriteStream(filePath));

    // Return the secure stream URL
    res.json({
      streamUrl: `video/${streamId}`
    });
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
});


async function getAlbumCoverFromSoundCloud(artist, track) {
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
          responseType: "arraybuffer"
        });
        return imageResponse.data;
      }
    }
    return null;
  } catch (error) {
   // console.error("Error getting SoundCloud artwork:", error);
    return null;
  }
}

async function getAlbumCoverFromLastFM(artist, track, apiKey) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&track=${encodeURIComponent(track)}&format=json`;

  try {
    const response = await axios.get(url);
    const trackData = response.data.track;

    let genre = null;
    if (trackData && trackData.tags && trackData.tags.tag) {
      // Get the first tag as genre
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
          responseType: "arraybuffer"
        });
        return {
          imageBuffer: imageResponse.data,
          genre: genre
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

app.get("/download", async (req, res) => {
  console.log("Starting download for ", req.query);
  let { url, format } = req.query;

  if (!url) {
    return res.status(400).json({
      valid: false,
      message: "URL is required."
    });
  }

  if (
    url.includes("mega") ||
    url.includes("mediafire") ||
    url.includes("zippyshare") ||
    url.includes("4shared") ||
    url.includes("drive") ||
    url.includes("dropbox")
  ) {
    res.redirect(url);
  }

  if (url.includes("kayoanime") || url.includes("instagram.com") || url.includes("rapidcdn") || url.includes("cdn")) {
    url = url + "#format=mp4" // just to make it easier for me
  }

  if (!format || !["mp3", "mp4"].includes(format)) {
    return res.status(400).json({
      valid: false,
      message: "Invalid format. Must be mp3 or mp4."
    });
  }

  try {
    const isFromSpotify = url.includes("#from_spotify");
    const isFromSoundCloud = url.includes("soundcloud.com");

    if (isFromSpotify) {
      url = url.replace("#from_spotify", "");
      format = "mp3";
    }

    if (isFromSoundCloud) {
      format = "mp3"; // SoundCloud only supports MP3
      const info = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
      res.header(
        "Content-Disposition",
        `attachment; filename="${info.title}.mp3"`
      );
      res.header("Content-Type", "audio/mpeg");

      const stream = await scdl.download(url, SOUNDCLOUD_CLIENT_ID);
      stream.pipe(res);
      return;
    }

    if (
      url.includes("tiktok.com") ||
      url.includes("tikwm.com") ||
      url.includes("akamaized.net") ||
      url.includes("cdn") ||
      url.includes("rapidcdn") ||
      url.includes("instagram.com")
    ) {
      res.redirect(url);
      return;
    }

    if (url.includes("twitter.com") || url.includes("x.com")) {
      const result = await TwitterDL(url);
      const highestQualityVideo = result.result.media[0].videos.reduce((prev, current) => {
        return (prev.bitrate > current.bitrate) ? prev : current;
      });
      console.log("Highest quality video URL:", highestQualityVideo.url);
      res.setHeader('Content-Disposition', `attachment; filename="${result.result.description || "Twitter Media"}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      
      try {
        const response = await axios({
          method: 'get',
          url: highestQualityVideo.url,
          responseType: 'stream'
        });
        
        response.data.pipe(res);
      } catch (error) {
        console.error("Error downloading video:", error);
        return res.status(500).json({
          valid: false,
          message: "Failed to download video " + error
        });
      }
      //return res.redirect(highestQualityVideo.url);
    }

    if (url.includes("spotify.com")) {
      const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
      if (!trackIdMatch || !trackIdMatch[1]) {
        return res.status(400).json({
          valid: false,
          message: "Invalid Spotify URL format"
        });
      }
      const trackId = trackIdMatch[1];
      const accessToken = await getSpotifyAccessToken();
      const spotifyInfo = await getSpotifyInfo(trackId, accessToken);
      if (!spotifyInfo.url) {
        return res.status(404).json({
          valid: false,
          message: "Could not find equivalent YouTube track"
        });
      }
      url = spotifyInfo.url.replace("#from_spotify", "");
    }

    if (url.includes("kayoanime")) {
      try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let downloadLink = $('.shortc-button.small.blue').attr('href');
        if (!downloadLink)
          downloadLink = $('.shortc-button.small.black').attr('href')
        if (!downloadLink)
          downloadLink = $('.shortc-button.small.green').attr('href')
        if (!downloadLink)
          downloadLink = $('.shortc-button').attr('href')

        if (downloadLink) {
          try{
            const resolvedLink = await tinyurl.resolve(downloadLink);
            return res.redirect(resolvedLink)
          } catch {
            try{
              const resolvedLink = await tinyurl.resolve($('.shortc-button.small.black').attr('href'));
              return res.redirect(resolvedLink)
            } catch {
              try {
                const resolvedLink = await tinyurl.resolve($('.shortc-button.small.green').first().attr('href'));
                return res.redirect(resolvedLink)
              } catch {
                console.error('Invalid link');
                return res.redirect(url);
              }
            }
          }
        } else {
          console.error('Invalid link');
          return res.redirect(url);
        }
      } catch (error) {
        console.error('Error getting download link:', error);
        return res.send("The link is not valid");
      }    
    }

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (format === "mp3") {
        console.log("Downloading mp3");
        const mediaData = await ytmp3(url);
        if (!mediaData || !mediaData.audio) {
          return res.status(404).json({
            valid: false,
            message: "No suitable mp3 format found."
          });
        }

        const audioStream = (await axios({
          url: mediaData.audio,
          method: "GET",
          responseType: "stream"
        })).data;

        let artworkFailed = false;
        let imageBuffer = null;
        let genre = null;
        try {
          const lastFMData = await getAlbumCoverFromLastFM(
            mediaData.author,
            mediaData.title,
            process.env.LASTFM_API_KEY
          );
          imageBuffer = lastFMData.imageBuffer;
          genre = lastFMData.genre;
        } catch (error) {
          console.warn("Failed to get LastFM artwork:", error);
          artworkFailed = true;
        }

        if (!imageBuffer && !artworkFailed) {
          try {
            console.warn("No album data found on Last.fm, trying SoundCloud...");
            imageBuffer = await getAlbumCoverFromSoundCloud(
              mediaData.author,
              mediaData.title
            );
            if (!imageBuffer) {
              console.warn("No artwork found on SoundCloud either.");
              artworkFailed = true;
            }
          } catch (error) {
            console.warn("Failed to get SoundCloud artwork:", error);
            artworkFailed = true;
          }
        }

        res.header(
          "Content-Disposition",
          `attachment; filename="${mediaData.title} - ${mediaData.author}.mp3"`
        );
        res.header("Content-Type", "audio/mpeg");

        if (artworkFailed || !imageBuffer) {
          ffmpeg(audioStream)
            .audioCodec("libmp3lame")
            .audioBitrate("320k")
            .outputFormat("mp3")
            .addOutputOption('-metadata', `title=${mediaData.title}`)
            .addOutputOption('-metadata', `artist=${mediaData.author}`)
            .addOutputOption('-metadata', `album=${mediaData.title} - ${mediaData.author}`)
            .addOutputOption('-metadata', `genre=${genre || 'Unknown'}`)
            .on("error", err => {
              console.error("FFmpeg error:", err);
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "FFmpeg error occurred."
                });
              }
            })
            .pipe(res, { end: true });
          return;
        }

        try {
          const pngBuffer = await sharp(imageBuffer).png().toBuffer();
          console.log("Sharp processing complete.");
          const randomFileName = crypto.randomBytes(16).toString("hex");
          const tempImagePath = path.join(
            __dirname,
            `temp_cover_${randomFileName}.png`
          );
          const tempOutputPath = path.join(
            __dirname,
            `temp_output_${randomFileName}.mp3`
          );
          
          tempFiles.add({ path: tempImagePath, timestamp: Date.now() });
          tempFiles.add({ path: tempOutputPath, timestamp: Date.now() });
          
          console.log(`Writing temp image to: ${tempImagePath}`);
          fs.writeFileSync(tempImagePath, pngBuffer);
          console.log("Temp image written.");

          ffmpeg()
            .input(audioStream)
            .input(tempImagePath)
            .audioCodec('libmp3lame')
            .audioBitrate('320k')
            .addOutputOption('-id3v2_version', '3')
            .addOutputOption('-map', '0:a')
            .addOutputOption('-map', '1')
            .addOutputOption('-metadata:s:v', 'title=Album cover')
            .addOutputOption('-metadata:s:v', 'comment=Cover (front)')
            .addOutputOption('-disposition:v', 'attached_pic')
            .addOutputOption('-metadata', `title=${mediaData.title}`)
            .addOutputOption('-metadata', `artist=${mediaData.author}`)
            .addOutputOption('-metadata', `album=${mediaData.title} - ${mediaData.author}`)
            .addOutputOption('-metadata', `genre=${genre || 'Unknown'}`)
            .toFormat('mp3')
            .on('start', () => {
              console.log('FFmpeg processing started');
            })
            .on('end', () => {
              console.log('FFmpeg processing finished');
              const readStream = fs.createReadStream(tempOutputPath);
              readStream.pipe(res);
              readStream.on('end', () => {
                tempFiles.delete({ path: tempImagePath });
                tempFiles.delete({ path: tempOutputPath });
                fs.unlink(tempImagePath, err => {
                  if (err) console.error('Error deleting temp image file:', err);
                });
                fs.unlink(tempOutputPath, err => {
                  if (err) console.error('Error deleting temp output file:', err);
                });
              });
            })
            .on('error', (err) => {
              console.error('FFmpeg error during processing:', err);
              tempFiles.delete({ path: tempImagePath });
              tempFiles.delete({ path: tempOutputPath });
              fs.unlink(tempImagePath, err => {
                if (err) console.error('Error deleting temp image file:', err);
              });
              fs.unlink(tempOutputPath, err => {
                if (err) console.error('Error deleting temp output file:', err);
              });
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "FFmpeg error occurred."
                });
              }
            })
            .saveToFile(tempOutputPath);
        } catch (error) {
          console.error("Error processing artwork:", error);
          ffmpeg(audioStream)
            .audioCodec("libmp3lame")
            .audioBitrate("320k")
            .outputFormat("mp3")
            .addOutputOption('-metadata', `title=${mediaData.title}`)
            .addOutputOption('-metadata', `artist=${mediaData.author}`)
            .addOutputOption('-metadata', `album=${mediaData.title} - ${mediaData.author}`)
            .addOutputOption('-metadata', `genre=${genre || 'Unknown'}`)
            .on("error", err => {
              console.error("FFmpeg error:", err);
              if (!res.headersSent) {
                res.status(500).json({
                  valid: false,
                  message: "FFmpeg error occurred."
                });
              }
            })
            .pipe(res, { end: true });
        }
      } else if (format === "mp4") {
        const mediaData = await ytmp4(url);
        if (!mediaData || !mediaData.video) {
          return res.status(404).json({
            valid: false,
            message: "No suitable mp4 format found."
          });
        }
        res.header(
          "Content-Disposition",
          `attachment; filename="${mediaData.title}.mp4"`
        );
        res.header("Content-Type", "video/mp4");
        
        // Download and pipe the video stream
        const videoStream = (await axios({
          url: mediaData.video,
          method: 'GET',
          responseType: 'stream'
        })).data;
        
        videoStream.pipe(res);
      }
    }
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({
      valid: false,
      message: "Download failed."
    });
  }
});

async function getQQMusicLyrics(songMid) {
  try {
    const response = await axios.get(`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg`, {
      params: {
        songmid: songMid,
        pcachetime: new Date().getTime(),
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        ct: 20,
        cv: 1878,
      },
      headers: {
        'Referer': 'https://y.qq.com/portal/player.html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const lyricData = response.data;
    const lyricBase64 = lyricData.lyric;
    const tlyricBase64 = lyricData.trans;

    if (lyricBase64) {
      const lyricBuffer = Buffer.from(lyricBase64, 'base64');
      const lyric = lyricBuffer.toString('utf-8');

      let translatedLyric = null;
      if (tlyricBase64) {
        const tlyricBuffer = Buffer.from(tlyricBase64, 'base64');
        translatedLyric = tlyricBuffer.toString('utf-8');
      }

      return {
        original: lyric,
        translated: translatedLyric,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching QQ Music lyrics:', error);
    return null;
  }
}

async function searchQQMusic(query) {
  try {
    const response = await axios.get(`https://c.y.qq.com/soso/fcgi-bin/client_search_cp`, {
      params: {
        w: query,
        format: 'json',
        p: 1,
        n: 1,
        aggr: 1,
        lossless: 1,
        cr: 1,
        new_json: 1,
      },
      headers: {
        'Referer': 'https://y.qq.com/portal/player.html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const data = response.data;
    if (data.data && data.data.song && data.data.song.list && data.data.song.list.length > 0) {
      return data.data.song.list[0].mid;
    }
    return null;
  } catch (error) {
    console.error('Error searching QQ Music:', error);
    return null;
  }
}

async function getNeteaseCloudMusicLyrics(songId) {
  try {
    const response = await axios.get(`https://music.163.com/api/song/lyric`, {
      params: {
        id: songId,
        lv: 1,
        tv: 1,
      },
      headers: {
        'Referer': 'https://music.163.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const lyricData = response.data;
    const lyric = lyricData.lrc && lyricData.lrc.lyric ? lyricData.lrc.lyric : null;
    const translatedLyric = lyricData.tlyric && lyricData.tlyric.lyric ? lyricData.tlyric.lyric : null;

    if (lyric || translatedLyric) {
      return {
        original: lyric,
        translated: translatedLyric,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching NetEase lyrics:', error);
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
        'Referer': 'https://music.163.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const data = response.data;
    if (data.result && data.result.songs && data.result.songs.length > 0) {
      return data.result.songs[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching NetEase:', error);
    return null;
  }
}

function generateSearchVariations(title, artist) {
  const variations = [];
  
  const cleanTitle = title
    .replace(/['"!@#$%^&*()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  const cleanArtist = artist 
    ? artist
        .replace(/['"!@#$%^&*()]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

  if (cleanArtist) {
    variations.push(`${cleanTitle} ${cleanArtist}`);
  }
  
  variations.push(cleanTitle);

  const noParentheses = cleanTitle.replace(/\([^)\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]*\)/g, '')
    .replace(/\[[^\]\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]*\]/g, '')
    .trim();
    
  if (noParentheses !== cleanTitle) {
    if (cleanArtist) {
      variations.push(`${noParentheses} ${cleanArtist}`);
    }
    variations.push(noParentheses);
  }

  return [...new Set(variations)];
}

const wanakana = require('wanakana');
const translate = require('@iamtraction/google-translate');

async function translateAndRomanize(lrcContent) {
  const lines = lrcContent.split('\n');
  const processedLines = [];
  
  for (const line of lines) {
    const match = line.match(/(\[\d{2}:\d{2}.\d{2}\])(.*)/);
    if (!match) {
      processedLines.push(line);
      continue;
    }

    const [_, timestamp, text] = match;
    if (!text.trim()) {
      processedLines.push(line);
      continue;
    }

    try {
      const cleanedText = text.replace(/\([^)]*\)/g, '').trim();
      
      let processedText = cleanedText
        .replace(/ no /g, ' の ')
        .replace(/ ni /g, ' に ')
        .replace(/ wo /g, ' を ')
        .replace(/no(\S)/g, 'の$1')
        .replace(/ni(\S)/g, 'に$1')
        .replace(/wo(\S)/g, 'を$1');

      const segments = processedText.split(/([a-zA-Z]+|[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+|\s+)/g)
        .filter(segment => segment.length > 0);
      
      let romanizedText = '';
      for (const segment of segments) {
        if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(segment)) {
          romanizedText += wanakana.toRomaji(segment);
        } else {
          romanizedText += segment;
        }
      }
      
      romanizedText = romanizedText
        .replace(/\s+/g, ' ')
        .replace(/no\s+/g, ' no ')
        .replace(/ni\s+/g, ' ni ')
        .replace(/wo\s+/g, ' wo ')
        .replace(/\s+/g, ' ')
        .trim();
      
      try {
        const result = await translate(cleanedText, { from: 'ja', to: 'en' });
        const translation = result.text;
        
        processedLines.push(`${timestamp}${romanizedText} (${translation})`);
      } catch (err) {
        console.warn('Translation failed:', err);
        processedLines.push(`${timestamp}${romanizedText}`);
      }
    } catch (error) {
      console.error('Processing error:', error);
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

function sanitizeFilename(filename) {
  const romaji = wanakana.toRomaji(filename);
  return romaji.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
}

app.get("/lyrics", async (req, res) => {
  try {
    const { url, romanized } = req.query;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Please provide a song title"
      });
    }

    let clean_url = url.replace(" - Topic", "").trim();

    let artist_name = "";
    let track_name = "";
    const dashIndex = clean_url.indexOf(" - ");
    if (dashIndex !== -1) {
      artist_name = clean_url.substring(dashIndex + 3).trim();
      track_name = clean_url.substring(0, dashIndex).trim();
    } else {
      track_name = clean_url;
    }

    const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(track_name + artist_name);
    
    if (hasJapanese) {
      try {
        const query = {
          track_name: track_name,
          artist_name: artist_name
        };
        
        console.log('Attempting exact match with:', query);
        const syncedLyrics = await lrcClient.getSynced(query);
        if (syncedLyrics && typeof syncedLyrics === 'string') {
          if (romanized === 'true') {
            console.log('Processing romanization and translation...');
            const processedLyrics = await translateAndRomanize(syncedLyrics);
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
            return res.send(processedLyrics);
          } else {
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
            return res.send(syncedLyrics);
          }
        }
      } catch (error) {
        console.log('Exact match failed:', error.message);
      }
    }

    const searchVariations = generateSearchVariations(track_name, artist_name);
    console.log('Generated search variations:', searchVariations);

    const limitedVariations = hasJapanese ? searchVariations.slice(0, 3) : searchVariations.slice(0, 5);
    console.log('Using variations:', limitedVariations);

    for (const searchQuery of limitedVariations) {
      try {
        const query = {
          track_name: searchQuery,
          artist_name: artist_name
        };
        
        console.log('Attempting LrcLib with:', query);
        const syncedLyrics = await lrcClient.getSynced(query);
        if (syncedLyrics && typeof syncedLyrics === 'string') {
          if (romanized === 'true') {
            console.log('Processing romanization and translation...');
            const processedLyrics = await translateAndRomanize(syncedLyrics);
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
            return res.send(processedLyrics);
          } else {
            const safeFilename = sanitizeFilename(track_name);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
            return res.send(syncedLyrics);
          }
        }

        if (hasJapanese) {
          console.log('Attempting QQ Music with exact match:', track_name);
          const songMid = await searchQQMusic(track_name);
          if (songMid) {
            const qqLyrics = await getQQMusicLyrics(songMid);
            if (qqLyrics && qqLyrics.original && typeof qqLyrics.original === 'string') {
              if (romanized === 'true') {
                console.log('Processing romanization and translation...');
                const processedLyrics = await translateAndRomanize(qqLyrics.original);
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(qqLyrics.original);
              }
            }
          }
        } else {
          console.log('Attempting QQ Music with:', searchQuery);
          const songMid = await searchQQMusic(searchQuery);
          if (songMid) {
            const qqLyrics = await getQQMusicLyrics(songMid);
            if (qqLyrics && qqLyrics.original && typeof qqLyrics.original === 'string') {
              if (romanized === 'true') {
                console.log('Processing romanization and translation...');
                const processedLyrics = await translateAndRomanize(qqLyrics.original);
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(qqLyrics.original);
              }
            }
          }
        }

        if (hasJapanese) {
          console.log('Attempting NetEase with exact match:', track_name);
          const songId = await searchNetease(track_name);
          if (songId) {
            const neteaseLyrics = await getNeteaseCloudMusicLyrics(songId);
            if (neteaseLyrics && neteaseLyrics.original && typeof neteaseLyrics.original === 'string') {
              if (romanized === 'true') {
                console.log('Processing romanization and translation...');
                const processedLyrics = await translateAndRomanize(neteaseLyrics.original);
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(neteaseLyrics.original);
              }
            }
          }
        } else {
          console.log('Attempting NetEase with:', searchQuery);
          const songId = await searchNetease(searchQuery);
          if (songId) {
            const neteaseLyrics = await getNeteaseCloudMusicLyrics(songId);
            if (neteaseLyrics && neteaseLyrics.original && typeof neteaseLyrics.original === 'string') {
              if (romanized === 'true') {
                console.log('Processing romanization and translation...');
                const processedLyrics = await translateAndRomanize(neteaseLyrics.original);
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(processedLyrics);
              } else {
                const safeFilename = sanitizeFilename(track_name);
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.lrc"`);
                return res.send(neteaseLyrics.original);
              }
            }
          }
        }
      } catch (variationError) {
        console.log('Error with variation:', searchQuery, variationError.message);
        continue;
      }
    }

    console.log('No lyrics found after trying variations');
    return res.status(404).json({
      success: false,
      message: "No lyrics found for this song"
    });

  } catch (error) {
    console.error("Lyrics error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process lyrics request"
    });
  }
});

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
