/** @file App.js
 * @description The front-end for tanos.fm, made to be eye pleasing.
 * TODO: Minify the code, split the singular JavaScript file into multiple files.
 * TODO: Upgrade the UI to be even more eye-pleasing.
 * TODO: More animations
 * TODO: More site functionality
 */

import React, { useState, useEffect, useRef } from "react";

console.log(
  `\x1b[94m%s\x1b[0m`,
  `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⣉⣤⣴⣶⣯⣄⠈⠵⣶⣿⣿⣐⠫⣛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣷⣦⡛⠉⠴⠿⠿⣾⣿⣦⣝⠻⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⢁⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⠻⠿⢿⣿⣿⣾⣝⡻⣮⠛⢿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡿⢃⣴⣿⢿⣿⣿⣿⣿⣿⣿⣿⡿⢟⣻⣿⣿⣿⣦⠻⣷⠦⣍⡛⢿⣿⣮⡳⠄⠻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⣱⣿⢟⢁⣿⣿⣿⣿⣿⡿⠛⣩⣶⣿⣿⣿⣿⠟⣩⣶⣜⣷⣮⣿⣷⣮⣻⣿⣶⡀⠙⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠡⠟⣡⢏⣾⣿⣿⢿⠟⠁⣠⣾⣿⣿⣿⣿⡏⣡⣿⣿⢻⣿⢿⣧⠻⣿⣿⣝⢿⡿⣝⣦⠘⣿⣿
⣿⣿⣿⣿⣿⣿⡇⠀⡸⢋⣾⣿⢹⣷⡟⢀⣤⡌⢻⡿⣸⣿⡟⣡⣿⣿⡏⣾⣿⡘⣿⡄⣎⠙⡏⢡⡘⠿⣿⣧⠘⣿
⣿⣿⣿⣿⣿⣿⢃⡞⠀⣼⣿⡟⢸⠏⣴⣿⡏⣰⡟⣰⣿⠏⣴⣿⣿⡟⢠⣿⣧⣿⣸⡇⣿⣷⡄⢌⢛⠷⠈⣿⣇⠹
⣿⣿⣿⣿⣿⡇⠈⠰⢸⣿⣿⡇⡟⡀⣠⣿⠰⢋⡼⢻⡟⣼⣿⣿⣿⡇⣼⣿⣿⣿⣿⡇⢸⣧⢸⣆⠃⣿⡄⣿⢻⡇
⣿⣿⣿⣿⣿⣷⢠⡇⣾⠏⢸⠇⣧⡙⣛⡉⢰⡿⢃⢸⡇⣿⣿⣿⡿⢰⣿⣿⣿⣿⢿⠃⠘⣿⢸⣿⣷⠙⢃⣿⠸⡇
⣿⣿⣿⣿⣿⣿⢸⣷⠏⣴⢸⢠⣿⣿⡏⠀⠾⢁⣾⡆⠃⠘⢸⣿⢣⣿⣿⠟⣹⠃⠏⡀⠀⡏⣸⣿⠇⣰⠏⡿⠀⣿
⣿⣿⣿⣿⣿⣿⡜⠏⠀⢿⡆⠀⣿⣿⠁⠀⠀⠠⠭⠅⠀⡃⠘⠃⣾⠟⠉⣰⠏⠀⠐⠃⠀⠀⣿⠋⠐⠋⢀⠃⣆⢀⣿
⣿⣿⣿⣿⣿⣿⣿⡄⠀⠘⡟⠀⢿⠇⢰⣀⡀⠀⠀⣦⣄⣹⠀⠘⠁⠀⠐⠋⠀⠀⢠⣄⠀⠈⠁⠀⠀⡀⠀⣼⡏⣸⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠘⢄⠸⠀⠀⠻⣿⣷⣾⣿⣿⠇⢀⡴⣠⠆⢀⣴⣤⣤⣾⡟⠀⠀⠀⠀⢸⠇⣼⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⠀⠀⠀⠑⢄⠈⡛⠿⣿⣇⣠⣾⣿⣣⣾⣿⣿⣿⠟⠉⠀⠀⠀⠀⠀⢸⣾⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⣀⣑⡂⠀⠙⢿⣾⣿⣿⣿⣿⠏⣻⣿⣷⡶⠞⠁⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣁⣶⣿⣿⣿⣿⣿⣶⡄⢉⣙⣿⣿⣻⣺⣿⣯⣥⠄⠀⠀⠀⠀⠀⡤⢰⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⢋⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢭⣿⣿⣿⡿⠟⠉⠀⠀⠀⢀⣴⠀⣴⣧⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡿⠟⣱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠙⢛⣩⣶⣶⣠⠆⣠⣴⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⡿⣋⣵⠆⢠⣿⣿⠏⡁⠀⠈⠹⣿⣿⣿⣿⣿⡿⢀⣤⣼⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⡟⣱⣿⠏⠀⢸⣿⢈⠀⣀⣀⠠⠀⣿⣿⣿⣿⣿⠃⢾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⠟⠀⠀⢸⣿⡀⠑⠨⣭⣤⣾⣿⣿⣿⣿⣇⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣧⣤⣤⠀⠀⠀⢸⣿⣷⣜⣿⣿⣿⣿⣿⣿⡿⠻⠋⡀⠀⠀⢳⣮⣝⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⡇⢹⡇⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⢰⣿⣄⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n<========================================================<\n          By @tanossh.i on discord, or just tanos.\n>========================================================>`
);

const getSelectionStyles = (theme) => `
  ::selection {
    background-color: ${theme.accent}33;
    color: ${theme.accent};
  }
  ::-moz-selection {
    background-color: ${theme.accent}33;
    color: ${theme.accent};
  }
`;

