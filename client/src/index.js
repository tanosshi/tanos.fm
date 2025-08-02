/** @file index.js
 * @description The main entry point
 * TODO: Create an 404 page
 */

import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./output.css";

import App from "./App";
import DownloadPage from "./DownloadPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="*" element={<App />} />
        <Route path="/download" element={<DownloadPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
