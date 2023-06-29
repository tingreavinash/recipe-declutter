import React, { useEffect, useState } from "react";
import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import { async } from "@firebase/util";
import "./RecipeCollection.css";
import { HashLoader } from "react-spinners";
import RecipeSummarizer from "../RecipeSummarizer/RecipeSummarizer";

function RecipeCollection() {
  const [dbRecipes, setDbRecipes] = useState([]);
  const [firebaseOperationProcessing, setFirebaseOperationProcessing] =
    useState(false);

  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [displayRecipe, setDisplayRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleGetRecipes();
  }, []);

  const handleSelectRecipe = (recipeId) => {
    setSelectedRecipeId(recipeId);
  };

  useEffect(() => {
    // console.log("Selected recipe: ", selectedRecipeId);
    const foundRecipe = dbRecipes.find((obj) => obj.id === selectedRecipeId);

    if (foundRecipe) {
      setDisplayRecipe(foundRecipe?.data?.recipeObject);
      // console.log("Found recipe",foundRecipe);
    } else {
      // console.log("Object not found");
    }
  }, [selectedRecipeId]);

  const handleGetRecipes = async () => {
    const cacheKey = `db_recipes_all`;
    const cacheExpiry = 60 * 60 * 1000 * 24; // 24 hour (in milliseconds)

    const getCachedData = () => {
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      return { cachedData, cacheTimestamp };
    };

    const isCacheExpired = () => {
      const currentTime = new Date().getTime();
      const cacheTimestamp = Number(getCachedData().cacheTimestamp);
      return currentTime - cacheTimestamp > cacheExpiry;
    };

    const setCacheData = (data) => {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());
    };

    const handleCacheHit = () => {
      const { cachedData } = getCachedData();
      const parsedData = JSON.parse(cachedData);
      setDbRecipes(parsedData);
      setLoading(false);
    };

    const handleCacheMiss = async () => {
      console.log("Data not found in cache");

      setFirebaseOperationProcessing(true);
      try {
        const allRecipes = await FirebaseUtils.getAllRecipes();
        setDbRecipes(allRecipes);
        setFirebaseOperationProcessing(false);
        setCacheData(allRecipes);
      } catch (error) {
        console.error("Error occurred while fetching recipes: ", error);
        setFirebaseOperationProcessing(false);
      }

      setLoading(false);
    };

    const handleCache = async () => {
      const { cachedData, cacheTimestamp } = getCachedData();

      if (cachedData && cacheTimestamp && !isCacheExpired()) {
        const parsedCacheData = JSON.parse(cachedData);
        if (Array.isArray(parsedCacheData) && parsedCacheData.length > 0) {
          handleCacheHit();
        } else {
          console.log("Cache data expired");
          handleCacheMiss();
        }
      } else {
        console.log("Cache data expired");
        handleCacheMiss();
      }
    };
    setLoading(true);
    handleCache();
  };

  return (
    <div className="container">
      {/* <button
        type="button"
        className="btn btn-dark"
        onClick={handleGetRecipes}
        disabled={firebaseOperationProcessing}
      >
        Get all recipes
      </button> */}

      <div className="loader">
        <HashLoader color="#36d646" loading={loading} />
      </div>

      <div className="accordion recipe-details" id="accordionExample">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#recipeCollectionAccordion"
              aria-expanded="true"
              aria-controls="recipeCollectionAccordion"
            >
              Recipe Collection
            </button>
          </h2>
          <div
            id="recipeCollectionAccordion"
            className="accordion-collapse collapse show"
            data-bs-parent="#accordionExample"
          >
            <div className="accordion-body">
              <div className="list-group">
                {dbRecipes?.map((recipe, index) => (
                  <a
                    href="#"
                    key={index}
                    onClick={() => handleSelectRecipe(recipe?.id)}
                    className="list-group-item list-group-item-action"
                  >
                    {recipe?.data?.recipeObject?.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {displayRecipe !== null && 
      <RecipeSummarizer dbRecipe={displayRecipe} />
      }

      
    </div>
  );
}

export default RecipeCollection;
