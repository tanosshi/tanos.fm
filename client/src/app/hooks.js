/** @file components.js
 * @description The file containing the variables and functions used for the front-end.
 */

import { useState, useEffect } from "react";

export const useButtonScale = () => {
  const [buttonScale, setButtonScale] = useState(1);

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

  return { buttonScale, handleButtonMouseDown, handleButtonMouseUp };
};

export const useEmojiAnimation = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.31);

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

  return {
    rotation,
    isHovered,
    glowIntensity,
    handleEmojiHover,
    handleEmojiLeave,
    handleEmojiClick,
  };
};

export const useTheme = (themes) => {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    return savedTheme ? parseInt(savedTheme) : 0;
  });

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

  return { currentThemeIndex, cycleTheme };
};

export const useTermsAgreement = () => {
  const [isAgreeing, setIsAgreeing] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(() => {
    return localStorage.getItem("hasAgreedToTerms") === "true";
  });
  const [isFadingOut, setIsFadingOut] = useState(false);

  const agreeToTerms = () => {
    setIsAgreeing(true);

    setTimeout(() => {
      setIsFadingOut(true);

      setTimeout(() => {
        localStorage.setItem("hasAgreedToTerms", "true");
        setHasAgreedToTerms(true);
        setIsAgreeing(false);
      }, 300);
    }, 1000);
  };

  return {
    isAgreeing,
    hasAgreedToTerms,
    isFadingOut,
    agreeToTerms,
  };
};

export const useDownload = () => {
  const [downloading, setDownloading] = useState({ mp3: false, mp4: false });

  const handleDownload = async (format, mediaInfo, setNotification) => {
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

  return { downloading, handleDownload };
};

export const useLyrics = () => {
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showRomanizedPopup, setShowRomanizedPopup] = useState(false);
  const [isYesLoading, setIsYesLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  return {
    isLoadingLyrics,
    setIsLoadingLyrics,
    showRomanizedPopup,
    setShowRomanizedPopup,
    isYesLoading,
    setIsYesLoading,
    isProcessing,
    setIsProcessing,
  };
};
