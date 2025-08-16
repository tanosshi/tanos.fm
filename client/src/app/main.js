/** @file main.js
 * @description the main code, shares parts with components.js
 */

import React, { useState, useEffect, useRef } from "react";
import { themes, getSelectionStyles } from "./themes.js";
import {
  getDynamicFontSize,
  cleanUrl,
  hasJapanese,
  placeholders,
  randomTexts,
  glintAnimation,
} from "./utils.js";
import {
  useButtonScale,
  useEmojiAnimation,
  useTheme,
  useTermsAgreement,
  useDownload,
  useLyrics,
} from "./hooks.js";
import {
  NotificationPanel,
  BackgroundBlur,
  HeaderSection,
  SearchInput,
  SearchButton,
  DownloadPanel,
  FooterSection,
} from "./components.js";

const customStyles = `
  <style>
    @keyframes fadeInBg {
      from {
        opacity: 0;
        backdrop-filter: blur(0px);
      }
      to {
        opacity: 1;
        backdrop-filter: blur(25px);
      }
    }
    
    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes floatUp {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes glowPulse {
      0%, 100% {
        filter: drop-shadow(0 0 8px var(--accent-color));
      }
      50% {
        filter: drop-shadow(0 0 16px var(--accent-color));
      }
    }
  </style>
`;

if (typeof document !== "undefined") {
  const styleElement = document.createElement("div");
  styleElement.innerHTML = customStyles;
  document.head.appendChild(styleElement.firstElementChild);
}

