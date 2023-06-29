import "./App.css";
import RecipeSummarizer from "./RecipeSummarizer/RecipeSummarizer";
import { LanguageProvider } from "./LanguageContext/LanguageContext";
import About from "./About/About";

import React from "react";
import Navbar from "./Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import RecipeCollection from "./RecipeCollection/RecipeCollection";

function App() {
  return (
    <>
      <LanguageProvider>
        <Navbar />
        <div className="main-component">
          <Routes>
            <Route path="/" element={<RecipeSummarizer />} />
            <Route path="/about" element={<About />} />
            <Route path="/homepage" element={<RecipeSummarizer />} />
            <Route path="/collection" element={<RecipeCollection />} />
          </Routes>
        </div>
      </LanguageProvider>
    </>
  );
}

export default App;
