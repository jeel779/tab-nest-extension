import React from "react";
import { createRoot } from "react-dom/client";
import "../../../styles.css";
import { PopupApp } from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);
