import React from "react";
import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const appHome = "/recipe-ravamp";

  return (
    <nav className="navbar fixed-top navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">


        <Link to={`${appHome}/`} className="navbar-brand">
                Recipe Revamp
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
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to={`${appHome}/`} className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to={`${appHome}/collection`} className="nav-link">
                Bookmarked Recipes
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;
