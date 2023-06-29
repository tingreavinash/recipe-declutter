import React from "react";
import "./Navbar.css";
import { FaArrowRight } from "react-icons/fa6";

const Navbar = ({
  handleLanguageChange,
  language,
  clearBrowserCache,
  handleUrlChange,
  loading,
  handleFormSubmit,
  url,
}) => {
  return (
    <nav className="navbar fixed-top navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Recipe Revamp
          </a>
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
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={clearBrowserCache}
                  disabled={loading}
                >
                  Clear Cache
                </button>
              </li>
              <li className="nav-item">
                <div className="form-floating">
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="form-select form-control-sm"
                    id="floatingSelect"
                    aria-label="Select language"
                    disabled={loading}
                  >
                    {/* <option selected>Select a language</option> */}
                    <option value="en">English</option>
                    <option value="mr">Marathi</option>
                    <option value="hi">Hindi</option>
                    <option value="kn">Kannada</option>
                    <option value="te">Telugu</option>
                    <option value="ta">Tamil</option>
                  </select>
                  <label htmlFor="floatingSelect">Language</label>
                </div>
              </li>
              
            </ul>
            <form className="d-flex" onSubmit={handleFormSubmit}>
              <input
                placeholder="Paste a recipe URL"
                aria-label="Paste a recipe URL"
                className="form-control me-2"
                type="text"
                id="urlInput"
                value={url}
                onChange={handleUrlChange}
                autoComplete="on"
                autoCorrect="on"
                disabled={loading}
                required
              />
              <button
                className="btn btn-outline-success"
                type="submit"
                disabled={loading}
              >
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;
