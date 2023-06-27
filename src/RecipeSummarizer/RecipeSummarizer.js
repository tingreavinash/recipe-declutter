import React, { useEffect, useState } from 'react';
import cheerio from 'cheerio';
import './RecipeSummarizer.css';
import { RxLapTimer } from "react-icons/rx";
import { HashLoader } from 'react-spinners';

function RecipeSummarizer() {
    const [url, setUrl] = useState('');
    const [recipeData, setRecipeData] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoad, isDataLoaded] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const fetchHtmlContent = async (event) => {
        event.preventDefault();
        if (url.trim() !== '') {
            try {
                setLoading(true);
                const response = await fetch(`https://proxy.cors.sh/${url}`);
                if (response.ok) {
                    const data = await response.text();

                    setLoading(false);
                    isDataLoaded(true);
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
                    setUrl('');

                } else {
                    setLoading(false);
                    const errorStatus = response.status;
                    const errorMessage = await response.text();
                    setErrorMsg(`Error: ${errorStatus} - ${errorMessage}`);
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

    const formatDuration = (duration) => {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const [, hours, minutes, seconds] = duration.match(regex) || [];
        return `${hours ? hours + ' hours ' : ''}${minutes ? minutes + ' minutes ' : ''}${seconds ? seconds + ' seconds' : ''}`;
    };

    const RecipeImage = ({ recipe }) => {
        let lastImage = '';

        if (recipe?.image) {
            if (Array.isArray(recipe.image)) {
                lastImage = recipe.image[recipe.image.length - 1];
            } else if (typeof recipe.image === 'object') {
                lastImage = recipe.image.url || '';
            }
        }

        return (
            <>
                {lastImage && <img src={lastImage} className='square-image' alt="Recipe" />}
            </>
        );
    };

    const htmlDecode = (input) => {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
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

            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand">Recipe Declutter</a>
                    <form className="d-flex" onSubmit={fetchHtmlContent}>
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
                </div>
            </nav>
            <div className='container'>

                {errorMsg !== '' &&
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>Error!</strong> {errorMsg}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" onClick={setErrorMsg('')} aria-label="Close"></button>
                    </div>
                }

            </div>

            {dataLoad ? (
                <div className='container'>
                    <div className='card'>
                        <div className="row align-items-center">
                            <div className="col-lg-3 text-center">
                                <RecipeImage recipe={recipeData} />
                            </div>
                            <div className="col-lg-9 text-center" style={{ marginTop: '5px' }}>
                                {/* Content for the 2nd column */}
                                <div >
                                    <h2>{recipeData?.name}</h2>
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
                                    <p style={{ fontSize: '20px' }}><span className="badge text-bg-light">{
                                        Array.isArray(recipeData?.recipeYield) ? (
                                            recipeData.recipeYield[0]
                                        ) : (
                                            recipeData?.recipeYield
                                        )} serving</span></p>



                                    <div className='row'>
                                        <div className='col-sm-4 d-flex justify-content-center'>
                                            <div className='recipe-time-box'>
                                                <label><RxLapTimer /> Cook Time</label>
                                                <span>{recipeData?.cookTime && formatDuration(recipeData?.cookTime)}</span>
                                            </div>
                                        </div>
                                        <div className='col-sm-4 d-flex justify-content-center'>
                                            <div className='recipe-time-box'>
                                                <label><RxLapTimer /> Prep Time</label>
                                                <span>{recipeData?.prepTime && formatDuration(recipeData?.prepTime)}</span>
                                            </div>
                                        </div>
                                        <div className='col-sm-4 d-flex justify-content-center'>
                                            <div className='recipe-time-box'>
                                                <label><RxLapTimer /> Total Time</label>
                                                <span>{recipeData?.totalTime && formatDuration(recipeData?.totalTime)}</span>
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
                                <h2>Ingredients</h2>
                                <div className='recipe-ingredients'>
                                    <ul className='list-group'>
                                        {recipeData?.recipeIngredient?.map((ingredient, index) => (
                                            <li key={index} className='list-group-item list-group-item-action list-group-item-light'>{ingredient}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-8" style={{ marginTop: '10px' }}>
                                <h2>Directions</h2>
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
