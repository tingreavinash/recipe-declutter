import React, { useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import Login from "../Login/Login";

const Navbar = ({ removeToken, token, setToken }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(token ? false : true);

  const handleLogout = async (e) => {
    e.preventDefault();
    removeToken();
    localStorage.clear();
    navigate("/");
  };

  const handleCollectionView = async (e) => {
    e.preventDefault();
    if (token) {
      navigate("/collection");
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      {showLogin && !token && (
        <Login
          setToken={setToken}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
        />
      )}
      <nav className="navbar fixed-top navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
          <img src={process.env.PUBLIC_URL + 'favicon.png'} alt="Brand" width="30" /> Recipe Revamp
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse"
            data-toggle="collapse"
            data-target=".navbar-collapse"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  onClick={handleCollectionView}
                  to="/collection"
                  className="nav-link"
                >
                  Collection
                </Link>
              </li>


              {token && (
                <li className="nav-item">
                  <a href="#" className="nav-link" onClick={handleLogout}>
                    Logout
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
