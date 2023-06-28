import React, { useState } from 'react';
import cheerio from 'cheerio';
import './RecipeSummarizer.css';
import { RxLapTimer } from "react-icons/rx";
import { HashLoader } from 'react-spinners';
import { setCORS } from "google-translate-api-browser";

function RecipeSummarizer() {
    const [url, setUrl] = useState('');
    const [recipeData, setRecipeData] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoad, isDataLoaded] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const translate = setCORS("https://corsproxy.io/?");

    const [textLabels, setTextLabels] = useState({
        directions: 'Directions',
        ingredients: 'Ingredients',
        cookTime: 'Cook Time',
        prepTime: 'Prep Time',
        totalTime: 'Total Time',
        servings: 'servings'
    });

    const [isDevnagari, toggleTranslate] = useState(false);

    const handleTranslate = () => {

        if (!isDevnagari) {
            setLoading(true);
            handleRecipeTranslate();
        }

    };

    const handleTranslateToEnglish = async () => {
        if (isDevnagari) {
            fetchRecipeData();
        }
    }


    const handleStaticContentTranslate = async () => {
        const cacheKey = 'cachedData_translated_static';

        const cacheExpiry = 60 * 60 * 1000 * 24;  // 24 hour (in milliseconds)
        // Check if the cached data exists and is not expired
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);


        if (cachedData && cacheTimestamp) {
            const currentTime = new Date().getTime();
            const isCacheExpired = currentTime - Number(cacheTimestamp) > cacheExpiry;
            if (!isCacheExpired) {
                // Use the cached data
                const parsedData = JSON.parse(cachedData);
                // Process and display the data as needed
                console.log('Data found in cache:', parsedData);
                setTextLabels(parsedData);
                isDataLoaded(true);

            }
        } else {

            console.log('Data not found in cache');
            const staticLabels = await translateData(textLabels, 'mr');
            // Store the data in the cache
            localStorage.setItem(cacheKey, JSON.stringify(staticLabels));
            localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());
            setTextLabels(staticLabels);
            isDataLoaded(true);
        }
    }

    const handleRecipeTranslate = async () => {

        const cacheKey = 'cachedData_translated_recipe' + recipeData?.name;

        const cacheExpiry = 60 * 60 * 1000; // 1 hour (in milliseconds)
        // Check if the cached data exists and is not expired
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);


        if (cachedData && cacheTimestamp) {
            const currentTime = new Date().getTime();
            const isCacheExpired = currentTime - Number(cacheTimestamp) > cacheExpiry;
            if (!isCacheExpired) {
                // Use the cached data
                const parsedData = JSON.parse(cachedData);
                // Process and display the data as needed
                console.log('Data found in cache:', parsedData);
                setRecipeData(parsedData);
                isDataLoaded(true);
                setLoading(false);
                toggleTranslate(true);
                handleStaticContentTranslate();



            }
        } else {
            console.log('Data not found in cache');
            const newRecipeData = await translateData(recipeData, 'mr');
            // Store the data in the cache
            localStorage.setItem(cacheKey, JSON.stringify(newRecipeData));
            localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());
            setRecipeData(newRecipeData);
            setLoading(false);
            toggleTranslate(true);
            handleStaticContentTranslate();

            isDataLoaded(true);
        }
    }

    const translateData = async (data, toLang) => {
        const translateNestedData = async (data, toLang) => {
            if (typeof data === 'string' && !data.startsWith("PT")) {
                try {
                    const englishString = htmlDecode(data);
                    console.log("Raw string: ", englishString);
                    const translated = await translateText(englishString, toLang);
                    console.log("Translated: ", translated);
                    return translated;
                } catch (error) {

                    return data; // Return the original string if translation fails
                }
            } else if (Array.isArray(data)) {
                const translatedArray = [];
                for (let i = 0; i < data.length; i++) {
                    const translatedItem = await translateNestedData(data[i], toLang);
                    translatedArray.push(translatedItem);
                }
                return translatedArray;
            } else if (typeof data === 'object' && data !== null) {
                const translatedObject = {};
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const translatedValue = await translateNestedData(data[key], toLang);
                        translatedObject[key] = translatedValue;
                    }
                }
                return translatedObject;
            }
            return data;
        };

        const translatedData = JSON.parse(JSON.stringify(data));
        const translatedResult = await translateNestedData(translatedData, toLang);
        return translatedResult;

    }

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const translateText = async (text, toLang) => {
        try {
            const translatedText = await translate(text, { to: toLang });
            return translatedText.text;
        } catch (error) {
            // console.error('Error occurred during translation:', error);
            // console.log("Couldn't translate: ", text);
            return text; // Return the original text if translation fails
        }
    };

    const fetchRecipeData = () => {

        const cacheKey = 'cachedData_' + url;
        const cacheExpiry = 60 * 60 * 1000; // 1 hour (in milliseconds)

        setLoading(true);

        // Check if the cached data exists and is not expired
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

        if (cachedData && cacheTimestamp) {


            const currentTime = new Date().getTime();
            const isCacheExpired = currentTime - Number(cacheTimestamp) > cacheExpiry;

            if (!isCacheExpired) {


                // Use the cached data
                const parsedData = JSON.parse(cachedData);
                // Process and display the data as needed
                console.log('Data found in cache:', parsedData);
                setRecipeData(parsedData);
                setTextLabels({
                    directions: 'Directions',
                    ingredients: 'Ingredients',
                    cookTime: 'Cook Time',
                    prepTime: 'Prep Time',
                    totalTime: 'Total Time',
                    servings: 'servings'
                });
                setLoading(false);
                isDataLoaded(true);
                toggleTranslate(false);
            } else {
                console.log('Cache data expired');
                fetchHtmlContent();
            }
        } else {
            console.log('Data not found in cache');
            fetchHtmlContent();
        }
    }


    const fetchHtmlContent = async () => {
        if (url.trim() !== '') {
            try {
                setLoading(true);

                const response = await fetch(`https://corsproxy.io/?${url}`);
                if (response.ok) {
                    const data = await response.text();

                    const $ = cheerio.load(data);
                    const schemaElements = $('script[type="application/ld+json"]');
                    const schemaObjects = [];

                    schemaElements.each((index, element) => {
                        const schemaText = $(element).html();
                        const schema = JSON.parse(schemaText);
                        schemaObjects.push(schema);
                    });

                    let recipeObject = null;
                    for (const schema of schemaObjects) {
                        recipeObject = findRecipeObject(schema);
                        if (recipeObject) {
                            break;
                        }
                    }

                    console.log("Recipe: {}", recipeObject);

                    setRecipeData(recipeObject);

                    const cacheKey = 'cachedData_' + url;

                    // Store the data in the cache
                    localStorage.setItem(cacheKey, JSON.stringify(recipeObject));
                    localStorage.setItem(`${cacheKey}_timestamp`, new Date().getTime());

                    setLoading(false);
                    isDataLoaded(true);
                    toggleTranslate(false);
                    setTextLabels({
                        directions: 'Directions',
                        ingredients: 'Ingredients',
                        cookTime: 'Cook Time',
                        prepTime: 'Prep Time',
                        totalTime: 'Total Time',
                        servings: 'servings'
                    });

                } else {
                    const errorStatus = response.status;
                    const errorMessage = await response.text();
                    setErrorMsg(`Error: ${errorStatus} - ${errorMessage}`);
                    setLoading(false);

                }
            } catch (error) {
                setLoading(false);

                console.log('Error fetching HTML content:', error);
            }


        }
    };

    const findRecipeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            if (obj['@type'] === 'Recipe') {
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

    const RecipeInstructions = ({ instructions }) => {
        return (

            <>
                <ol className="">

                    {instructions.map((instruction, index) => (
                        <>
                            {instruction["@type"] === "HowToSection" ? (
                                <>
                                    <h3 className='section-heading'>{instruction.name}</h3>
                                    <RecipeInstructions instructions={instruction.itemListElement} />
                                </>
                            ) : (
                                <li className="" key={index}>{instruction.text}</li>
                            )}
                        </>
                    ))}
                </ol>

            </>
        );
    };

    function convertISO8601Time(time) {
        const isoRegex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
        const matches = time?.match(isoRegex);

        if (!matches) {
            return 'Invalid ISO 8601 time format';
        }

        const hours = matches[1] ? parseInt(matches[1]) : 0;
        const minutes = matches[2] ? parseInt(matches[2]) : 0;
        const seconds = matches[3] ? parseInt(matches[3]) : 0;

        let result = '';

        if (hours > 0) {
            result += `${hours} hour${hours > 1 ? 's' : ''}`;
        }

        if (minutes > 0) {
            if (result) {
                result += ' ';
            }

            if (minutes < 60) {
                result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                const remainingMinutes = minutes % 60;
                const hoursFromMinutes = Math.floor(minutes / 60);
                result += `${hoursFromMinutes} hour${hoursFromMinutes > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
            }
        }

        if (result === '') {
            result += `${seconds} second${seconds > 1 ? 's' : ''}`;
        }

        return result;
    };

    const RecipeImage = ({ recipe }) => {
        let displayImage = '';

        if (recipe?.image) {
            if (Array.isArray(recipe.image)) {
                // displayImage = recipe.image[recipe.image.length - 1];
                displayImage = recipe.image[0];
            } else if (typeof recipe.image === 'object') {
                displayImage = recipe.image.url || '';
            }
        }

        return (
            <>
                {displayImage && <img src={displayImage} className='square-image' alt="Recipe" />}
            </>
        );
    };

    const htmlDecode = (str) => {
        const doc = new DOMParser().parseFromString(str, "text/html");
        const decodedStr = doc.documentElement.textContent;
        const withoutNewLines = decodedStr.replace(/\r?\n|\r/g, "");
        return withoutNewLines;
    };

    function getDomainName(url) {
        // Remove the protocol (e.g., "https://") if present
        let domain = url?.replace(/(^\w+:|^)\/\//, '');

        // Remove path and query string, if any
        domain = domain?.split('/')[0];

        // Remove port number, if any
        domain = domain?.split(':')[0];

        return domain;
    };

    return (
        <div>
            <div className='loader'>
                <HashLoader
                    color="#36d646"
                    loading={loading}
                />
            </div>

            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Navbar</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#" onClick={handleTranslate}>Translate to Marathi</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="#" onClick={handleTranslateToEnglish}>Translate to English</a>
                            </li>

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
                        </ul>
                    </div>
                </div>
            </nav>

            <div className={`container ${isDevnagari ? 'devnagari-font' : ''}`}>

                {errorMsg !== '' &&
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>Error!</strong> {errorMsg}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" onClick={setErrorMsg('')} aria-label="Close"></button>
                    </div>
                }

            </div>

            {dataLoad ? (
                <div className={`container ${isDevnagari ? 'devnagari-font' : ''}`}>
                    <div className='card'>
                        <div className="row align-items-center">
                            <div className="col-lg-3 text-center">
                                <RecipeImage recipe={recipeData} />
                            </div>
                            <div className="col-lg-9 text-center" >
                                {/* Content for the 2nd column */}
                                <div >
                                    <h2 className={`${isDevnagari ? 'devnagari-font' : ''}`}>{recipeData?.name}</h2>
                                    <p className='recipe-description'>{recipeData?.description && htmlDecode(recipeData?.description)}
                                        <br />
                                        <small style={{ fontStyle: 'italic' }}>
                                            From:
                                            <a target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}
                                                href={typeof recipeData?.mainEntityOfPage === 'string' ? recipeData?.mainEntityOfPage : recipeData?.mainEntityOfPage?.['@id']}
                                            > {typeof recipeData?.mainEntityOfPage === 'string' ? getDomainName(recipeData?.mainEntityOfPage) : getDomainName(recipeData?.mainEntityOfPage?.['@id'])}
                                            </a>

                                        </small>
                                    </p>
                                    <p style={{ fontSize: '20px' }}><span className={`badge text-bg-light ${isDevnagari ? 'devnagari-font' : ''}`}>{
                                        Array.isArray(recipeData?.recipeYield) ? (
                                            recipeData.recipeYield[0]
                                        ) : (
                                            recipeData?.recipeYield
                                        )} {textLabels.servings}</span></p>



                                    <div className='row'>
                                        <div className='col-sm-4 d-flex justify-content-center'>
                                            <div className='recipe-time-box'>
                                                <label><RxLapTimer /> {textLabels.prepTime}</label>
                                                <span>{recipeData?.prepTime && convertISO8601Time(recipeData?.prepTime)}</span>
                                            </div>
                                        </div>
                                        <div className='col-sm-4 d-flex justify-content-center'>
                                            <div className='recipe-time-box'>
                                                <label><RxLapTimer /> {textLabels.cookTime}</label>
                                                <span>{recipeData?.cookTime && convertISO8601Time(recipeData?.cookTime)}</span>
                                            </div>
                                        </div>

                                        <div className='col-sm-4 d-flex justify-content-center'>
                                            <div className='recipe-time-box'>
                                                <label><RxLapTimer /> {textLabels.totalTime}</label>
                                                <span>{recipeData?.totalTime && convertISO8601Time(recipeData?.totalTime)}</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            {/* <div className="accordion recipe-details" id="accordionExample">
                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                            More details
                                        </button>
                                    </h2>
                                    <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-md-4" style={{ marginTop: '10px' }}>
                                <h2 className={`${isDevnagari ? 'devnagari-font' : ''}`}>{textLabels.ingredients}</h2>
                                <div className='recipe-ingredients'>
                                    <ul className='list-group'>
                                        {recipeData?.recipeIngredient?.map((ingredient, index) => (
                                            <li key={index} className='list-group-item list-group-item-action list-group-item-light'>{ingredient}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-8" style={{ marginTop: '10px' }}>
                                <h2 className={`${isDevnagari ? 'devnagari-font' : ''}`}>{textLabels.directions}</h2>
                                <div className='recipe-instructions'>
                                    {recipeData?.recipeInstructions && (
                                        <RecipeInstructions instructions={recipeData.recipeInstructions} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <></>
            )

            }



            {errorMsg &&
                <div role="alert" aria-live="assertive" aria-atomic="true" className="toast" data-bs-autohide="true">
                    <div className="toast-header">
                        <img src="..." className="rounded me-2" alt="..." />
                        <strong className="me-auto">Error</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div className="toast-body">
                        {errorMsg}
                    </div>
                </div>
            }


        </div>
    );
}

export default RecipeSummarizer;
