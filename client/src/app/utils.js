/** @file utils.js
 * @description some of the things for js
 */

export const getDynamicFontSize = (t) => {
  const s = Math.max(0, t.length - 50 + t.split("\n").length * 10);
  return `${Math.max(0.3, 1 - s * 0.007)}rem`;
};

export const cleanUrl = (url) => {
  if (url.includes("spotify.com/track/")) {
    const baseUrl = url.split("?")[0];
    if (!baseUrl.startsWith("https://")) {
      return "https://" + baseUrl;
    }
    return baseUrl;
  }
  if (url.includes("youtube.com") && !url.includes("music.")) {
    const baseUrl = url.split("#")[0];
    if (!baseUrl.startsWith("https://")) {
      return "https://" + baseUrl;
    }
    return baseUrl;
  }
  return url;
};

export const hasJapanese = (text) => {
  const japaneseRegex =
    /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;

  let ez = text.toLowerCase();
  if (
    ez.includes("ichiko") ||
    ez.includes("tokenai") ||
    ez.includes("kimi") ||
    ez.includes("watashi") ||
    ez.includes("wintermute")
  )
    return true;

  return japaneseRegex.test(text);
};

export const placeholders = [
  "paste your link here",
  "enter your link here !",
  "enter any url here :3",
  "place your url in here ;)",
  "enter your url",
];

export const randomTexts = [
  "is this what you were looking for?",
  "here's your result!",
  "does this look right?",
  "is this the file you wanted?",
  "your download is ready!",
  "download your likings ;)",
];

export const glintAnimation = `
  @keyframes glint {
    0% {
      border-color: rgba(255, 255, 255, 0.1);
    }
    50% {
      border-color: rgba(201, 84, 195, 0.53);
    }
    100% {
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
`;