function App() {
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupported, setShowSupported] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [, setSelectedPlatform] = useState(null);
  const [result, setResult] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    isValid: false,
  });
  const [mediaInfo, setMediaInfo] = useState(null);
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);

  const { buttonScale, handleButtonMouseDown, handleButtonMouseUp } =
    useButtonScale();
  const {
    rotation,
    isHovered,
    glowIntensity,
    handleEmojiHover,
    handleEmojiLeave,
    handleEmojiClick,
  } = useEmojiAnimation();
  const { currentThemeIndex, cycleTheme } = useTheme(themes);
  const { isAgreeing, hasAgreedToTerms, isFadingOut, agreeToTerms } =
    useTermsAgreement();
  const { downloading, handleDownload } = useDownload();
  const { isLoadingLyrics, setIsLoadingLyrics, setShowRomanizedPopup } =
    useLyrics();

  const currentTheme = themes[currentThemeIndex];

  const [randomPlaceholderText] = useState(
    () => placeholders[Math.floor(Math.random() * placeholders.length)]
  );
  const [randomText] = useState(
    () => randomTexts[Math.floor(Math.random() * randomTexts.length)]
  );

  const dontspammyshit = useRef(0);
  const timer = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (document.getElementById("tracker-text").value.startsWith("xss"))
        return;
      fetchData();
      e.target.style.animation = "glint 1s forwards";
      setTimeout(() => {
        e.target.style.animation = "";
      }, 1000);
    }

    if (document.getElementById("tracker-text").value.startsWith('"'))
      setIsSearchHovered(true);
    else setIsSearchHovered(false);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const cleanedValue = cleanUrl(inputValue);
    setResult(cleanedValue);
  };

  const fetchData = async () => {
    let lowerResults = result.toLowerCase();
    if (
      lowerResults === "help" ||
      lowerResults === "commands" ||
      lowerResults === "cmds" ||
      lowerResults === "services" ||
      lowerResults === "platforms" ||
      lowerResults === "supported"
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

    try {
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
    } catch (error) {
      setIsLoading(false);
      setNotification({
        show: true,
        message: "Error fetching data",
        isValid: false,
      });
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
  }, []);

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
    const style = document.createElement("style");
    style.textContent = `
      * {
        transition: background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

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

  useEffect(() => {
    fetch("/checkAPI")
      .then((res) => {
        if (res.status === 403) setBlocked(true);
        setChecked(true);
      })
      .catch(() => {
        setBlocked(true);
        setChecked(true);
      });
  }, []);

  if (blocked) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        🚫 Access Blocked, bad IP.
      </div>
    );
  }
  if (!checked) return <div>checking access...</div>;

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full relative overflow-x-hidden"
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
        animation: "fadeInBg 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <style>
        {`
        @keyframes glowPulse {
          0% { drop-shadow: 0 0 0px ${currentTheme.accent}44; }
          100% { drop-shadow: 0 0 16px ${currentTheme.accent}99; }
        }
        `}
      </style>

      <BackgroundBlur currentTheme={currentTheme} />
      <NotificationPanel
        notification={notification}
        currentTheme={currentTheme}
      />

      {/* Main panel */}
      <div
        className="flex items-start justify-center w-full px-4 relative z-10"
        style={{ zoom: "0.94" }}
      >
        <div className="flex flex-col items-center w-full max-w-[600px]">
          <div
            style={{
              backgroundColor: `${currentTheme.card}b3`,
              borderColor: showSearchOverlay
                ? `#E1DADD80`
                : `${currentTheme.border}80`,
              position: "relative",
              zIndex: 20,
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              WebkitTransform: "translateZ(0)",
              WebkitPerspective: 1000,
              perspective: 1000,
              boxShadow: `0 8px 32px 0 ${currentTheme.accent}22, 0 1.5px 4px 0 rgba(0,0,0,0.12)`,
              animation: "bounceIn 1.1s cubic-bezier(0.34,1.56,0.64,1) both",
              borderRadius: showSearchOverlay ? "25px" : undefined,
              width: showSearchOverlay ? "110%" : "100%",
            }}
            id="thepanel"
            className="backdrop-blur-xl backdrop-saturate-150 p-4 sm:p-8 rounded-xl border flex flex-col items-center w-full shadow-xl relative overflow-hidden bouncy-appear"
          >
            <div
              className={`w-full transition-all duration-500 ${"translate-x-0 opacity-100 pointer-events-auto"}`}
              style={{
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <HeaderSection
                currentTheme={currentTheme}
                rotation={rotation}
                isHovered={isHovered}
                glowIntensity={glowIntensity}
                handleEmojiHover={handleEmojiHover}
                handleEmojiLeave={handleEmojiLeave}
                handleEmojiClick={handleEmojiClick}
                showSupported={showSupported}
                setShowSupported={setShowSupported}
                setSelectedPlatform={setSelectedPlatform}
              />

              {!hasAgreedToTerms ? (
                <div
                  className={`w-full space-y-4 transition-all duration-500 bouncy-appear`}
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
                            By using this site, you agree to these all of these
                            terms
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
                            This site is provided "as is" without any
                            guarantees. Availability, accuracy, and error-free
                            operation are not assured. We are not responsible or
                            liable for any direct, indirect, incidental, or
                            consequential damages arising from use. We reserve
                            the right to change these terms at any time without
                            notice. By using this site, you accept these terms.
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
                      marginTop: "-15px",
                      marginBottom: "50px",
                    }}
                  >
                    <div className="p-4 bg-[#0a0a0a]/50 backdrop-blur-lg rounded-lg border border-[#333333]/50">
                      <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-200">
                          Privacy Policy
                        </h3>
                        <div className="space-y-4 text-xs sm:text-sm text-gray-300">
                          <p>
                            We respect your privacy. We don't collect personal
                            information unless you provide it.
                          </p>
                          <p>
                            We may collect basic usage data to improve the
                            service. This includes what features you use and any
                            errors you encounter.
                          </p>
                          <p>
                            We don't sell or share your data with third parties.
                            We use cookies only for essential functionality.
                          </p>
                          <p>
                            By using this site, you agree to this privacy
                            policy. If you have questions, contact us.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agree Button */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={agreeToTerms}
                      disabled={isAgreeing}
                      className="px-8 py-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: `${currentTheme.accent}33`,
                        borderColor: `${currentTheme.accent}66`,
                        width: "100%",
                        fontSize: "1rem",
                        marginTop: "-30px",
                      }}
                    >
                      {isAgreeing
                        ? "Agreeing..."
                        : "I Agree to Terms & Privacy Policy"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <SearchInput
                    result={result}
                    handleInputChange={handleInputChange}
                    handleKeyDown={handleKeyDown}
                    isSearchHovered={isSearchHovered}
                    setIsSearchHovered={setIsSearchHovered}
                    setShowSearchOverlay={setShowSearchOverlay}
                    currentTheme={currentTheme}
                    buttonScale={buttonScale}
                    getDynamicFontSize={getDynamicFontSize}
                    randomPlaceholderText={randomPlaceholderText}
                  />
                  <SearchButton
                    fetchData={fetchData}
                    isLoading={isLoading}
                    buttonScale={buttonScale}
                    handleButtonMouseDown={handleButtonMouseDown}
                    handleButtonMouseUp={handleButtonMouseUp}
                    currentTheme={currentTheme}
                  />
                </>
              )}
            </div>
          </div>
          {mediaInfo && (
            <DownloadPanel
              currentTheme={currentTheme}
              showDownloadPanel={showDownloadPanel}
              mediaInfo={mediaInfo}
              randomText={randomText}
              downloading={downloading}
              handleDownload={handleDownload}
              setNotification={setNotification}
              hasJapanese={hasJapanese}
              isLoadingLyrics={isLoadingLyrics}
              setIsLoadingLyrics={setIsLoadingLyrics}
              setShowRomanizedPopup={setShowRomanizedPopup}
            />
          )}

          <FooterSection
            currentTheme={currentTheme}
            cycleTheme={cycleTheme}
            setMediaInfo={setMediaInfo}
            setShowSupported={setShowSupported}
          />
        </div>
      </div>

      {/* Search Overlay */}
      {showSearchOverlay && <div></div>}

      {/* Versioning */}
      <div className="absolute bottom-5 right-7 text-gray-200 text-sm z-11 opacity-7 hidden sm:block">
        v1.4.6
      </div>
    </div>
  );
}

export default App;
