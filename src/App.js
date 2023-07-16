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
import SignUp from "./SignUp/SignUp";
import useToken from "./useToken";
import NotFound from "./NotFound/NotFound";

function App() {
  const { token, setToken, removeToken } = useToken();


  return (
    <>
      <LanguageProvider>
        <Navbar removeToken={removeToken} token={token} setToken={setToken} />
        <ToastContainer />
        <div className="brand-print">
          <p>Recipe Revamp!</p>
        </div>
        <div className="main-component">
          <Routes>

            <Route path="/" element={<About />} />
            <Route
              path="/recipe-search"
              element={<RecipeSearch token={token} setToken={setToken} />}
            />
            <Route path="/collection" element={<RecipeCollection />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
      </LanguageProvider>
    </>
  );
}

export default App;
