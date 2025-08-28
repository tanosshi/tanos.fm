/** @file api/index.js
 * @description Handles external API requests.
 * TODO: make a dashboard to request an api key
 * TODO: add api key tracking to see whats happening
 * TODO: add api key rate limiting
 * TODO: better error handling
 * TODO: docs page w/samples
 */

/** API key usage
 * @description The way the API should be used is the following:
 * > curl 'http://localhost:3001/api?url=https://www.youtube.com/watch?v=xmV3CZVhupo&format=mp4&apiKey=$TAN0S.FM:this_is_a_testers_api_key'
 * : ?url= | This is the URL you would want to download, the code would automatically detect the type of link and return the appropriate data.
 * : &format= | This is the format you would want to download the media in, for now only mp3 and mp4 are supported. In the future flac and other formats will be supported.
 * : &apiKey= | This is the API key you would use to authenticate your request, you can send an request an key personally to the developer, aka @tanossh.i on dc
 */

const express = require("express");
const router = express.Router();

const { isValidUrl, processFetch } = require("../functions/fetch.js");

router.get("/", async (req, res) => {
  const { url, format, apiKey } = req.query;

  console.log("Starting download for ", url);
  console.log("Downloading in ", format);
  console.log("Downloading from ", apiKey);

  if (!apiKey || !apiKey.startsWith("$TAN0S.FM:") || apiKey.length < 20) {
    return res.status(400).json({
      valid: false,
      message: "Please provide a valid API key.",
    });
  }

  if (!url || !format) {
    return res.status(400).json({
      valid: false,
      message: "Please provide a valid URL, format and API key.",
    });
  }

  if (
    !format ||
    !["mp3", "mp4", "alt", "txt", "full", "zip"].includes(format)
  ) {
    return res.status(400).json({
      valid: false,
      message: "Invalid format. Supported formats are mp3 and mp4.",
    });
  }

  if (format == "mp3") {
    return res.status(400).json({
      valid: false,
      message: "MP3 downloads are not supported at the moment.",
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({
      valid: false,
      message: "Invalid or unsupported URL.",
    });
  }

  if (apiKey !== "$TAN0S.FM:this_is_a_testers_api_key") {
    return res.status(403).json({
      valid: false,
      message: "This API key is not valid.",
    });
  }

  const sim_req = {
    body: {
      url: url,
      apiKey: apiKey,
      format: format,
    },
  };

  const sim_res = {
    json(data) {
      console.log("response json:", data);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
  };

  const response = await processFetch(sim_req, sim_res);
  console.log(response);

  return res.status(200).json({
    valid: true,
    message: response.mediaInfo?.title || null,
    download_url: response.mediaInfo?.downloadUrl || null,
    backup_download_url: response.mediaInfo.format?.url || null,
    size: response.mediaInfo?.size || null,
    selftext: response.mediaInfo?.selftext || null,
    title: response.mediaInfo?.title || null,
    imageurl: response.mediaInfo?.imageUrl || null,
    lyrics: response.mediaInfo?.download_lrc_file || null,
    note: "Most sources should work, except for the ones requiring conversion or res piping",
  });
});

module.exports = router;
