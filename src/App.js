import "./App.css";
import ReactGA4 from "react-ga4";
import RecipeSearch from "./RecipeSearch/RecipeSearch";
import { AppStateProvider } from "./AppStateContext/AppStateContext";
import About from "./About/About";

import React, { useEffect } from "react";
import Navbar from "./Navbar/Navbar";
import { Routes, Route, Router } from "react-router-dom";
import RecipeCollection from "./RecipeCollection/RecipeCollection";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer/Footer";
import SignUp from "./SignUp/SignUp";
import useToken from "./useToken";
import NotFound from "./NotFound/NotFound";

function App() {
  const { token, setToken, removeToken } = useToken();

  useEffect(() => {
    if (!token) {
      ReactGA4.initialize(process.env.REACT_APP_measurementId);
    }
  }, [token]);

  return (
    <>
      <AppStateProvider>
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

        {/* <Footer /> */}
      </AppStateProvider>
    </>
  );
}

export default App;
