import React, { useEffect, useState } from "react";
import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import "./RecipeCollection.css";
import { HashLoader } from "react-spinners";
import RecipeSearch from "../RecipeSearch/RecipeSearch";
import { TfiReload } from "react-icons/tfi";
import { AiFillDelete, AiFillEye } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RecipeCollection() {
  const [dbRecipes, setDbRecipes] = useState([]);
  const [sortedArray, setSortedArray] = useState([]);

  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [displayRecipe, setDisplayRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const result = sortObjectsByName(dbRecipes);
    setSortedArray(result);
  }, [dbRecipes]);

  function sortObjectsByName(objects) {
    return objects.sort((a, b) => {
      const derivedRecipeNameForA = Array.isArray(a.data.recipeObject.name) ? a.data.recipeObject.name[0] : a.data.recipeObject.name;
      const derivedRecipeNameForB = Array.isArray(b.data.recipeObject.name) ? b.data.recipeObject.name[0] : b.data.recipeObject.name;

      const nameA = derivedRecipeNameForA.toLowerCase();
      const nameB = derivedRecipeNameForB.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  useEffect(() => {
    handleGetRecipes();
  }, []);

  const handleSelectRecipe = (recipeId) => {
    setSelectedRecipeId(recipeId);
  };

  useEffect(() => {
    const foundRecipe = dbRecipes.find((obj) => obj.id === selectedRecipeId);

    if (foundRecipe) {
      setDisplayRecipe(foundRecipe);
    } else {
    }
  }, [selectedRecipeId]);

  const showToast = async (promiseFunc, toastMessage) => {
    const toastProperties = {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    };

    return await toast.promise(promiseFunc, {
      pending: {
        render() {
          return "Please wait";
        },
        position: toastProperties.position,
        autoClose: toastProperties.autoClose,
        hideProgressBar: toastProperties.hideProgressBar,
        closeOnClick: toastProperties.closeOnClick,
        pauseOnHover: toastProperties.pauseOnHover,
        draggable: toastProperties.draggable,
        progress: toastProperties.progress,
        theme: toastProperties.theme,
      },
      success: {
        render() {
          return toastMessage;
        },
        position: toastProperties.position,
        autoClose: toastProperties.autoClose,
        hideProgressBar: toastProperties.hideProgressBar,
        closeOnClick: toastProperties.closeOnClick,
        pauseOnHover: toastProperties.pauseOnHover,
        draggable: toastProperties.draggable,
        progress: toastProperties.progress,
        theme: toastProperties.theme,
      },
      error: {
        render() {
          return "Failed";
        },
        position: toastProperties.position,
        autoClose: toastProperties.autoClose,
        hideProgressBar: toastProperties.hideProgressBar,
        closeOnClick: toastProperties.closeOnClick,
        pauseOnHover: toastProperties.pauseOnHover,
        draggable: toastProperties.draggable,
        progress: toastProperties.progress,
        theme: toastProperties.theme,
      },
    });
  };

  const handleDeleteRecipe = async (recipeId, event) => {
    event.preventDefault();

    await showToast(
      FirebaseUtils.deleteRecipeFromCollection(recipeId),
      "Removed from collection!"
    );
    handleRemoveFromCache(recipeId);
    handleCache();
  };

  const getAllRecipes = async () => {
    const cacheKey = `db_recipes_all`;

    const setCacheData = (data) => {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());
    };
    console.log("Refreshing data from remote");

    try {
      const allRecipes = await FirebaseUtils.getAllRecipes();
      setDbRecipes(allRecipes);
      setCacheData(allRecipes);
    } catch (error) {
      throw error;
    }
  };

  const refreshCacheData = async (event) => {
    event.preventDefault();
    await showToast(getAllRecipes(), "Data refreshed!");
  };

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

    try {
      const allRecipes = await FirebaseUtils.getAllRecipes();
      setDbRecipes(allRecipes);
      setCacheData(allRecipes);
    } catch (error) {
      console.error("Error occurred while fetching recipes: ", error);
    }

    setLoading(false);
  };

  const handleRemoveFromCache = async (recipeId) => {
    const { cachedData } = getCachedData();

    if (cachedData) {
      const parsedCacheData = JSON.parse(cachedData);
      const updatedCacheData = parsedCacheData.filter(
        (recipe) => recipe.id !== recipeId
      );
      setCacheData(updatedCacheData);
    }
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

  const handleGetRecipes = async () => {
    setLoading(true);
    handleCache();
  };

  return (
    <>
      <div className="container recipe-collection-options">
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

        <div className="container">
          <div
            className="row justify-content-center"
            style={{ marginBottom: "10px" }}
          >
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-warning"
                onClick={refreshCacheData}
                disabled={loading}
              >
                <TfiReload />
              </button>
            </div>
          </div>
        </div>

        <div className="accordion recipe-details" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header ">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#recipeCollectionAccordion"
                aria-expanded="true"
                aria-controls="recipeCollectionAccordion"
              >
                Collection
              </button>
            </h2>
            <div
              id="recipeCollectionAccordion"
              className="accordion-collapse collapse show"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <div className="accordion" id="accordingR1">

                  {sortedArray?.map((recipe, index) => (
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button bg-body collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapseItem${index}`}
                          aria-expanded="false"
                          aria-controls={`collapseItem${index}`}
                        >
                          {Array.isArray(recipe?.data?.recipeObject?.name) &&
                    recipe?.data?.recipeObject?.name.length > 1
                      ? recipe?.data?.recipeObject?.name[0]
                      : recipe?.data?.recipeObject?.name}
                          
                        </button>
                      </h2>
                      <div
                        id={`collapseItem${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordingR1"
                      >
                        <div className="accordion-body">
                          <div className="row options-row justify-content-center">
                            <div className="col-auto">
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => handleSelectRecipe(recipe?.id)}
                                data-bs-toggle="collapse"
                                data-bs-target="#recipeCollectionAccordion"
                                aria-expanded="true"
                                aria-controls="recipeCollectionAccordion"
                              ><AiFillEye /> View
                              </button>
                            </div>
                            <div className="col-auto">
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={(event) =>
                                  handleDeleteRecipe(recipe?.id, event)
                                }
                              ><AiFillDelete /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {displayRecipe !== null && <RecipeSearch dbRecipe={displayRecipe} />}
    </>
  );
}

export default RecipeCollection;
