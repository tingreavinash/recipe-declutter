import React from "react";
import "./About.css";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  const handleProceedAction = async (e) => {
    e.preventDefault();

    navigate("/recipe-search");
  };
  return (
    <div className="container">
      <h1>
        Introducing <b>Recipe Revamp</b>: Simplify Recipe Reading and Cooking!
      </h1>

      <p>
        Are you tired of scrolling through lengthy web pages just to find the
        essential steps of a recipe? Do you wish there was a way to remove all
        the clutter and distractions from online recipes? Look no further!{" "}
        <b>Recipe Revamp</b> is here to transform your recipe reading and
        cooking experience.
        <br />
        <br />
        With <b>Recipe Revamp</b>, you can easily extract the essential steps
        and information from any recipe webpage. Simply provide the URL of the
        recipe you want to cook, and our app will work its magic to present you
        with a clean and simplified version of the recipe.
      </p>
      <div className="row">
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleProceedAction}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;
