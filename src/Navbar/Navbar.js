import React from 'react';
import './Navbar.css';

const Navbar = ({ handleLanguageChange, language, clearBrowserCache, handleUrlChange, inputRef, fetchRecipeData, url }) => {

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Recipe Declutter</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">

                        <li className="nav-item">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={clearBrowserCache}>Clear Cache</button>
                        </li>

                        <li className="nav-item">
                            <div className="form-floating">

                                <select value={language} onChange={handleLanguageChange} className="form-select" id="floatingSelect" aria-label="Select language">
                                    {/* <option selected>Select a language</option> */}
                                    <option value="en">English</option>
                                    <option value="mr">Marathi</option>
                                    <option value="hi">Hindi</option>
                                </select>
                                <label htmlFor="floatingSelect">Language</label>
                            </div>
                        </li>

                        <li className="nav-item">
                            <form className="d-flex" onSubmit={fetchRecipeData}>
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
                                    required
                                />
                                <button className="btn btn-outline-success" type="submit">Submit</button>
                            </form>
                        </li>
                    </ul>

                </div>

            </div>
        </nav>
    );

}

export default Navbar;
