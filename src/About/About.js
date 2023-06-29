import React, { useState } from "react";
import "./About.css";

function About() {
  return (
    <div className="container">
      <h1>Welcome to Recipe Scraper</h1>
      <p>Scrape recipes from any URL and get the relevant information!</p>
      <p>
        Simply enter the URL of a recipe page and let our application do the
        rest.
      </p>
      <p>
        It will extract the necessary details such as ingredients, instructions,
        and more.
      </p>
      <p>Start exploring new recipes and simplify your cooking experience!</p>
    </div>
  );
}

export default About;
