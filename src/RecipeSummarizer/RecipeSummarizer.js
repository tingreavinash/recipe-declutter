import React, { useState } from 'react';
import cheerio from 'cheerio';
import './RecipeSummarizer.css';

function RecipeSummarizer() {
    const [url, setUrl] = useState('');
    const [htmlContent, setHtmlContent] = useState('');

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const fetchHtmlContent = async () => {
        try {
            console.log("------------>>>")
            const response = await fetch(url);
            const data = await response.text();

            // Extract the schema from the HTML content using cheerio
            const $ = cheerio.load(data);
            const schemaElement = $('script[type="application/ld+json"]');
            const schemaText = schemaElement.html();

            // Parse the extracted JSON schema
            const schema = JSON.parse(schemaText);

            // Find the object with "@type" equal to "Recipe"
            const recipeObject = schema['@graph'].find(obj => obj['@type'] === 'Recipe');

            // Print the recipe object
            console.log("Recipe: {}", recipeObject);

            setHtmlContent(recipeObject);

        } catch (error) {
            console.error('Error fetching HTML content:', error);
        }
    };


    const RecipeInstructions = ({ instructions }) => {

        return (
            <div>
                {instructions.map((instruction, index) => (
                    <div key={index}>
                        {instruction["@type"] === "HowToSection" ? (
                            <>
                                <h2>{instruction.name}</h2>
                                {instruction.itemListElement.map((step, index) => (
                                    <li key={index}>{step.text}</li>
                                ))}
                            </>
                        ) : (
                            <li key={index}>{instruction.text}</li>
                        )}
                    </div>
                ))}
            </div>
        );
    };



    const formatDuration = (duration) => {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const match = duration.match(regex);

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        return `${hours > 0 ? hours + ' hours ' : ''}${minutes > 0 ? minutes + ' minutes ' : ''}${seconds > 0 ? seconds + ' seconds' : ''}`;
    };

    const RecipeDetails = ({ recipe }) => {
        // Get the last image URL
        const lastImage = recipe.image && recipe.image.length > 0 ? recipe.image[0] : '';
      
        return (
          <div>
            {/* ...other code */}
            {lastImage && <img src={lastImage} className='img-fluid' alt="Recipe" />}
            {/* ...other code */}
          </div>
        );
      };

      const htmlDecode = (input) => {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
      };
      

    return (
        <div>

            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand">Recipe Declutter</a>
                    <form className="d-flex" role="search">
                        <input placeholder="Paste a recipe URL" aria-label="Paste a recipe URL" className="form-control me-2" type="Search" id="urlInput" value={url} onChange={handleUrlChange} autoComplete="on" autoCorrect="on" />
                        <button className="btn btn-outline-success" type="button" onClick={fetchHtmlContent}>submit</button>
                    </form>
                </div>
            </nav>
            <div className='container'>


                <h1>{htmlContent?.name}</h1>
                <RecipeDetails recipe={htmlContent} />
                <p>{htmlContent?.description && htmlDecode(htmlContent?.description)}</p>
                <p>Serving: {htmlContent?.recipeYield?.map((recipeYield, index) => (
                    <li key={index}>{recipeYield}</li>
                ))}</p>

                <h2>Ingredients</h2>
                <ul>
                    {htmlContent?.recipeIngredient?.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <div className=''>
                    <h2>Directions</h2>
                    {htmlContent?.recipeInstructions && (
                        <ol> <RecipeInstructions instructions={htmlContent.recipeInstructions} /> </ol>
                    )}
                </div>
                <h2>Preparation Time</h2>
                <p>{htmlContent?.prepTime && formatDuration(htmlContent?.prepTime)}</p>

                <h2>Cooking Time</h2>
                <p>{htmlContent?.cookTime && formatDuration(htmlContent?.cookTime)}</p>

                <h2>Total Time</h2>
                <p>{htmlContent?.totalTime && formatDuration(htmlContent?.totalTime)}</p>

                From: <a target={htmlContent?.mainEntityOfPage}>{htmlContent?.mainEntityOfPage}</a>
            </div>
        </div>

    );
}

export default RecipeSummarizer;
