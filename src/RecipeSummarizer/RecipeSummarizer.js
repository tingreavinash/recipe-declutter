import React, { useState, useContext, useEffect } from "react";
import cheerio from "cheerio";
import "./RecipeSummarizer.css";
import { RxLapTimer } from "react-icons/rx";
import { HashLoader } from "react-spinners";
import { setCORS } from "google-translate-api-browser";
import LanguageContext from "../LanguageContext/LanguageContext";

import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import { FaArrowRight } from "react-icons/fa6";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RecipeSummarizer({ dbRecipe }) {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

  const [recipeData, setRecipeData] = useState("");
  const [displayRecipeData, setDisplayRecipeData] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const translate = setCORS("https://corsproxy.io/?");
  const { language, switchLanguage } = useContext(LanguageContext);

  const textLabels = require(`../Assets/${language}.json`); // Load language-specific translations

  useEffect(() => {
    if (dbRecipe) {
      // console.log("Db recipe: ", dbRecipe);
      setRecipeData(dbRecipe?.data?.recipeObject);
      setDisplayRecipeData(dbRecipe?.data?.recipeObject);
      setSubmittedUrl(dbRecipe?.data?.recipeObject["@id"]);
    }
  }, [dbRecipe]);

  const handleLanguageChange = (event) => {
    if (errorMsg.length === 0) {
      const selectedLanguage = event.target.value;
      switchLanguage(selectedLanguage);
      console.log("Selected language: ", selectedLanguage);
    }
  };

  const [firebaseOperationProcessing, setFirebaseOperationProcessing] =
    useState(false);

  const showToast = async (promiseFunc, toastMessage) => {
    const toastProperties = {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light"
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
        theme: toastProperties.theme
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
        theme: toastProperties.theme
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
        theme: toastProperties.theme
      },
    });
  };

  const handleAddRecipe = async (event) => {
    event.preventDefault();
    setFirebaseOperationProcessing(true);
    await showToast(
      FirebaseUtils.addRecipeToCollection(displayRecipeData),
      "Added to collection!"
    );
    setFirebaseOperationProcessing(false);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setSubmittedUrl(url);
  };

  useEffect(() => {
    if (recipeData) {
      handleRecipeTranslate();
    }
  }, [language]);

  useEffect(() => {
    if (submittedUrl !== "" && !dbRecipe) {
      fetchRecipeData();
    }
  }, [submittedUrl]);

  const handleRecipeTranslate = async () => {
    const cacheKey = `recipe_${language}_${submittedUrl}`;
    const cacheExpiry = 60 * 60 * 1000 * 24; // 24 hour (in milliseconds)

    const getCachedData = () => {
      // console.log("Retrieving cache with id: ", cacheKey);
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
      // console.log("translated data saved with cache id: ", cacheKey);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());
    };

    const handleCacheHit = () => {
      const { cachedData } = getCachedData();
      const parsedData = JSON.parse(cachedData);
      setDisplayRecipeData(parsedData);
      setErrorMsg("");

      setLoading(false);
    };

    const handleCacheMiss = async () => {
      console.log("Data not found in cache");

      if (language === "en") {
        // console.log("Language is english");
        setCacheData(recipeData);
        setDisplayRecipeData(recipeData);
        setErrorMsg("");
      } else if (recipeData) {
        // console.log("Language is not english and recipeData is present");

        const newRecipeData = await translateData(recipeData, language);
        setCacheData(newRecipeData);
        setDisplayRecipeData(newRecipeData);
        setErrorMsg("");
      }

      setLoading(false);
    };

    const handleCache = async () => {
      const { cachedData, cacheTimestamp } = getCachedData();
      if (cachedData && cacheTimestamp && !isCacheExpired()) {
        handleCacheHit();
      } else {
        console.log("Cache data expired");
        handleCacheMiss();
      }
    };
    setLoading(true);
    handleCache();
  };

  const cleanupData = async (data) => {
    const cleanupNestedData = async (nestedData) => {
      if (typeof nestedData === "string") {
        try {
          const englishString = htmlDecode(nestedData);
          return englishString;
        } catch (error) {
          return nestedData;
        }
      } else if (Array.isArray(nestedData)) {
        const cleanedArray = Promise.all(
          nestedData.map((item) => cleanupNestedData(item))
        );
        return cleanedArray;
      } else if (typeof nestedData === "object" && nestedData !== null) {
        const cleanedObject = {};
        for (const key in nestedData) {
          if (nestedData.hasOwnProperty(key)) {
            const cleanedValue = await cleanupNestedData(nestedData[key]);
            cleanedObject[key] = cleanedValue;
          }
        }
        return cleanedObject;
      }
      return nestedData;
    };

    const dataToBeCleaned = JSON.parse(JSON.stringify(data));
    const cleanedData = await cleanupNestedData(dataToBeCleaned);
    setLoading(false);
    return cleanedData;
  };

  const translateData = async (data, toLang) => {
    const translateNestedData = async (nestedData, toLang) => {
      if (
        typeof nestedData === "string" &&
        !nestedData.startsWith("PT") &&
        !nestedData.startsWith("http")
      ) {
        try {
          const englishString = htmlDecode(nestedData);
          // console.log("Input string: ", englishString);
          const translated = await translateText(englishString, toLang);
          // console.log("translated string: ", translated);

          return translated;
        } catch (error) {
          return nestedData; // Return the original string if translation fails
        }
      } else if (Array.isArray(nestedData)) {
        const translatedArray = await Promise.all(
          nestedData.map((item) => translateNestedData(item, toLang))
        );
        return translatedArray;
      } else if (typeof nestedData === "object" && nestedData !== null) {
        const translatedObject = {};
        for (const key in nestedData) {
          if (nestedData.hasOwnProperty(key)) {
            const translatedValue = await translateNestedData(
              nestedData[key],
              toLang
            );
            translatedObject[key] = translatedValue;
          }
        }
        return translatedObject;
      }
      return nestedData;
    };

    const translatedData = JSON.parse(JSON.stringify(data));
    const translatedResult = await translateNestedData(translatedData, toLang);
    setLoading(false);
    return translatedResult;
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const translateText = async (text, toLang) => {
    try {
      const resultText = await translate(text, { to: toLang });
      return resultText.text;
    } catch (error) {
      return text; // Return the original text if translation fails
    }
  };

  const clearCache = async () => {
    console.warn("Clearing local browser cache!");
    localStorage.clear();
    setRecipeData("");
    setDisplayRecipeData("");
  };

  const clearBrowserCache = async () => {
    await showToast(clearCache, "Cache cleared!");
  };

  const fetchRecipeData = async () => {
    const cacheKey = `recipe_en_${submittedUrl}`;
    const cacheExpiry = 60 * 60 * 1000 * 24; // 24 hour (in milliseconds)
    setLoading(true);
    // console.log("get from cache with id: ", cacheKey);

    // Check if the cached data exists and is not expired
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

    if (cachedData && cacheTimestamp) {
      const currentTime = new Date().getTime();
      const isCacheExpired = currentTime - Number(cacheTimestamp) > cacheExpiry;

      if (!isCacheExpired) {
        // Use the cached data
        const parsedData = JSON.parse(cachedData);
        setDisplayRecipeData(parsedData);
        setErrorMsg("");

        console.log("Recipe Data: ", parsedData);
        setLoading(false);
        switchLanguage("en");
      } else {
        console.log("Cache data expired");
        await fetchHtmlContent();
      }
    } else {
      console.log("Data not found in cache");
      await fetchHtmlContent();
    }
  };

  const fetchHtmlContent = async () => {
    if (url.trim() !== "") {
      try {
        setLoading(true);
        const response = await fetch(`https://corsproxy.io/?${submittedUrl}`);
        if (response.ok) {
          const data = await response.text();
          const $ = cheerio.load(data);
          const schemaElements = $('script[type="application/ld+json"]');
          const schemaObjects = schemaElements.toArray().map((element) => {
            const schemaText = $(element).html();
            return JSON.parse(schemaText);
          });

          let recipeObject = null;
          for (const schema of schemaObjects) {
            recipeObject = findRecipeObject(schema);
            if (recipeObject) {
              break;
            }
          }

          //   const cleanedObject = cleanupData(recipeObject);

          const cleanedRecipeData = await cleanupData(recipeObject);

          console.log("Cleaned data: ", cleanedRecipeData);
          if (cleanedRecipeData) {
            setRecipeData(cleanedRecipeData);
            setDisplayRecipeData(cleanedRecipeData);
            setErrorMsg("");

            const cacheKey = `recipe_en_${submittedUrl}`;

            localStorage.setItem(cacheKey, JSON.stringify(cleanedRecipeData));
            localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());

            // console.log("saved in cache with id: ", cacheKey);
            switchLanguage("en");
          } else {
            setErrorMsg("No recipe found!");
          }

          setLoading(false);
        } else {
          const errorStatus = response.status;
          const errorMessage = await response.text();
          setErrorMsg(`${errorStatus} - ${errorMessage}`);
          // console.log("Error: ", errorMessage);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);

        setErrorMsg(`${error}`);
      }
    }
  };

  const findRecipeObject = (obj) => {
    if (obj && typeof obj === "object") {
      if (obj["@type"] === "Recipe") {
        return obj;
      } else {
        for (const key in obj) {
          const result = findRecipeObject(obj[key]);
          if (result) {
            return result;
          }
        }
      }
    }
    return null;
  };

  const RecipeInstructions = ({ instructions }) => (
    <ol>
      {instructions.map((instruction, index) => (
        <React.Fragment key={index}>
          {instruction.hasOwnProperty("itemListElement") &&
          Array.isArray(instruction.itemListElement) ? (
            <>
              <h3 className="section-heading">{instruction.name}</h3>
              <RecipeInstructions instructions={instruction.itemListElement} />
            </>
          ) : (
            <li key={index}>{instruction.text}</li>
          )}
        </React.Fragment>
      ))}
    </ol>
  );

  const convertISO8601Time = (time) => {
    const isoRegex =
      /^PT(?:(\d+)(?:-(\d+))?H)?(?:(\d+)(?:-(\d+))?M)?(?:(\d+)(?:-(\d+))?S)?$/;
    const matches = time?.match(isoRegex);

    if (!matches) {
      return "Invalid ISO 8601 time format";
    }

    const hours = parseInt(matches[1]) || 0;
    const minutesLower = parseInt(matches[3]) || 0;
    const minutesUpper = parseInt(matches[4]) || minutesLower;
    const seconds = parseInt(matches[5]) || 0;

    let result = "";

    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    if (minutesLower > 0) {
      if (result) {
        result += " ";
      }

      if (minutesLower < 60) {
        if (minutesUpper > minutesLower) {
          result += `${minutesLower}-${minutesUpper} minute${
            minutesUpper > 1 ? "s" : ""
          }`;
        } else {
          result += `${minutesLower} minute${minutesLower > 1 ? "s" : ""}`;
        }
      } else {
        const remainingMinutes = minutesLower % 60;
        const hoursFromMinutes = Math.floor(minutesLower / 60);
        result += `${hoursFromMinutes} hour${
          hoursFromMinutes > 1 ? "s" : ""
        } ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
      }
    }

    if (result === "") {
      result += `${seconds} second${seconds > 1 ? "s" : ""}`;
    }

    return result;
  };

  const RecipeImage = ({ recipe }) => {
    let displayImage = "";

    if (recipe?.image) {
      if (Array.isArray(recipe.image)) {
        displayImage = recipe.image[0];
      } else if (typeof recipe.image === "object") {
        displayImage = recipe.image.url || "";
      } else if (typeof recipe.image === "string") {
        displayImage = recipe.image;
      }
    }

    return (
      displayImage && (
        <img src={displayImage} className="square-image" alt="Recipe" />
      )
    );
  };

  const htmlDecode = (str) => {
    const doc = new DOMParser().parseFromString(str, "text/html");
    const decodedStr = doc.documentElement.textContent;
    const withoutNewLines = decodedStr.replace(/\r?\n|\r/g, "");
    return withoutNewLines;
  };

  const getDomainName = (url) => {
    let domain = url?.replace(/(^\w+:|^)\/\//, "");
    domain = domain?.split("/")[0];
    domain = domain?.split(":")[0];
    return domain;
  };

  return (
    <div>
      <div className="loader">
        <HashLoader color="#36d646" loading={loading} />
      </div>

      <div className="container">
        <div className="accordion recipe-details" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                Options
              </button>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse show"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <div className="row option-button justify-content-center">
                  {!dbRecipe && displayRecipeData && (
                    <div className="col-auto option-button">
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={handleAddRecipe}
                        disabled={firebaseOperationProcessing}
                      >
                        Add to Favorite
                      </button>
                    </div>
                  )}

                  {!dbRecipe && (
                    <div className="col-auto option-button">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={clearBrowserCache}
                        disabled={loading}
                      >
                        Clear Cache
                      </button>
                    </div>
                  )}

                  <div className="col-auto option-button">
                    <label
                      className="visually-hidden"
                      htmlFor="autoSizingSelect"
                    >
                      Preference
                    </label>
                    <select
                      className="form-select"
                      id="autoSizingSelect"
                      value={language}
                      onChange={handleLanguageChange}
                      disabled={loading}
                    >
                      {/* <option selected>Select a language</option> */}
                      <option value="en" selected>
                        English
                      </option>
                      <option value="mr">Marathi</option>
                      <option value="hi">Hindi</option>
                      <option value="kn">Kannada</option>
                      <option value="te">Telugu</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>

                {!dbRecipe && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${language !== "en" ? "devnagari-font" : ""}`}>
        {errorMsg.length > 0 && (
          <div
            className="alert center-alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <strong>Error!</strong> {errorMsg}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              onClick={() => setErrorMsg("")}
              aria-label="Close"
            ></button>
          </div>
        )}
      </div>

      {displayRecipeData ? (
        <div
          className={`container ${language !== "en" ? "devnagari-font" : ""}`}
        >
          <div className="card">
            <div className="row align-items-center">
              <div className="col-lg-3 text-center">
                <RecipeImage recipe={displayRecipeData} />
              </div>
              <div className="col-lg-9 text-center">
                {/* Content for the 2nd column */}
                <div>
                  <h2
                    className={`'recipe-header' ${
                      language !== "en" ? "devnagari-font" : ""
                    }`}
                  >
                    {displayRecipeData?.name}
                  </h2>
                  <p className="recipe-description">
                    {displayRecipeData?.description &&
                      htmlDecode(displayRecipeData?.description)}
                    <br />
                    <small style={{ fontStyle: "italic" }}>
                      From:
                      <a
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                        href={
                          typeof displayRecipeData?.mainEntityOfPage ===
                          "string"
                            ? displayRecipeData?.mainEntityOfPage
                            : displayRecipeData?.mainEntityOfPage?.["@id"]
                        }
                      >
                        {" "}
                        {typeof displayRecipeData?.mainEntityOfPage === "string"
                          ? getDomainName(displayRecipeData?.mainEntityOfPage)
                          : getDomainName(
                              displayRecipeData?.mainEntityOfPage?.["@id"]
                            )}
                      </a>
                    </small>
                  </p>
                  <p style={{ fontSize: "20px" }}>
                    <span
                      className={`badge text-bg-light ${
                        language !== "en" ? "devnagari-font" : ""
                      }`}
                    >
                      {Array.isArray(displayRecipeData?.recipeYield)
                        ? displayRecipeData.recipeYield[0]
                        : displayRecipeData?.recipeYield}{" "}
                      {textLabels.servings}
                    </span>
                  </p>

                  <div className="row">
                    <div className="col-sm-4 d-flex justify-content-center">
                      <div className="recipe-time-box">
                        <label>
                          <RxLapTimer /> {textLabels.prepTime}
                        </label>
                        <span>
                          {displayRecipeData?.prepTime &&
                            convertISO8601Time(displayRecipeData?.prepTime)}
                        </span>
                      </div>
                    </div>
                    <div className="col-sm-4 d-flex justify-content-center">
                      <div className="recipe-time-box">
                        <label>
                          <RxLapTimer /> {textLabels.cookTime}
                        </label>
                        <span>
                          {displayRecipeData?.cookTime &&
                            convertISO8601Time(displayRecipeData?.cookTime)}
                        </span>
                      </div>
                    </div>

                    <div className="col-sm-4 d-flex justify-content-center">
                      <div className="recipe-time-box">
                        <label>
                          <RxLapTimer /> {textLabels.totalTime}
                        </label>
                        <span>
                          {displayRecipeData?.totalTime &&
                            convertISO8601Time(displayRecipeData?.totalTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-md-4" style={{ marginTop: "10px" }}>
                <h2
                  className={`'recipe-header' ${
                    language !== "en" ? "devnagari-font" : ""
                  }`}
                >
                  {textLabels.ingredients}
                </h2>
                <div className="recipe-ingredients">
                  <ul className="list-group">
                    {displayRecipeData?.recipeIngredient?.map(
                      (ingredient, index) => (
                        <li
                          key={index}
                          className="list-group-item list-group-item-action list-group-item-light"
                        >
                          {ingredient}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
              <div className="col-md-8" style={{ marginTop: "10px" }}>
                <h2
                  className={`'recipe-header' ${
                    language !== "en" ? "devnagari-font" : ""
                  }`}
                >
                  {textLabels.directions}
                </h2>
                <div className="recipe-instructions">
                  {displayRecipeData?.recipeInstructions && (
                    <RecipeInstructions
                      instructions={displayRecipeData.recipeInstructions}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default RecipeSummarizer;
