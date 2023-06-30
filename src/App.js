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
  const appHome = "/recipe-revamp";
  return (
    <>
      <LanguageProvider>
        <Navbar />
        <ToastContainer />
        <div className="main-component">
          <Routes>
            <Route path={`${appHome}/`} element={<RecipeSearch />} />
            {/* <Route path="/about" element={<About />} /> */}
            <Route path={`${appHome}/home`} element={<RecipeSearch />} />
            <Route
              path={`${appHome}/collection`}
              element={<RecipeCollection />}
            />
          </Routes>
        </div>
        <Footer />


      </LanguageProvider>
    </>
  );
}

export default App;
