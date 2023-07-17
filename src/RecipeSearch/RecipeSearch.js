import React, { useState, useContext, useEffect } from "react";
import cheerio from "cheerio";
import "./RecipeSearch.css";
import { RxLapTimer } from "react-icons/rx";
import { HashLoader } from "react-spinners";
import { setCORS } from "google-translate-api-browser";
import LanguageContext from "../LanguageContext/LanguageContext";

import FirebaseUtils from "../FirebaseUtil/FirebaseUtils";
import { FaArrowRight, FaPaste } from "react-icons/fa6";
import { BsBookmark, BsPrinter } from "react-icons/bs";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../Login/Login";
import CommonUtils from "../CommonUtils/CommonUtils";

function RecipeSearch({ dbRecipe, token, setToken }) {
  const [showLogin, setShowLogin] = useState(false);

  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [recipeData, setRecipeData] = useState("");
  const [displayRecipeData, setDisplayRecipeData] = useState("");
  const [loading, setLoading] = useState(false);
  const translate = setCORS("https://corsproxy.io/?");
  const { language, switchLanguage } = useContext(LanguageContext);
  
  const textLabels = require(`../Assets/${language}.json`); // Load language-specific translations
  const [recipeThumbnail, setRecipeThumbnail]  = useState("https://placehold.co/200x200");

  useEffect(() => {
    const derivedThumbnail = CommonUtils.getImageUrl(displayRecipeData);
    if(derivedThumbnail){
      setRecipeThumbnail(derivedThumbnail);
    }
  }, [displayRecipeData]);

  const handleAddRecipe = (event) => {
    event.preventDefault();
    if(token){
      setFirebaseOperationProcessing(true);
      CommonUtils.showToast(
        FirebaseUtils.addRecipeToCollection(recipeData),
        "Recipe saved!"
      );
      setFirebaseOperationProcessing(false);
      
    } else {
      setShowLogin(true);
    }
  };

  useEffect(() => {
    if (dbRecipe) {
      setRecipeData(dbRecipe?.data?.recipeObject);

      if (dbRecipe?.data?.recipeObject?.mainEntityOfPage) {
        let mainEntity = dbRecipe?.data?.recipeObject?.mainEntityOfPage;
        let recipeUrl;
        if (typeof mainEntity == "object" && mainEntity["@id"]) {
          recipeUrl = mainEntity["@id"];
        } else if (typeof mainEntity == "string") {
          recipeUrl = mainEntity;
        }
        setSubmittedUrl(recipeUrl);
      } else {
        console.warn("mainEntityOfPage missing in recipe");
      }
    }
  }, [dbRecipe]);

  const handlePasteFromClipboard = (event) => {
    event.preventDefault();
    navigator.clipboard.readText().then((text) => {
      setUrl(text);
    });
  };

  const handlePrintAction = async (event) => {
    event.preventDefault();
    window.print();
  };

  // Define a state variable to keep track of the checked checkboxes
  const [checkedItems, setCheckedItems] = useState([]);

  // Function to handle checkbox change
  const handleCheckboxChange = (e, index) => {
    const isChecked = e.target.checked;

    // Create a new array based on the current checkedItems state
    const newCheckedItems = [...checkedItems];

    if (isChecked) {
      // Add the index to the checkedItems array if checkbox is checked
      newCheckedItems.push(index);
    } else {
      // Remove the index from the checkedItems array if checkbox is unchecked
      const indexToRemove = newCheckedItems.indexOf(index);
      if (indexToRemove !== -1) {
        newCheckedItems.splice(indexToRemove, 1);
      }
    }

    // Update the checkedItems state with the new array
    setCheckedItems(newCheckedItems);
  };

  // Function to check if a checkbox is checked
  const isChecked = (index) => {
    return checkedItems.includes(index);
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    switchLanguage(selectedLanguage);
    console.log("Selected language: ", selectedLanguage);
  };

  function replaceOuterParenthesesWithTags(inputString) {
    let replacedString = inputString;
    const regex = /\((?:[^()]+)\)/g;

    // Find all matches of outer parentheses using regex
    const matches = inputString.match(regex);

    if (matches) {
      // Iterate over each match
      matches.forEach((match) => {
        const replacement = `<xx>${match.slice(1, -1)}</xx>`;
        replacedString = replacedString.replace(match, replacement);
      });
    }

    const regex1 = /\(([^()]+)\)/g;
    replacedString = replacedString.replace(
      regex1,
      "<small class='ingredient-small'>$1</small>"
    );
    replacedString = replaceTagsWithParentheses(replacedString);

    return replacedString;
  }

  function replaceTagsWithParentheses(inputString) {
    let replacedString;
    if (inputString.includes("<small") && inputString.includes("</small>")) {
      replacedString = inputString.replace("<xx>", "(").replace("</xx>", ")");
    } else {
      replacedString = inputString
        .replace("<xx>", `<small class='ingredient-small'>`)
        .replace("</xx>", "</small>");
    }
    return replacedString;
  }

  const [firebaseOperationProcessing, setFirebaseOperationProcessing] =
    useState(false);

  

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    let isValidUrl = CommonUtils.validateUrl(url);
    if (isValidUrl){
      setSubmittedUrl(url);
    } else {
      CommonUtils.showWarnToast("Please provide valid URL.")
    }
    
  };

  useEffect(() => {
    setDisplayRecipeData(recipeData);
  }, [recipeData]);

  useEffect(() => {
    if (recipeData) {
      handleRecipeTranslate();
    }
  }, [language]);

  useEffect(() => {
    // console.log("DB Recipe: ", dbRecipe);
    const fetchRecipeData = async () => {
      const cacheKey = `recipe_en_${submittedUrl}`;
      const cacheExpiry = 60 * 60 * 1000 * 24; // 24 hour (in milliseconds)
      setLoading(true);

      // Check if the cached data exists and is not expired
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

      if (cachedData && cacheTimestamp) {
        const currentTime = new Date().getTime();
        const isCacheExpired =
          currentTime - Number(cacheTimestamp) > cacheExpiry;

        if (!isCacheExpired) {
          // Use the cached data
          const parsedData = JSON.parse(cachedData);
          // console.log("Cached data: ", parsedData);

          setRecipeData(parsedData);
          // console.log("Recipe Data: ", parsedData);
          setLoading(false);
          switchLanguage("en");
        } else {
          console.log("Cache data expired");
          await fetchHtmlContent();
        }
      } else {
        console.log("Data not found in cache1");
        await fetchHtmlContent();
      }
    };

    if (submittedUrl) {
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
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());
    };

    const handleCacheHit = () => {
      const { cachedData } = getCachedData();
      const parsedData = JSON.parse(cachedData);
      setDisplayRecipeData(parsedData);
      setLoading(false);
    };

    const handleCacheMiss = async () => {
      console.log("Data not found in cache");

      if (language === "en" && recipeData) {
        // console.log("Language is english");
        setCacheData(recipeData);
        setDisplayRecipeData(recipeData);
      } else if (recipeData) {
        // console.log("Language is not english and recipeData is present");

        const newRecipeData = await translateData(recipeData, language);
        setCacheData(newRecipeData);
        setDisplayRecipeData(newRecipeData);
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
    const ignoredKeys = [
      "url",
      "totalTime",
      "review",
      "image",
      "height",
      "width",
      "video",
      "duration",
      "thumbnailUrl",
      "uploadDate",
      "publishingPrinciples",
      "sameAs",
      "cookTime",
      "prepTime",
    ];

    const ignoredValues = [
      "ImageObject",
      "Person",
      "Recipe",
      "NewsArticle",
      "Organization",
      "AggregateRating",
      "NutritionInformation",
      "HowToStep",
      "WebPage",
      "BreadcrumbList",
      "ListItem",
      "VideoObject",
      "HowToSection",
    ];
    const translateNestedData = async (nestedData, toLang) => {
      if (
        typeof nestedData === "string" &&
        !nestedData.startsWith("PT") &&
        !nestedData.startsWith("http") &&
        !ignoredKeys.includes(nestedData) &&
        !ignoredValues.includes(nestedData)
      ) {
        try {
          const englishString = htmlDecode(nestedData);
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
            if (
              ignoredKeys.includes(key) ||
              ignoredValues.includes(nestedData[key])
            ) {
              translatedObject[key] = nestedData[key];
            } else {
              const translatedValue = await translateNestedData(
                nestedData[key],
                toLang
              );
              translatedObject[key] = translatedValue;
            }
          }
        }
        return translatedObject;
      }
      return nestedData;
    };

    const translatedResult = await translateNestedData(data, toLang);
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
    setRecipeData(null);
  };

  const clearBrowserCache = async () => {
    await CommonUtils.showToast(clearCache, "Cache cleared!");
  };

  const { microdata } = require("@cucumber/microdata");

  const fetchHtmlContent = async () => {
    if (submittedUrl.trim() !== "") {
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

          if (!recipeObject) {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, "text/html");

            const recipeDoc = microdata("https://schema.org/Recipe", htmlDoc);

            // console.log("Recipe: ", recipeDoc);
            recipeObject = recipeDoc;
          }

          const cleanedRecipeData = await cleanupData(recipeObject);

          // console.log("Cleaned data: ", cleanedRecipeData);
          if (cleanedRecipeData) {
            setRecipeData(cleanedRecipeData);
            const cacheKey = `recipe_en_${submittedUrl}`;

            localStorage.setItem(cacheKey, JSON.stringify(cleanedRecipeData));
            localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());

            switchLanguage("en");
          } else {
            toast.error("No recipe found!");
          }

          setLoading(false);
        } else {
          const errorStatus = response.status;
          const errorMessage = await response.text();
          console.error(errorMessage);

          toast.error("No recipe found!");
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        console.error(error);

        toast.error("No recipe found!");
      }
    }
  };

  const findRecipeObject = (obj) => {
    if (obj && typeof obj === "object") {
      if (obj["@type"] === "Recipe") {
        return obj;
      } else if (
        Array.isArray(obj["@type"]) &&
        obj["@type"]?.includes("Recipe")
      ) {
        return obj;
      } else {
        for (const key in obj) {
          const result = findRecipeObject(obj[key]);
          if (result) {
            return result;
          }
        }
      }
    } else if (obj && Array.isArray(obj)) {
      obj.map((item) => findRecipeObject(item));
    }
    return null;
  };

  const renderRecipeImage = (imageAttribute) => {
    if (Array.isArray(imageAttribute)) {
      return imageAttribute.map((img, index) => (
        <div key={index}>{renderRecipeImage(img)}</div>
      ));
    } else if (typeof imageAttribute === "object" && imageAttribute?.url) {
      return (
        <img
          src={imageAttribute?.url}
          className="instruction-image"
          alt="Instruction Image"
        />
      );
    } else if (typeof imageAttribute === "string") {
      return (
        <img
          src={imageAttribute}
          className="instruction-image"
          alt="Instruction Image"
        />
      );
    }
  };

  const RecipeInstructions = ({ instructions }) => (
    <ol>
      {instructions.map((instruction, index) => (
        <React.Fragment key={index}>
          {instruction.hasOwnProperty("itemListElement") &&
          Array.isArray(instruction.itemListElement) ? (
            <>
              <h3 className="section-heading">
                {instruction.name ? instruction.name : `Part ${index + 1}`}
              </h3>
              <RecipeInstructions instructions={instruction.itemListElement} />
            </>
          ) : (
            <li key={index}>
              <span>{instruction.text}</span>
              <div className="instr-image-container">
                {renderRecipeImage(instruction.image)}
              </div>
              <hr className="instruction-hr" />
            </li>
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
      console.warn("Invalid ISO 8601 time format");
      return "--";
    }

    const hours = parseInt(matches[1]) || 0;
    const minutesLower = parseInt(matches[3]) || 0;
    const minutesUpper = parseInt(matches[4]) || minutesLower;
    const seconds = parseInt(matches[5]) || 0;

    let result = "";

    if (hours > 0) {
      result += `${hours} hr${hours > 1 ? "s" : ""}`;
    }

    if (minutesLower > 0) {
      if (result) {
        result += " ";
      }

      if (minutesLower < 60) {
        if (minutesUpper > minutesLower) {
          result += `${minutesLower}-${minutesUpper} min${
            minutesUpper > 1 ? "s" : ""
          }`;
        } else {
          result += `${minutesLower} min${minutesLower > 1 ? "s" : ""}`;
        }
      } else {
        const remainingMinutes = minutesLower % 60;
        const hoursFromMinutes = Math.floor(minutesLower / 60);
        result += `${hoursFromMinutes} hr${
          hoursFromMinutes > 1 ? "s" : ""
        } ${remainingMinutes} min${remainingMinutes > 1 ? "s" : ""}`;
      }
    }

    if (result === "") {
      result += `${seconds} sec${seconds > 1 ? "s" : ""}`;
    }

    return result;
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
      { (showLogin && !token) && <Login setToken={setToken} showLogin={showLogin} setShowLogin={setShowLogin} />}
      <div className="loader">
        <HashLoader color="#36d646" loading={loading} />
      </div>

      <div className="container search-options">
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
                <div className="row justify-content-center">
                  {!dbRecipe && displayRecipeData && (
                    <div className="col-auto option-button">
                      <button
                        type="button"
                        className="btn btn-danger save-btn"
                        onClick={handleAddRecipe}
                        disabled={firebaseOperationProcessing}
                      >
                        <BsBookmark /> Save
                      </button>
                    </div>
                  )}

                  <div className="col-auto option-button">
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={handlePrintAction}
                      disabled={firebaseOperationProcessing}
                    >
                      <BsPrinter /> Print
                    </button>
                  </div>

                  {/* {!dbRecipe && (
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
                  )} */}

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
                      className="form-control search-box"
                      type="text"
                      id="urlInput"
                      value={url}
                      onChange={handleUrlChange}
                      autoComplete="on"
                      autoCorrect="on"
                      disabled={loading}
                      required
                    />
                    <FaPaste
                      className="paste-btn align-self-center"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      data-bs-custom-class="custom-tooltip"
                      data-bs-title="This top tooltip is themed via CSS variables."
                      type="button"
                      onClick={handlePasteFromClipboard}
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

      {displayRecipeData ? (
        <div
          className={`container print-content ${
            language !== "en" ? "devnagari-font" : ""
          }`}
        >
          <div className="recipe-box">
            <div className="row align-items-center">
              <div className="col-sm-3 text-center">

                <img src={recipeThumbnail} className="square-image" alt="Recipe" />
              </div>
              <div className="col-sm-9 text-center">
                {/* Content for the 2nd column */}
                <div>
                  <h2
                    className={`'recipe-header' ${
                      language !== "en" ? "devnagari-font" : ""
                    }`}
                  >
                    {Array.isArray(displayRecipeData?.name) &&
                    displayRecipeData?.name.length > 1
                      ? displayRecipeData?.name[0]
                      : displayRecipeData?.name}
                  </h2>
                  <p className="recipe-description">
                    {displayRecipeData?.description?.length <= 400 &&
                      htmlDecode(displayRecipeData?.description)}
                    <br />
                    {displayRecipeData?.mainEntityOfPage && (
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
                          {typeof displayRecipeData?.mainEntityOfPage ===
                          "string"
                            ? getDomainName(displayRecipeData?.mainEntityOfPage)
                            : getDomainName(
                                displayRecipeData?.mainEntityOfPage?.["@id"]
                              )}
                        </a>
                      </small>
                    )}
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

                  <div className="row row-cols-1">
                    <div className="col-4 col-sm-4 d-flex justify-content-center">
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
                    <div className="col-4 col-sm-4 d-flex justify-content-center">
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

                    <div className="col-4 col-sm-4 d-flex justify-content-center">
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
                  <ul className="">
                    {displayRecipeData?.recipeIngredient?.map(
                      (ingredient, index) => (
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            key={index}
                            id={`flexCheckDefault_${index}`}
                            onChange={(e) => handleCheckboxChange(e, index)}
                          />
                          <label
                            className={`form-check-label ${
                              isChecked(index) ? "strikeout" : ""
                            }`}
                            htmlFor={`flexCheckDefault_${index}`}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  replaceOuterParenthesesWithTags(ingredient),
                              }}
                            ></span>
                          </label>
                        </div>
                      )
                    )}

                    {/* <li
                          key={index}
                          className="list-group-item-action list-group-item-light"
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: replaceOuterParenthesesWithTags(ingredient),
                            }}
                          ></span>

                        </li> */}
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

export default RecipeSearch;
