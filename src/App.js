import "./App.css";
import RecipeSearch from "./RecipeSearch/RecipeSearch";
import { LanguageProvider } from "./LanguageContext/LanguageContext";
import About from "./About/About";

import React from "react";
import Navbar from "./Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import RecipeCollection from "./RecipeCollection/RecipeCollection";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer/Footer";

function App() {
  return (
    <>
      <LanguageProvider>
        <Navbar />
        <ToastContainer />
        <div className="main-component">
          <Routes>
            <Route path="/" element={<RecipeSearch />} />
            {/* <Route path="/about" element={<About />} /> */}
            <Route path="/home" element={<RecipeSearch />} />
            <Route path="/collection" element={<RecipeCollection />} />
          </Routes>
        </div>
        <Footer />
      </LanguageProvider>
    </>
  );
}

export default App;