const themes = [
  {
    name: "Dark",
    bg: "#0a0a0a",
    card: "#111111",
    cardInner: "#161616",
    accent: "#f83858",
    border: "#333333",
    emoji: "🌸",
    backgroundImage: "hero-bg.jpg",
    backgroundBlur: "25px",
  },
  {
    name: "AMOLED",
    bg: "#000000",
    card: "#000000",
    cardInner: "#0a0a0a",
    accent: "#ffffff",
    border: "#222222",
    emoji: "🌸",
  },
  {
    name: "tanos's pink",
    bg: "#1a121a",
    card: "#251a25",
    cardInner: "#351f35",
    accent: "#ff80bf",
    border: "#4a2d4a",
    emoji: "🌸",
    backgroundImage: "/images/puresakura.png",
    backgroundBlur: "25px",
  },
  {
    name: "Turquoise",
    bg: "#0a2a2f",
    card: "#0e3339",
    cardInner: "#124045",
    accent: "#40e0d0",
    border: "#1a5761",
    emoji: "🌊",
    backgroundImage: "/images/puresakura.png",
    backgroundBlur: "25px",
  },
  {
    name: "Forest",
    bg: "#0c1a0f",
    card: "#1a2f1d",
    cardInner: "#2a472e",
    accent: "#7fff7f",
    border: "#345439",
    emoji: "🌿",
    backgroundImage: "./images/puresakura.png",
    backgroundBlur: "40px",
  },
  {
    name: "Purple",
    bg: "#1a0c1a",
    card: "#2f1a2f",
    cardInner: "#472e47",
    accent: "#e07fff",
    border: "#543954",
    emoji: "💜",
    backgroundImage: "/images/purple.png",
    backgroundBlur: "10px",
  },
];

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSupported, setShowSupported] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [result, setResult] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    isValid: false,
  });
  const [mediaInfo, setMediaInfo] = useState(null);
  const [downloading, setDownloading] = useState({ mp3: false, mp4: false });
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.31);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(() => {
    return localStorage.getItem("hasAgreedToTerms") === "true";
  });
  const [currentThemeIndex, setCurrentThemeIndex] = useState(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    return savedTheme ? parseInt(savedTheme) : 2;
  });
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);

  const [buttonScale, setButtonScale] = useState(1);

  const glintAnimation = `
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

  const handleButtonMouseDown = () => {
    setButtonScale(0.92);
    setTimeout(() => {
      setButtonScale(1.01);
      setTimeout(() => {
        setButtonScale(1);
      }, 120);
    }, 90);
  };

  const handleButtonMouseUp = () => {
    setButtonScale(1.01);
    setTimeout(() => {
      setButtonScale(1);
    }, 100);
  };

  const handlePaste = (e) => {
    // i lowk forgot
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchData();
      setButtonScale(0.97);
      setTimeout(() => {
        setButtonScale(1);
      }, 100);

      e.target.style.animation = "glint 1s forwards";
      setTimeout(() => {
        e.target.style.animation = "";
      }, 1000);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      ${glintAnimation}
      .bouncy-btn {
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform, box-shadow;
      }
      .bouncy-btn:active, .bouncy-btn.pressed {
        box-shadow: 0 2px 16px 0 rgba(201,84,195,0.25), 0 1.5px 4px 0 rgba(0,0,0,0.12);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [glintAnimation]);

  const getDynamicFontSize = (t) => {
    const s = Math.max(0, t.length - 50 + t.split("\n").length * 10);
    return `${Math.max(0.3, 1 - s * 0.007)}rem`;
  };

  const cycleTheme = () => {
    const newIndex = (currentThemeIndex + 1) % themes.length;
    const preloadIndex = (newIndex + 1) % themes.length;
    const preloadTheme = themes[preloadIndex];

    if (preloadTheme.backgroundImage) {
      const img = new Image();
      img.src = preloadTheme.backgroundImage;
    }

    setCurrentThemeIndex(newIndex);
    localStorage.setItem("selectedTheme", newIndex.toString());
  };

  const currentTheme = themes[currentThemeIndex];

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      ${getSelectionStyles(currentTheme)}

      @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;400;500;600&display=swap');

      body {
        font-family: 'Consolas', 'Inconsolata', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'ss01', 'ss02', 'cv01', 'cv02';
      }

      @media (min-width: 640px) {
        body {
          font-family: 'Consolas', 'Inconsolata', 'Menlo', 'Monaco', monospace;
          -webkit-font-smoothing: auto;
          -moz-osx-font-smoothing: auto;
        }
      }

      textarea::placeholder {
        font-family: 'Consolas', 'Inconsolata', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      @media (min-width: 640px) {
        textarea::placeholder {
          font-family: 'Consolas', 'Inconsolata', 'Menlo', 'Monaco', monospace;
        }
      }
    `;
    document.head.appendChild(style);

    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(link);
    };
  }, [currentTheme]);

  useEffect(() => {
    let animationFrame;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (isHovered) {
        setRotation((prev) => (prev + 0.5) % 360);
        animationFrame = requestAnimationFrame(animate);
      } else {
        const duration = 5000;
        const elapsed = Math.min(progress, duration);
        const easeValue = 1 - elapsed / duration;

        if (rotation !== 0) {
          const newRotation = rotation * easeValue;
          setRotation(newRotation);

          if (Math.abs(newRotation) > 100) {
            animationFrame = requestAnimationFrame(animate);
          } else {
            setRotation(0);
          }
        }
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isHovered, rotation]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * {
        transition: background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleEmojiHover = () => {
    setIsHovered(true);
  };

  const handleEmojiLeave = () => {
    setIsHovered(false);
  };

  const handleEmojiClick = () => {
    setGlowIntensity(0.8);
    setTimeout(() => {
      setGlowIntensity(0.31);
    }, 1000);
  };

  const handleDownload = async (format) => {
    if (format === "mp4" && mediaInfo.durationError) {
      setNotification({
        show: true,
        message: mediaInfo.durationError,
        isValid: false,
      });
      return;
    }

    setDownloading((prev) => ({ ...prev, [format]: true }));
    try {
      window.location.href = `/download?url=${encodeURIComponent(
        mediaInfo.url
      )}&format=${format}`;
    } finally {
      setTimeout(() => {
        setDownloading((prev) => ({ ...prev, [format]: false }));
      }, 2000);
    }
  };

  const cleanUrl = (url) => {
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

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const cleanedValue = cleanUrl(inputValue);
    setResult(cleanedValue);
  };

  const placeholders = [
    "paste your link here :)",
    "enter your link here !",
    "enter any url here :3",
    "place your url in here ;))",
    "what would you want to download?",
  ];
  const [randomPlaceholderText] = React.useState(
    () => placeholders[Math.floor(Math.random() * placeholders.length)]
  );

  const randomTexts = [
    "is this what you were looking for?",
    "here's your result!",
    "does this look right?",
    "is this the file you wanted?",
    "your download is ready!",
    "download your likings ;)",
  ];
  const [randomText] = React.useState(
    () => randomTexts[Math.floor(Math.random() * randomTexts.length)]
  );

  const dontspammyshit = useRef(0);
  const timer = useRef(null);

  const fetchData = async () => {
    let lowerResults = result.toLowerCase();
    if (
      lowerResults === "help" ||
      lowerResults === "commands" ||
      lowerResults === "cmds" ||
      lowerResults === "services"
    ) {
      return setShowSupported(true);
    }

    dontspammyshit.current += 1;

    if (!timer.current) {
      timer.current = setTimeout(() => {
        dontspammyshit.current = 0;
        timer.current = null;
      }, 3000);
    }

    if (dontspammyshit.current >= 3) return;

    if (!result.trim()) {
      setNotification({
        show: true,
        message: "Please enter a URL",
        isValid: false,
      });
      return;
    }
    setIsLoading(true);

    if (mediaInfo) {
      setShowDownloadPanel(false);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    setMediaInfo(null);
    setShowSupported(false);

    const response = await fetch("/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url: result.trim() }),
    });

    if (response.status === 429) {
      setNotification({
        show: true,
        message: "Rate limit exceeded. Please wait before trying again.",
        isValid: false,
      });
      setIsLoading(false);
      return;
    }

    const responseData = await response.json();
    setIsLoading(false);

    if (!responseData.valid) {
      if (responseData.message && responseData.message.includes("too long")) {
        setNotification({
          show: true,
          message:
            "⚠️ " + responseData.message + " Please choose a shorter video.",
          isValid: false,
        });
      } else {
        setNotification({
          show: true,
          message: responseData.message || "Invalid response from server",
          isValid: false,
        });
      }
      setIsLoading(false);
      return;
    }

    if (responseData.mediaInfo) {
      setMediaInfo({
        ...responseData.mediaInfo,
        isFromSpotify:
          responseData.isFromSpotify || responseData.mediaInfo.isFromSpotify,
      });
      setNotification({
        show: true,
        message: responseData.message,
        isValid: true,
      });
    } else {
      throw new Error("No media info received from server");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showRomanizedPopup, setShowRomanizedPopup] = useState(false);
  const [isYesLoading, setIsYesLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDonationMenu, setShowDonationMenu] = useState(false);

  const hasJapanese = (text) => {
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

  useEffect(() => {
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const refreshTimer = setTimeout(() => {
      window.location.reload();
    }, TWO_HOURS);

    return () => clearTimeout(refreshTimer);
  }, []);

  useEffect(() => {
    if (mediaInfo) {
      setTimeout(() => {
        setShowDownloadPanel(true);
      }, 50);
    } else {
      setShowDownloadPanel(false);
    }
  }, [mediaInfo]);

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full relative overflow-x-hidden scale-[0.5] sm:scale-50"
      style={{
        backgroundColor: currentTheme.bg,
        backgroundImage: currentTheme.backgroundImage
          ? `url(${currentTheme.backgroundImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitTransform: "translateZ(0)",
        WebkitPerspective: 1000,
        perspective: 1000,
      }}
    >
      {currentTheme.backgroundBlur && (
        <div
          className="fixed inset-0"
          style={{
            backdropFilter: `blur(${currentTheme.backgroundBlur})`,
            backgroundColor: `${currentTheme.bg}80`,
            zIndex: 1,
            willChange: "backdrop-filter",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
            WebkitPerspective: 1000,
            perspective: 1000,
          }}
        />
      )}

      <div
        id="notification"
        className={`fixed backdrop-blur-xl backdrop-saturate-150 top-6 left-1/2 -translate-x-1/2 p-4 rounded-lg border transition-all duration-300 z-[100] ease-in-out max-w-[90%] ${
          notification.show
            ? "opacity-60 translate-y-0"
            : "opacity-0 -translate-y-4"
        } ${
          notification.isValid
            ? `bg-[rgba(37,26,37,0.7)] border-[border-color: rgba(74, 45, 74, 0.5)] text-white`
            : `bg-[rgba(37,26,37,0.7)] border-[border-color: rgba(74, 45, 74, 0.5)] text-white`
        }`}
      >
        {notification.message}
      </div>

      <div className="flex items-start justify-center w-full px-4 relative z-10">
        <div className="flex flex-col items-center w-full max-w-[600px]">
          <div
            style={{
              backgroundColor: `${currentTheme.card}b3`,
              borderColor: `${currentTheme.border}80`,
              position: "relative",
              zIndex: 20,
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              WebkitTransform: "translateZ(0)",
              WebkitPerspective: 1000,
              perspective: 1000,
            }}
            className="backdrop-blur-xl backdrop-saturate-150 p-4 sm:p-8 rounded-xl border flex flex-col items-center w-full shadow-xl relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 w-full h-full flex flex-col items-center transition-all duration-500 ${
                showDonationMenu
                  ? "translate-x-0 opacity-100 pointer-events-auto"
                  : "translate-x-[100%] opacity-0 pointer-events-none"
              }`}
              style={{
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                zIndex: 21,
                transform: showDonationMenu
                  ? "translateZ(0) translateX(0)"
                  : "translateZ(0) translateX(100%)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: showDonationMenu
                  ? "translateZ(0) translateX(0)"
                  : "translateZ(0) translateX(100%)",
                WebkitPerspective: 1000,
                perspective: 1000,
              }}
            >
              <div className="flex flex-col items-center w-full gap-4 p-4 sm:p-8">
                <div className="flex items-center justify-between w-full mb-4">
                  <h2 className="text-lg sm:text-2xl font-semibold text-gray-200">
                    Support the Project
                  </h2>
                  <button
                    onClick={() => setShowDonationMenu(false)}
                    className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer text-lg sm:text-xl"
                  >
                    ←
                  </button>
                </div>

                <div className="flex flex-col w-full gap-4">
                  <div className="hidden sm:flex flex-row w-full h-[240px] gap-4">
                    <button
                      onClick={() =>
                        window.open(
                          "https://www.paypal.com/paypalme/tanospaypal",
                          "_blank"
                        )
                      }
                      className="w-1/2 h-full backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-3 hover:bg-[#0070ba]/10 cursor-pointer"
                      style={{
                        backgroundColor: `${currentTheme.accent}15`,
                        borderColor: `${currentTheme.accent}40`,
                        transform: `scale(${buttonScale})`,
                      }}
                      onMouseDown={handleButtonMouseDown}
                      onMouseUp={handleButtonMouseUp}
                    >
                      <span className="text-4xl">💵</span>
                      <span className="text-2xl">PayPal</span>
                    </button>

                    <div className="flex flex-col w-1/2 gap-4">
                      <button
                        onClick={() => alert("Coming soon!")}
                        className="h-[116px] backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:bg-[#29b6f6]/10 cursor-pointer"
                        style={{
                          backgroundColor: `${currentTheme.accent}15`,
                          borderColor: `${currentTheme.accent}40`,
                          transform: `scale(${buttonScale})`,
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        <span className="text-2xl">🚀</span>
                        <span className="text-xl">Crypto</span>
                      </button>

                      <button
                        onClick={() =>
                          window.open("https://ko-fi.com/taanoss", "_blank")
                        }
                        className="h-[116px] backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:bg-[#ea4aaa]/10 cursor-pointer"
                        style={{
                          backgroundColor: `${currentTheme.accent}15`,
                          borderColor: `${currentTheme.accent}40`,
                          transform: `scale(${buttonScale})`,
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        <span className="text-xl">☕</span>
                        <span className="text-lg">Ko-fi (Card n PayPal)</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:hidden flex-col w-full gap-2">
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => alert("Coming soon!")}
                        className="w-[80px] h-[80px] backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:bg-[#29b6f6]/10 cursor-pointer"
                        style={{
                          backgroundColor: `${currentTheme.accent}15`,
                          borderColor: `${currentTheme.accent}40`,
                          transform: `scale(${buttonScale})`,
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        <span className="text-lg">🚀</span>
                        <span className="text-xs">Crypto</span>
                      </button>

                      <button
                        onClick={() =>
                          window.open(
                            "https://www.paypal.com/paypalme/tanospaypal",
                            "_blank"
                          )
                        }
                        className="flex-1 h-[80px] backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:bg-[#0070ba]/10 cursor-pointer"
                        style={{
                          backgroundColor: `${currentTheme.accent}15`,
                          borderColor: `${currentTheme.accent}40`,
                          transform: `scale(${buttonScale})`,
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        <span className="text-2xl">💵</span>
                        <span className="text-sm">PayPal</span>
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        window.open("https://ko-fi.com/taanoss", "_blank")
                      }
                      className="w-full h-[100px] backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 hover:bg-[#ea4aaa]/10 cursor-pointer"
                      style={{
                        backgroundColor: `${currentTheme.accent}15`,
                        borderColor: `${currentTheme.accent}40`,
                        transform: `scale(${buttonScale})`,
                      }}
                      onMouseDown={handleButtonMouseDown}
                      onMouseUp={handleButtonMouseUp}
                    >
                      <span className="text-xl">☕</span>
                      <span className="text-sm">Ko-fi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`w-full transition-all duration-500 ${
                showDonationMenu
                  ? "-translate-x-[100%] opacity-0 pointer-events-none"
                  : "translate-x-0 opacity-100 pointer-events-auto"
              }`}
              style={{
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="flex flex-col items-center space-y-2 mb-6">
                <span
                  id="emoji"
                  className="text-4xl sm:text-6xl filter drop-shadow-lg relative cursor-pointer"
                  style={{
                    filter: `drop-shadow(0 0 8px ${
                      currentTheme.accent
                    }${Math.round(glowIntensity * 255).toString(16)})`,
                    textShadow: `0 0 10px ${currentTheme.accent}${Math.round(
                      glowIntensity * 255
                    ).toString(16)}`,
                    transform: `rotate(${rotation}deg)`,
                    transition:
                      "transform 0.1s linear, filter 0.3s ease-in-out, text-shadow 0.3s ease-in-out",
                  }}
                  onMouseEnter={handleEmojiHover}
                  onMouseLeave={handleEmojiLeave}
                  onClick={handleEmojiClick}
                >
                  {currentTheme.emoji}
                </span>
                <h1
                  className="text-xl sm:text-2xl font-semibold text-gray-200"
                  style={{
                    marginBottom: "0",
                    marginTop: "5px",
                  }}
                >
                  tanos's free media
                </h1>
                <p className="text-sm sm:text-base text-gray-400 text-center">
                  a quick yet ad-free media downloader
                </p>
                <button
                  className="text-sm sm:text-base text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                  onClick={() =>
                    setShowSupported(!showSupported) & setSelectedPlatform(null)
                  }
                >
                  supported platforms
                  <span
                    className="inline-block transition-transform duration-300"
                    style={{
                      transform: `rotate(${showSupported ? 180 : 0}deg)`,
                    }}
                  >
                    ▾
                  </span>
                </button>
              </div>

              <div
                className={`w-full overflow-hidden transition-all duration-500 ${
                  showSupported
                    ? "max-h-[1000px] opacity-100 mb-6"
                    : "max-h-0 opacity-0"
                }`}
                style={{
                  transform: `translateY(${showSupported ? "0" : "-10px"})`,
                  transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="p-4 bg-[#0a0a0a]/50 backdrop-blur-lg rounded-lg border border-[#333333]/50 relative">
                  <div
                    className={`grid grid-cols-2 gap-4 transition-all duration-500 ease-in-out ${
                      selectedPlatform
                        ? "opacity-0 -translate-y-4 pointer-events-none"
                        : "opacity-100 translate-y-0"
                    }`}
                    style={{
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div
                      onClick={() => setSelectedPlatform("youtube")}
                      className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
                    >
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
                      <span className="text-red-500 text-lg sm:text-xl">
                        🎬
                      </span>
                      <div>
                        <p
                          className="text-sm sm:text-base text-gray-200"
                          style={{
                            fontSize: "0.9rem",
                          }}
                        >
                          Youtube (+ music)
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Videos & Premium Music
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelectedPlatform("soundcloud")}
                      className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
                    >
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
                      <span className="text-xl">☁️</span>
                      <div>
                        <p
                          className="text-gray-200"
                          style={{
                            fontSize: "0.9rem",
                          }}
                        >
                          Soundcloud
                        </p>
                        <p className="text-xs text-gray-400">Tracks</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelectedPlatform("spotify")}
                      className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
                    >
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
                      <span className="text-xl">💚</span>
                      <div>
                        <p
                          className="text-gray-200"
                          style={{
                            fontSize: "0.7rem",
                          }}
                        >
                          Spotify
                        </p>
                        <p className="text-xs text-gray-400">Songs only</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelectedPlatform("lyrics")}
                      className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
                    >
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
                      <span className="text-xl">📝</span>
                      <div>
                        <p
                          className="text-gray-200"
                          style={{
                            fontSize: "0.7rem",
                          }}
                        >
                          Lyrics
                        </p>
                        <p className="text-xs text-gray-400">
                          After music link grabbed
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelectedPlatform("social")}
                      className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer col-span-2 hover:bg-[#161616]/80 relative"
                    >
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
                      <span className="text-xl">🌐</span>
                      <div>
                        <p
                          className="text-gray-200"
                          style={{
                            fontSize: "0.7rem",
                          }}
                        >
                          Tiktok, Twitter & Instagram
                        </p>
                        <p className="text-xs text-gray-400">Short Videos</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 p-4 transition-all duration-500 ease-in-out ${
                      selectedPlatform
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                    style={{
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: `translateY(${
                        selectedPlatform ? "0" : "20px"
                      })`,
                    }}
                  >
                    <div
                      className="flex items-center justify-between mb-4"
                      style={{ marginTop: "2%" }}
                    >
                      <h3 className="text-xl font-semibold text-gray-200">
                        {selectedPlatform === "youtube" && "🎬 YouTube"}
                        {selectedPlatform === "soundcloud" && "☁️ SoundCloud"}
                        {selectedPlatform === "spotify" && "💚 Spotify"}
                        {selectedPlatform === "anime" && "🍿 Animes"}
                        {selectedPlatform === "lyrics" && "📝 Lyrics"}
                        {selectedPlatform === "social" && "🌐 Social Media"}
                      </h3>
                    </div>
                    <div className="space-y-4 text-left">
                      <p
                        className="text-gray-300"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {selectedPlatform === "youtube" &&
                          "Downloading YouTube videos is a quite simple step as it only requires ytdl-core for scraping information and the ruhend-scraper for downloading the video, Downloading MP3 from Youtube Music was a quite hard thing to do, as we start with ytdl-core for scraping information, ruhend-scraper for downloading the non-converted audio file, Last.FM for the artwork or image buffering, and finally ffmpeg for converting the audio file to a proper mp3 with the artwork added. This may be the reason downloads will take a couple extra seconds."}
                        {selectedPlatform === "soundcloud" &&
                          "Download tracks via soundcloud using scdl (soundcloud-downloader) package, which automatically handles the covers whereby the downloads are instant. Downloads are done with the soundcloud.com base url."}
                        {selectedPlatform === "spotify" &&
                          "Spotify songs are scraped via the query package and the official spotify package. The songs are downloaded via the youtube-music api while searching for the best results. Downloads will take a couple extra seconds."}
                        {selectedPlatform === "lyrics" &&
                          "Lyrics are grabbed using LrcLib, QQ Music, and NetEase."}
                        {selectedPlatform === "social" &&
                          "We use ruhend-scraper for downloading videos."}
                      </p>
                    </div>
                    <div
                      className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[75%]"
                      style={{ marginTop: "10px" }}
                    >
                      <button
                        onClick={() => setSelectedPlatform(null)}
                        className="w-full px-3 py-2 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer text-gray-200"
                      >
                        Back to the supported platform list
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {!hasAgreedToTerms ? (
                <div
                  className={`w-full space-y-4 transition-all duration-500`}
                  style={{
                    opacity: isFadingOut ? 0 : 1,
                    transform: `translateY(${isFadingOut ? "-10px" : "0"})`,
                    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    position: "relative",
                    minHeight: "200px",
                  }}
                >
                  <div className="p-4 bg-[#0a0a0a]/60 backdrop-blur-lg rounded-lg border border-[#333333]/50">
                    <p className="text-gray-200 text-center mb-4">
                      Before continuing, please agree with our terms of
                      conditions and privacy policy.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setShowTerms(!showTerms);
                          setShowPrivacy(false);
                        }}
                        className="text-gray-400 hover:text-gray-200 transition-colors text-sm cursor-pointer"
                      >
                        Terms of Service
                      </button>
                      <button
                        onClick={() => {
                          setShowPrivacy(!showPrivacy);
                          setShowTerms(false);
                        }}
                        className="text-gray-400 hover:text-gray-200 transition-colors text-sm cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                    </div>
                  </div>

                  <div
                    className={`w-full overflow-hidden transition-all duration-500 ${
                      showTerms
                        ? "max-h-[500px] opacity-100 mb-6"
                        : "max-h-0 opacity-0"
                    }`}
                    style={{
                      transform: `translateY(${showTerms ? "0" : "-10px"})`,
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div className="p-4 bg-[#0a0a0a]/50 backdrop-blur-lg rounded-lg border border-[#333333]/50">
                      <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-200">
                          Terms of Service
                        </h3>
                        <div className="space-y-4 text-xs sm:text-sm text-gray-300">
                          <p>
                            By using this site, you agree to these terms. If you
                            don't agree, don't use the site.
                          </p>
                          <p>
                            This site is for personal, non-commercial use only.
                            You are responsible for how you use downloaded
                            media. Don't use this site to download copyrighted
                            material without permission. We (tanos.is-a.dev) are
                            not responsible for any copyright issues you might
                            face.
                          </p>
                          <p>
                            This site is provided "as is," with no guarantees.
                            We don't guarantee the site will always be available
                            or error-free. We are not responsible for any
                            damages from using this site. We are not liable for
                            any direct or indirect damages. We reserve the right
                            to update these terms at any time without notice.
                            Any link sent and downloaded will automatically be
                            deleted after 5 minutes for saving resources.
                          </p>
                          <p>
                            We will not be liable for any issues arising from
                            the use of this site, this is all pure for
                            educational purposes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-full overflow-hidden transition-all duration-500 ${
                      showPrivacy
                        ? "max-h-[500px] opacity-100 mb-6"
                        : "max-h-0 opacity-0"
                    }`}
                    style={{
                      transform: `translateY(${showPrivacy ? "0" : "-10px"})`,
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div className="p-4 bg-[#0a0a0a]/50 backdrop-blur-lg rounded-lg border border-[#333333]/50">
                      <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-200">
                          Privacy Policy
                        </h3>
                        <div className="space-y-4 text-xs sm:text-sm text-gray-300">
                          <p>
                            We (tanos.is-a.dev, tanos, tanossh.i) do not store
                            any user personal data.
                          </p>
                          <p>We do not sell your information.</p>
                          <p>
                            We do not collect personally identifiable
                            information (PII) such as your name, email, or
                            address.
                          </p>
                          <p>
                            We may store your download history for a limited
                            time to improve our service.
                          </p>
                          <p>
                            We may collect your IP address for limited purposes
                            to prevent abuse.
                          </p>
                          <p>We may use cookies to improve your experience.</p>
                          <p>
                            This site is not intended for children under 13.
                          </p>
                          <p>
                            We reserve the right to update this policy at any
                            time without notice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsFadingOut(true);
                      setTimeout(() => {
                        localStorage.setItem("hasAgreedToTerms", "true");
                        setHasAgreedToTerms(true);
                      }, 500);
                    }}
                    className="w-full px-12 py-3 backdrop-blur-lg text-gray-200 rounded-lg border flex items-center text-lg justify-center cursor-pointer"
                    style={{
                      backgroundColor: `${currentTheme.accent}33`,
                      borderColor: `${currentTheme.accent}66`,
                      transform: `scale(${buttonScale})`,
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    onMouseDown={handleButtonMouseDown}
                    onMouseUp={handleButtonMouseUp}
                  >
                    <span className="flex items-center gap-2">
                      I Agree <span className="text-xl">✓</span>
                    </span>
                  </button>
                </div>
              ) : (
                <div
                  className={`w-full transition-all duration-500`}
                  style={{
                    opacity: hasAgreedToTerms ? 1 : 0,
                    transform: `translateY(${hasAgreedToTerms ? "0" : "10px"})`,
                    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  {showRomanizedPopup ? (
                    <div className="w-full space-y-4">
                      <div className="p-4 bg-[#0a0a0a]/60 backdrop-blur-lg rounded-lg border border-[#333333]/50">
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">
                          Download Options
                        </h3>
                        <p className="text-gray-400 mb-2">
                          {isProcessing
                            ? "This might take a while, the file is being processed on our server"
                            : "Download the lyrics romanized + english translation?"}
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          Example: Tsubasa o Kudasai (Please give me wings)
                        </p>
                        <div className="flex gap-3">
                          <button
                            className="flex-1 px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 cursor-pointer"
                            style={{
                              backgroundColor: `${currentTheme.accent}33`,
                              borderColor: `${currentTheme.accent}66`,
                              transform: `scale(${buttonScale})`,
                              transition: "transform 0.2s ease",
                              "&:hover": {
                                backgroundColor: `${currentTheme.accent}44`,
                                borderColor: `${currentTheme.accent}88`,
                              },
                            }}
                            onMouseDown={handleButtonMouseDown}
                            onMouseUp={handleButtonMouseUp}
                            onClick={async () => {
                              setIsYesLoading(true);
                              setIsProcessing(true);
                              try {
                                setIsLoadingLyrics(true);
                                const lyricsUrl = `/lyrics?url=${encodeURIComponent(
                                  mediaInfo.title
                                )}&romanized=true`;
                                console.log("Fetching lyrics from:", lyricsUrl);

                                const response = await fetch(lyricsUrl, {
                                  method: "GET",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                  },
                                });
                                if (!response.ok) {
                                  setNotification({
                                    show: true,
                                    message: "No lyrics found for this song 🎵",
                                    isValid: false,
                                  });
                                  return;
                                }
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${mediaInfo.title}.lrc`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                setNotification({
                                  show: true,
                                  message: "Failed to download lyrics",
                                  isValid: false,
                                });
                              } finally {
                                setIsLoadingLyrics(false);
                                setIsYesLoading(false);
                                setIsProcessing(false);
                                setShowRomanizedPopup(false);
                              }
                            }}
                          >
                            <div className="flex items-center justify-center gap-2">
                              Yes
                              {isYesLoading && (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              )}
                            </div>
                          </button>
                          <button
                            className="flex-1 px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 cursor-pointer"
                            style={{
                              backgroundColor: `${currentTheme.accent}33`,
                              borderColor: `${currentTheme.accent}66`,
                              transform: `scale(${buttonScale})`,
                              transition: "transform 0.2s ease",
                              "&:hover": {
                                backgroundColor: `${currentTheme.accent}44`,
                                borderColor: `${currentTheme.accent}88`,
                              },
                            }}
                            onMouseDown={handleButtonMouseDown}
                            onMouseUp={handleButtonMouseUp}
                            onClick={async () => {
                              setShowRomanizedPopup(false);
                              try {
                                setIsLoadingLyrics(true);
                                const lyricsUrl = `/lyrics?url=${encodeURIComponent(
                                  mediaInfo.title
                                )}`;
                                console.log("Fetching lyrics from:", lyricsUrl);

                                const response = await fetch(lyricsUrl, {
                                  method: "GET",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                  },
                                });

                                console.log(
                                  "Lyrics response status:",
                                  response.status
                                );
                                if (!response.ok) {
                                  setNotification({
                                    show: true,
                                    message: "No lyrics found for this song 🎵",
                                    isValid: false,
                                  });
                                  return;
                                }
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${mediaInfo.title}.lrc`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                setNotification({
                                  show: true,
                                  message: "Failed to download lyrics",
                                  isValid: false,
                                });
                              } finally {
                                setIsLoadingLyrics(false);
                              }
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <textarea
                        id="tracker-text"
                        className="w-full p-3 rounded-lg bg-[#0a0a0a]/60 backdrop-blur-lg border border-[#333333]/50 text-gray-200 resize-none focus:outline-none focus:border-[#444444]/70 transition-colors placeholder-gray-500 text-xs sm:text-base"
                        rows="1"
                        placeholder={randomPlaceholderText}
                        value={result}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        style={{
                          fontSize: getDynamicFontSize(result),
                          transition:
                            "color 0.2s ease, background-color 0.2s ease",
                          caretColor: currentTheme.accent,
                        }}
                      />

                      <button
                        onClick={fetchData}
                        id="fc"
                        className={`mt-4 px-12 py-3 backdrop-blur-lg text-gray-200 rounded-lg border flex items-center text-base sm:text-lg w-full justify-center transition-all duration-200 cursor-pointer`}
                        style={{
                          backgroundColor: `${currentTheme.accent}33`,
                          borderColor: `${currentTheme.accent}66`,
                          transform: `scale(${buttonScale})`,
                          transition: "transform 0.2s ease",
                          "&:hover": {
                            backgroundColor: `${currentTheme.accent}44`,
                            borderColor: `${currentTheme.accent}88`,
                          },
                        }}
                        onMouseDown={handleButtonMouseDown}
                        onMouseUp={handleButtonMouseUp}
                      >
                        <span id="btn-text" className="flex items-center gap-2">
                          grab <span className="text-lg sm:text-xl">⚡</span>
                        </span>
                        <svg
                          id="spinner"
                          className={`w-5 h-5 ml-3 ${
                            isLoading ? "" : "hidden"
                          } animate-spin text-gray-200`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )}

              {mediaInfo && (
                <div
                  className="w-full overflow-hidden transition-all duration-1200 ease-in-out max-h-96 mt-6"
                  style={{
                    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: showDownloadPanel
                      ? "translateY(0)"
                      : "translateY(20px)",
                    opacity: showDownloadPanel ? 1 : 0,
                  }}
                >
                  <div
                    className="p-4 bg-[#0a0a0a]/60 backdrop-blur-lg rounded-lg border border-[#333333]/50"
                    style={{
                      transform: showDownloadPanel
                        ? "translateY(0)"
                        : "translateY(20px)",
                      opacity: showDownloadPanel ? 1 : 0,
                      transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-200">
                        {randomText}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {mediaInfo.isTwitter ? (
                        <>
                          <div className="flex items-center gap-3 bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                            <img
                              src={
                                mediaInfo.profilePicture ||
                                "https://abs.twimg.com/sticky/default_profile_images/default_profile.png"
                              }
                              alt="Profile"
                              className="w-12 h-12 rounded-full border border-[#444444]"
                            />
                            <div>
                              <p className="text-gray-200 font-semibold">
                                {mediaInfo.author || "Twitter User"}
                              </p>
                              <p className="text-gray-400 text-sm">
                                @{mediaInfo.username || "user"}
                              </p>
                            </div>
                          </div>
                          <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                            <p className="text-gray-400 text-sm">Tweet</p>
                            <p className="text-gray-200">
                              {mediaInfo.title || "Twitter Media"}
                            </p>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Likes</p>
                              <p className="text-gray-200">
                                {mediaInfo.likes || "0"}
                              </p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Retweets</p>
                              <p className="text-gray-200">
                                {mediaInfo.retweets || "0"}
                              </p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Views</p>
                              <p className="text-gray-200">
                                {mediaInfo.views || "0"}
                              </p>
                            </div>
                            <button
                              className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50 hover:bg-[#161616] transition-all duration-200 flex flex-col items-center cursor-pointer justify-center"
                              onClick={() => handleDownload("mp4")}
                              disabled={downloading.mp4}
                              style={{
                                backgroundColor: `${currentTheme.accent}33`,
                                borderColor: `${currentTheme.accent}66`,
                                "&:hover": {
                                  backgroundColor: `${currentTheme.accent}44`,
                                  borderColor: `${currentTheme.accent}88`,
                                },
                              }}
                            >
                              {downloading.mp4 ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <>
                                  <p className="text-gray-400 text-sm">
                                    Download
                                  </p>
                                  <p className="text-gray-200 text-sm">
                                    MP4 🎥
                                  </p>
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      ) : mediaInfo.isTikTok ? (
                        <>
                          <div className="flex items-center gap-3 bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                            <img
                              src={mediaInfo.profilePicture}
                              alt="Profile"
                              className="w-12 h-12 rounded-full border border-[#444444]"
                            />
                            <div>
                              <p className="text-gray-200 font-semibold">
                                {mediaInfo.author}
                              </p>
                              <p className="text-gray-400 text-sm">
                                @{mediaInfo.username}
                              </p>
                            </div>
                          </div>
                          <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                            <p className="text-gray-400 text-sm">Caption</p>
                            <p className="text-gray-200">{mediaInfo.title}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Likes</p>
                              <p className="text-gray-200">{mediaInfo.likes}</p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Comments</p>
                              <p className="text-gray-200">
                                {mediaInfo.comments}
                              </p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Favorites</p>
                              <p className="text-gray-200">
                                {mediaInfo.bookmark}
                              </p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Views</p>
                              <p className="text-gray-200">{mediaInfo.views}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                            <p className="text-gray-400 text-sm">Title</p>
                            <p
                              className="text-gray-200 truncate"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {mediaInfo.title}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Duration</p>
                              <p
                                className={
                                  mediaInfo.durationError
                                    ? "text-[#ff6b6b] underline decoration-[#ff6b6b]/50 cursor-pointer"
                                    : "text-gray-200"
                                }
                                onClick={() => {
                                  if (mediaInfo.durationError) {
                                    setNotification({
                                      show: true,
                                      message: "⚠️ " + mediaInfo.durationError,
                                      isValid: false,
                                    });
                                  }
                                }}
                              >
                                {mediaInfo.duration}
                              </p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Quality</p>
                              <p className="text-gray-200">
                                {mediaInfo.quality}
                              </p>
                            </div>
                            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                              <p className="text-gray-400 text-sm">Size</p>
                              <p className="text-gray-200">{mediaInfo.size}</p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex gap-3">
                        <div className="flex-1 flex gap-2">
                          {!mediaInfo.isFromSpotify &&
                            !mediaInfo.isFromSoundCloud &&
                            !mediaInfo.isTwitter &&
                            (mediaInfo.isTikTok ||
                              !mediaInfo.isFromSpotify) && (
                              <button
                                className={`flex-1 px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                                  mediaInfo.isFromSpotify ||
                                  mediaInfo.isFromSoundCloud
                                    ? "w-full"
                                    : ""
                                }`}
                                style={{
                                  fontSize: "1rem",
                                  backgroundColor: mediaInfo.durationError
                                    ? `${currentTheme.accent}15`
                                    : `${currentTheme.accent}33`,
                                  borderColor: mediaInfo.durationError
                                    ? `${currentTheme.accent}20`
                                    : `${currentTheme.accent}66`,
                                  opacity: mediaInfo.durationError
                                    ? "0.5"
                                    : "1",
                                  "&:hover": {
                                    backgroundColor: mediaInfo.durationError
                                      ? `${currentTheme.accent}15`
                                      : `${currentTheme.accent}44`,
                                    borderColor: mediaInfo.durationError
                                      ? `${currentTheme.accent}20`
                                      : `${currentTheme.accent}88`,
                                  },
                                }}
                                onClick={() => handleDownload("mp4")}
                                disabled={
                                  downloading.mp4 || mediaInfo.durationError
                                }
                              >
                                {downloading.mp4 ? (
                                  <>
                                    <svg
                                      className="animate-spin h-5 w-5 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    <span>Downloading...</span>
                                  </>
                                ) : (
                                  <>
                                    {mediaInfo.isTikTok
                                      ? "Download Video"
                                      : "MP4"}{" "}
                                    <span className="text-xl">
                                      {mediaInfo.durationError ? "❌" : "🎥"}
                                    </span>
                                    {mediaInfo.isEMedia ? "Download Media" : ""}{" "}
                                    <span className="text-xl">
                                      {mediaInfo.isEMedia ? "🍿" : ""}
                                    </span>
                                  </>
                                )}
                              </button>
                            )}
                          {!mediaInfo.isTikTok &&
                            !mediaInfo.isEMedia &&
                            !mediaInfo.isTwitter && (
                              <button
                                className={`flex-1 px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                                  mediaInfo.isFromSpotify ||
                                  mediaInfo.isFromSoundCloud
                                    ? "w-full"
                                    : ""
                                }`}
                                style={{
                                  fontSize: "1rem",
                                  backgroundColor: `${currentTheme.accent}33`,
                                  borderColor: `${currentTheme.accent}66`,
                                  "&:hover": {
                                    backgroundColor: `${currentTheme.accent}44`,
                                    borderColor: `${currentTheme.accent}88`,
                                  },
                                }}
                                onClick={() => handleDownload("mp3")}
                                disabled={downloading.mp3}
                              >
                                {downloading.mp3 ? (
                                  <>
                                    <svg
                                      className="animate-spin h-5 w-5 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    <span>Downloading...</span>
                                  </>
                                ) : (
                                  <>
                                    {mediaInfo.isFromSpotify ||
                                    mediaInfo.isFromSoundCloud
                                      ? "Download MP3"
                                      : "MP3"}{" "}
                                    <span className="text-xl">🎵</span>
                                  </>
                                )}
                              </button>
                            )}
                        </div>
                        {(mediaInfo.hasLyrics ||
                          mediaInfo.isFromSpotify ||
                          mediaInfo.isFromSoundCloud) &&
                          !mediaInfo.isTikTok &&
                          !mediaInfo.isEMedia &&
                          !mediaInfo.isTwitter && (
                            <>
                              <button
                                className="px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                  fontSize: "1rem",
                                  backgroundColor: `${currentTheme.accent}33`,
                                  borderColor: `${currentTheme.accent}66`,
                                  "&:hover": {
                                    backgroundColor: `${currentTheme.accent}44`,
                                    borderColor: `${currentTheme.accent}88`,
                                  },
                                }}
                                onClick={() => {
                                  if (hasJapanese(mediaInfo.title)) {
                                    setShowRomanizedPopup(true);
                                  } else {
                                    (async () => {
                                      try {
                                        setIsLoadingLyrics(true);
                                        const lyricsUrl = `/lyrics?url=${encodeURIComponent(
                                          mediaInfo.title
                                        )}`;
                                        console.log(
                                          "Fetching lyrics from:",
                                          lyricsUrl
                                        );

                                        const response = await fetch(
                                          lyricsUrl,
                                          {
                                            method: "GET",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                              Accept: "application/json",
                                            },
                                          }
                                        );
                                        if (!response.ok) {
                                          setNotification({
                                            show: true,
                                            message:
                                              "No lyrics found for this song 🎵",
                                            isValid: false,
                                          });
                                          return;
                                        }
                                        const blob = await response.blob();
                                        const url =
                                          window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `${mediaInfo.title}.lrc`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      } catch (error) {
                                        setNotification({
                                          show: true,
                                          message: "Failed to download lyrics",
                                          isValid: false,
                                        });
                                      } finally {
                                        setIsLoadingLyrics(false);
                                      }
                                    })();
                                  }
                                }}
                              >
                                {isLoadingLyrics ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <span className="text-xl">📝</span>
                                )}
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 mt-6">
            <button
              onClick={() => {
                setShowDonationMenu(true);
                setMediaInfo(null);
                setShowSupported(false);
              }}
              className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-2 cursor-pointer"
            >
              <div className="relative overflow-hidden group">
                <span className="relative z-10">
                  like the project? consider donating by pressing here
                </span>
                <div
                  className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${currentTheme.accent}33 25%, ${currentTheme.accent}33 75%, transparent)`,
                    width: "200%",
                  }}
                />
              </div>
              <span className="text-xl">☕</span>
            </button>
            <button
              onClick={cycleTheme}
              className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-2 cursor-pointer"
            >
              cycle theme by pressing here ({currentTheme.name})
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 right-7 text-gray-200 text-sm z-11 opacity-7 hidden sm:block">
        v1.0.a4
      </div>
    </div>
  );
}

export default App;
