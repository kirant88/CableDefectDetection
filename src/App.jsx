// src/App.js
import React from "react";
import CableDefectDetection from "./components/CableDefectDetection";

import "./app.css";

const App = ({ toggleTheme, mode }) => {
  return <CableDefectDetection toggleTheme={toggleTheme} mode={mode} />;
};

export default App;
