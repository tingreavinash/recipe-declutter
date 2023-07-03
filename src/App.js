import "./App.css";
import RecipeSearch from "./RecipeSearch/RecipeSearch";
import { LanguageProvider } from "./LanguageContext/LanguageContext";
import About from "./About/About";

import React, { useState } from "react";
import Navbar from "./Navbar/Navbar";
import { Routes, Route, BrowserRouter, Switch } from "react-router-dom";
import RecipeCollection from "./RecipeCollection/RecipeCollection";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer/Footer";
import Login from "./Login/Login";
import SignUp from "./SignUp/SignUp";
import useToken from './useToken';

function App() {
  const { token, setToken, removeToken } = useToken();

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <>
      <LanguageProvider>
        <Navbar removeToken={removeToken} />
        <ToastContainer />
        <div class="brand-print">
          <p>Recipe Revamp!</p>
        </div>
        <div className="main-component">
          <Routes>
            <Route
              path="/"
              element={<RecipeSearch />}
            />
            <Route path="/about" element={<About />} />
            <Route path="/home" element={<RecipeSearch />} />
            <Route
              path="/collection"
              element={<RecipeCollection />}
            />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>

        <Footer />
      </LanguageProvider>
    </>
  );
}

export default App;
