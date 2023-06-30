import "./App.css";
import RecipeSummarizer from "./RecipeSummarizer/RecipeSummarizer";
import { LanguageProvider } from "./LanguageContext/LanguageContext";
import About from "./About/About";

import React from "react";
import Navbar from "./Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import RecipeCollection from "./RecipeCollection/RecipeCollection";

function App() {
  const appHome = "/recipe-ravamp";
  return (
    <>
      <LanguageProvider>
        <Navbar />
        <div className="main-component">
          <Routes>
            <Route path={`${appHome}/`}  element={<RecipeSummarizer />} />
            {/* <Route path="/about" element={<About />} /> */}
            <Route path={`${appHome}/home`} element={<RecipeSummarizer />} />
            <Route path={`${appHome}/collection`}  element={<RecipeCollection />} />
          </Routes>
        </div>
      </LanguageProvider>
    </>
  );
}

export default App;
