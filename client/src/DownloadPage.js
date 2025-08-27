/** @file DownloadPage.js
 * @description Used to be the download page, but downloads are way too quick now to be necessary.
 * TODO: Remove this page completely without causing harm.
 */

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DownloadPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("One second..");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = searchParams.get("url");
    const format = searchParams.get("format");

    if (!url || !format) {
      setError("Invalid download parameters");
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    const statusMessages = [
      "If you're seeing this, the back-end probably failed to serve you the requested file.",
      "If you're seeing this, the back-end probably failed to serve you the requested file.",
    ];

    let messageIndex = 0;
    const statusInterval = setInterval(() => {
      if (messageIndex < statusMessages.length) {
        setStatus(statusMessages[messageIndex]);
        messageIndex++;
      }
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-['Consolas']">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-200">
            Invalid parameters
          </h1>
          <p className="text-gray-400">{status}</p>
        </div>

        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
            {error}
          </div>
        ) : (
          <>
            <div className="w-full bg-[#161616]/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#ff80bf] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-400">
              {Math.round(progress)}% complete
            </div>
          </>
        )}

        <div className="text-center text-sm text-gray-500">
          Processing data..
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
