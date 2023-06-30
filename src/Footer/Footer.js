import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container text-center">
        <p className="mb-0">
          Made with <span className="text-danger">&hearts;</span> by 
          <a className="footer-link" href="https://tingreavinash.github.io" target="_blank"> Avinash</a>

        </p>
      </div>
    </footer>
  );
}

export default Footer;
