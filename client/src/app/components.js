/** @file components.js
 * @description The file containing everything you see in the front-end.
 */

import React, { useState } from "react";

export const NotificationPanel = ({ notification, currentTheme }) => (
  <div
    id="notification"
    className={`fixed backdrop-blur-m backdrop-saturate-150 top-6 left-1/2 -translate-x-1/2 p-4 rounded-lg border transition-all duration-300 z-[100] ease-in-out max-w-[90%] ${
      notification.show
        ? "opacity-60 translate-y-0"
        : "opacity-0 -translate-y-4"
    } ${
      notification.isValid
        ? `bg-[rgba(37,26,37,0.7)] border-[border-color: rgba(74, 45, 74, 0.2)] text-white`
        : `bg-[rgba(37,26,37,0.7)] border-[border-color: rgba(74, 45, 74, 0.2)] text-white`
    }`}
    style={{
      filter: notification.show ? "drop-shadow(0 0 12px #fff6)" : "none",
    }}
  >
    {notification.message}
  </div>
);

export const BackgroundBlur = ({ currentTheme }) =>
  currentTheme.backgroundBlur && (
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
        animation: "fadeInBg 0.4s 0.1s both",
        filter: "saturate(1.3)",
      }}
    />
  );

export const HeaderSection = ({
  currentTheme,
  rotation,
  isHovered,
  glowIntensity,
  handleEmojiHover,
  handleEmojiLeave,
  handleEmojiClick,
  showSupported,
  setShowSupported,
  setSelectedPlatform,
}) => {
  const [selectedPlatform, setSelectedPlatformLocal] = useState(null);

  return (
    <div className="flex flex-col items-center space-y-2 mb-6 float-appear">
      <span
        id="emoji"
        className="text-4xl sm:text-6xl filter drop-shadow-lg relative cursor-pointer glow-anim ͼf"
        style={{
          filter: `drop-shadow(0 0 8px ${currentTheme.accent}${Math.round(
            glowIntensity * 255
          ).toString(16)})`,
          textShadow: `0 0 10px ${currentTheme.accent}${Math.round(
            glowIntensity * 255
          ).toString(16)}`,
          transform: `rotate(${rotation}deg) scale(${isHovered ? 1.15 : 1})`,
          transition:
            "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s, text-shadow 0.3s",
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
          letterSpacing: "0.03em",
          animation: "popIn 0.7s 0.1s both",
        }}
      >
        tanos's free media
      </h1>
      <p
        className="text-sm sm:text-base text-gray-400 text-center"
        style={{
          animation: "floatUp 1.2s 0.2s both",
        }}
      >
        a quick yet ad-free media downloader
      </p>
      <button
        className="text-sm sm:text-base text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
        onClick={() =>
          setShowSupported(!showSupported) & setSelectedPlatform(null)
        }
        style={{
          animation: "popIn 0.7s 0.2s both",
        }}
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

      {/* Supported platforms, aka whats there to offer. */}
      <div
        className={`w-full overflow-hidden transition-all duration-500 ${
          showSupported
            ? "max-h-[1000px] opacity-100 mb-6"
            : "max-h-0 opacity-0"
        }`}
        style={{
          transform: `translateY(${showSupported ? "0" : "-10px"})`,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          marginBottom: "-5px",
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
              onClick={() => setSelectedPlatformLocal("youtube")}
              className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
              <span className="text-red-500 text-lg sm:text-xl">🎬</span>
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
              onClick={() => setSelectedPlatformLocal("soundcloud")}
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
              onClick={() => setSelectedPlatformLocal("spotify")}
              className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
              <span className="text-xl">💚</span>
              <div>
                <p
                  className="text-gray-200"
                  style={{
                    fontSize: "0.9rem",
                  }}
                >
                  Spotify
                </p>
                <p className="text-xs text-gray-400">Songs only</p>
              </div>
            </div>
            <div
              onClick={() => setSelectedPlatformLocal("lyrics")}
              className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer hover:bg-[#161616]/80 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
              <span className="text-xl">📝</span>
              <div>
                <p
                  className="text-gray-200"
                  style={{
                    fontSize: "0.9rem",
                  }}
                >
                  Lyrics
                </p>
                <p className="text-xs text-gray-400">For music</p>
              </div>
            </div>
            <div
              onClick={() => setSelectedPlatformLocal("social")}
              className="flex items-center gap-2 p-3 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer col-span-2 hover:bg-[#161616]/80 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/20"></div>
              <span className="text-xl">🌐</span>
              <div>
                <p
                  className="text-sm sm:text-base text-gray-200"
                  style={{
                    fontSize: "0.87rem",
                  }}
                >
                  Tiktok, Twitter, Pinterest & Instagram
                </p>
                <p className="text-xs text-gray-400">Entertainment</p>
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
              transform: `translateY(${selectedPlatform ? "0" : "20px"})`,
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
                {selectedPlatform === "lyrics" && "📝 Lyrics"}
                {selectedPlatform === "social" && "🌐 Social Media"}
              </h3>
            </div>
            <div className="space-y-4 text-left">
              <p
                className="text-gray-300"
                style={{
                  fontSize: selectedPlatform === "youtube" ? "0.8rem" : "1rem",
                }}
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
                  "We use ruhend-scraper and btch-downloader for downloading media."}
              </p>
            </div>
            <div
              className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[75%]"
              style={{ marginTop: "10px", bottom: "10%", width: "90%" }}
            >
              <button
                onClick={() => setSelectedPlatformLocal(null)}
                style={{ fontSize: "1.1rem" }}
                className="w-full px-3 py-2 bg-[#161616]/70 backdrop-blur-md rounded-lg border border-[#333333]/50 hover:border-[#444444]/70 transition-colors cursor-pointer text-gray-200"
              >
                Back to the supported platform list
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchInput = ({
  result,
  handleInputChange,
  handleKeyDown,
  isSearchHovered,
  setIsSearchHovered,
  setShowSearchOverlay,
  currentTheme,
  buttonScale,
  getDynamicFontSize,
  randomPlaceholderText,
}) => (
  <div className="relative flex items-center w-full">
    <textarea
      id="tracker-text"
      className="w-full p-3 rounded-lg bg-[#0a0a0a]/60 backdrop-blur-lg border border-[#333333]/50 text-gray-200 resize-none focus:outline-none focus:border-[#444444]/70 transition-colors placeholder-gray-500 text-xs sm:text-base pr-10"
      rows="1"
      placeholder={randomPlaceholderText}
      value={result}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      style={{
        fontSize: getDynamicFontSize(result),
        transition: "color 0.2s ease, background-color 0.2s ease",
        caretColor: currentTheme.accent,
        boxShadow: "0 2px 12px 0 #0002",
      }}
    />
    <div
      id="search"
      className="backdrop-blur-lg absolute top-0 right-0 h-full border flex items-center justify-center bg-[#222222] rounded-r-lg search-btn"
      style={{
        width: isSearchHovered ? 105 : 35,
        zIndex: 3,
        right: "2%",
        backgroundColor: `${currentTheme.accent}33`,
        borderColor: `${currentTheme.accent}66`,
        transform: `scale(${buttonScale})`,
        transition:
          "width 0.25s cubic-bezier(0.34,1.56,0.64,1), transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        WebkitTransform: "translateZ(0)",
        boxShadow: `0 2px 16px 0 ${currentTheme.accent}22`,
        animation: "bounceIn 1.1s cubic-bezier(0.34,1.56,0.64,1) both",
        fontSize: "0.88rem",
        height: "35px",
        top: "15%",
        display: "none", // soon
        opacity: "0%", // soon
        cursor: "pointer",
        borderRadius: "7px",
        paddingLeft: isSearchHovered ? 12 : 0,
        paddingRight: isSearchHovered ? 12 : 0,
      }}
      onMouseEnter={() => setIsSearchHovered(true)}
      onMouseLeave={() => setIsSearchHovered(false)}
      onClick={() => setShowSearchOverlay(true)}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          justifyContent: isSearchHovered ? "flex-start" : "center",
        }}
      >
        <span role="img" aria-label="search">
          🔍
        </span>
        {isSearchHovered && (
          <span
            style={{
              marginLeft: 4,
              whiteSpace: "nowrap",
              color: currentTheme.accent,
            }}
          >
            search
          </span>
        )}
      </span>
    </div>
  </div>
);

export const SearchButton = ({
  fetchData,
  isLoading,
  buttonScale,
  handleButtonMouseDown,
  handleButtonMouseUp,
  currentTheme,
}) => (
  <button
    onClick={fetchData}
    id="fc"
    className={`mt-4 px-12 py-3 backdrop-blur-lg text-gray-200 rounded-lg border flex items-center text-base sm:text-lg w-full justify-center transition-all duration-200 cursor-pointer hover:scale-105`}
    style={{
      backgroundColor: `${currentTheme?.accent ?? "#ff80bf"}33`,
      borderColor: `${currentTheme?.accent ?? "#ff80bf"}66`,
      transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow: `0 2px 16px 0 ${currentTheme?.accent ?? "#ff80bf"}22`,
    }}
    onMouseDown={handleButtonMouseDown}
    onMouseUp={handleButtonMouseUp}
  >
    <span id="btn-text" className="flex items-center gap-2">
      grab
      <span
        className="text-lg sm:text-xl"
        style={{ filter: `${currentTheme?.grabcolor ?? "brightness('1')"}` }}
      >
        ⚡
      </span>
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
  </button>
);

export const FooterSection = ({
  currentTheme,
  cycleTheme,
  setMediaInfo,
  setShowSupported,
}) => (
  <div
    id="extras"
    className="flex flex-col items-center gap-2 mt-6 float-appear"
  >
    <button
      onClick={() => {
        window.open("https://ko-fi.com/taanoss", "_blank");
        setMediaInfo(null);
        setShowSupported(false);
      }}
      className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-2 cursor-pointer pop-appear"
      style={{
        filter: "drop-shadow(0 0 6px #fff2)",
        animation: "popIn 0.7s 0.2s both",
      }}
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
      className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-2 cursor-pointer pop-appear"
      style={{
        animation: "popIn 0.7s 0.3s both",
      }}
    >
      cycle theme by pressing here ({currentTheme.name})
    </button>
  </div>
);

export const DownloadPanel = ({
  currentTheme,
  showDownloadPanel,
  mediaInfo,
  randomText,
  downloading,
  handleDownload,
  setNotification,
  hasJapanese,
  isLoadingLyrics,
  setIsLoadingLyrics,
  setShowRomanizedPopup,
}) => (
  <div
    className="w-full overflow-hidden transition-all duration-1200 ease-in-out max-h-96 mt-6 bouncy-appear"
    style={{
      transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
      transform: showDownloadPanel ? "translateY(0)" : "translateY(20px)",
      opacity: showDownloadPanel ? 1 : 0,
    }}
  >
    <div
      className="p-6 bg-[#0a0a0a]/60 backdrop-blur-lg rounded-lg border border-[#333333]/50"
      style={{
        transform: showDownloadPanel ? "translateY(0)" : "translateY(20px)",
        opacity: showDownloadPanel ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        paddingRight: "32px",
        paddingLeft: "32px",
        paddingBottom: "32px",
        paddingTop: "32px",
        borderRadius: "13px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">{randomText}</h3>
      </div>

      {/* Body variations */}
      <div className="space-y-4">
        {mediaInfo.isPinterest ? (
          <>
            <div className="flex items-center gap-3 bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
              <img
                src={mediaInfo.profilePicture}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-[#c8232c]"
                style={{ backgroundColor: "#fff" }}
              />
              <div>
                <p className="text-gray-200 font-semibold flex items-center gap-2">
                  <span style={{ color: "#c8232c", fontSize: "1.2em" }}>
                    📌
                  </span>
                  {mediaInfo.author || "Unknown user"}
                </p>
                <p className="text-gray-400 text-sm">Pinterest</p>
              </div>
            </div>
            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50 flex flex-col items-center">
              <img
                src={mediaInfo.image}
                alt={mediaInfo.title}
                className="rounded-lg max-h-[300px] mb-2 border border-[#c8232c]/60"
                style={{
                  objectFit: "contain",
                  background: "#fff",
                  width: "70px",
                }}
              />
              <p className="text-gray-200 text-center mb-1 font-semibold">
                {mediaInfo.title}
              </p>
              <button
                className="mt-2 px-6 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 text-white bg-[#c8232c] hover:bg-[#b21d24] border-[#c8232c] shadow-md"
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  handleDownload("mp3", mediaInfo, setNotification)
                }
              >
                <span style={{ fontSize: "1.2em" }}>📥</span> Download Pin
              </button>
            </div>
          </>
        ) : mediaInfo.isTwitter ? (
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
                <p
                  className="text-gray-200 font-semibold"
                  style={{ fontSize: "0.7em" }}
                >
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
                <p className="text-gray-200">{mediaInfo.likes || "0"}</p>
              </div>
              <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                <p className="text-gray-400 text-sm">Retweets</p>
                <p className="text-gray-200">{mediaInfo.retweets || "0"}</p>
              </div>
              <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                <p className="text-gray-400 text-sm">Views</p>
                <p className="text-gray-200">{mediaInfo.views || "0"}</p>
              </div>
              <button
                className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50 hover:bg-[#161616] transition-all duration-200 flex flex-col items-center cursor-pointer justify-center"
                onClick={() =>
                  handleDownload("mp4", mediaInfo, setNotification)
                }
                disabled={downloading.mp4}
                style={{
                  backgroundColor: `${currentTheme.accent}33`,
                  borderColor: `${currentTheme.accent}66`,
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm">Download</p>
                    <p className="text-gray-200 text-sm">Media 🎥</p>
                  </>
                )}
              </button>
            </div>
          </>
        ) : mediaInfo.isSmallData ? (
          <>
            <div className="flex items-center gap-3 bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
              <div>
                <p
                  className="text-gray-200 font-semibold"
                  style={{ fontSize: "1em" }}
                >
                  {mediaInfo.title}
                </p>
              </div>
            </div>
            <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
              <p className="text-gray-400 text-sm">File size</p>
              <p className="text-gray-200">{mediaInfo.size}</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button
                className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50 hover:bg-[#161616] transition-all duration-200 flex flex-col items-center cursor-pointer justify-center"
                onClick={() => window.open(mediaInfo.url, "_blank")}
                style={{
                  width: "430%",
                  backgroundColor: `${currentTheme.accent}33`,
                  borderColor: `${currentTheme.accent}66`,
                }}
              >
                <p className="text-gray-400 text-sm">Indirect Download</p>
                <p className="text-gray-200 text-sm">
                  .{mediaInfo.title.split(".").pop()} File
                </p>
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
                <p className="text-gray-400 text-sm">@{mediaInfo.username}</p>
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
                <p className="text-gray-200">{mediaInfo.comments}</p>
              </div>
              <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                <p className="text-gray-400 text-sm">Favorites</p>
                <p className="text-gray-200">{mediaInfo.bookmark}</p>
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
                <p className="text-gray-200">{mediaInfo.quality}</p>
              </div>
              <div className="bg-[#161616]/70 backdrop-blur-md p-3 rounded-lg border border-[#333333]/50">
                <p className="text-gray-400 text-sm">Size</p>
                <p className="text-gray-200">{mediaInfo.size}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action row */}
      <div className="flex gap-3 mt-4">
        <div className="flex-1 flex gap-2">
          {!mediaInfo.isFromSpotify &&
            !mediaInfo.isFromSoundCloud &&
            !mediaInfo.isTwitter &&
            !mediaInfo.isSmallData &&
            !mediaInfo.isPinterest &&
            (mediaInfo.isTikTok || !mediaInfo.isFromSpotify) && (
              <button
                className={`flex-1 px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  mediaInfo.isFromSpotify || mediaInfo.isFromSoundCloud
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
                  opacity: mediaInfo.durationError ? "0.5" : "1",
                }}
                onClick={() =>
                  handleDownload("mp4", mediaInfo, setNotification)
                }
                disabled={downloading.mp4 || mediaInfo.durationError}
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
                    {mediaInfo.isTikTok ? "Download Video" : "MP4"}{" "}
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
            !mediaInfo.isSmallData &&
            !mediaInfo.isPinterest &&
            !mediaInfo.isTwitter && (
              <button
                className={`flex-1 px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  mediaInfo.isFromSpotify || mediaInfo.isFromSoundCloud
                    ? "w-full"
                    : ""
                }`}
                style={{
                  fontSize: "1rem",
                  backgroundColor: `${currentTheme.accent}33`,
                  borderColor: `${currentTheme.accent}66`,
                }}
                onClick={() =>
                  handleDownload("mp3", mediaInfo, setNotification)
                }
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
                    {mediaInfo.isFromSpotify || mediaInfo.isFromSoundCloud
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
          !mediaInfo.isSmallData &&
          !mediaInfo.isPinterest &&
          !mediaInfo.isTwitter && (
            <>
              <button
                className="px-4 py-2 backdrop-blur-lg text-gray-200 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  fontSize: "1rem",
                  backgroundColor: `${currentTheme.accent}33`,
                  borderColor: `${currentTheme.accent}66`,
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
                        const response = await fetch(lyricsUrl);
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
                        setNotification({
                          show: true,
                          message: "Lyrics downloaded successfully! 🎵",
                          isValid: true,
                        });
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
);
