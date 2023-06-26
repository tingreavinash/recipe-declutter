import React, { useState } from 'react';
import cheerio from 'cheerio';

function RecipeSummarizer() {
    const [url, setUrl] = useState('');
    const [htmlContent, setHtmlContent] = useState('');

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const fetchHtmlContent = async () => {
        try {
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
            console.log(recipeObject);

            setHtmlContent(recipeObject);

        } catch (error) {
            console.error('Error fetching HTML content:', error);
        }
    };



    const RecipeStep = ({ step, key }) => {
        return (
            <p>{step.text}</p>
        );
    };

    const RecipeInstructions = ({ instructions }) => {
        console.log(instructions);
        return (
            <div>
                {instructions.map((section, index) => (
                    <div key={index}>
                        <h2>{section.name}</h2>
                        <ol>
                            {section.itemListElement.map((step, i) => (
                                <li><RecipeStep key={i} step={step} /></li>
                            ))}
                        </ol>
                    </div>
                ))}
            </div>
        );
    };


    return (
        <div>

            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand">Recipe Declutter</a>
                    <form className="d-flex" role="search">
                        <input placeholder="Paste a recipe URL" ariaLabel="Paste a recipe URL" className="form-control me-2" type="Search" id="urlInput" value={url} onChange={handleUrlChange} autocomplete="on" autocorrect="on" />
                        <button className="btn btn-outline-success" type="submit" onClick={fetchHtmlContent}>submit</button>
                    </form>
                </div>
            </nav>
            <div className='container'>


                <h1>{htmlContent?.name}</h1>
                <p>{htmlContent?.description}</p>
                <p>Serving: {htmlContent?.recipeYield}</p>

                <h2>Ingredients</h2>
                <ul>
                    {htmlContent?.recipeIngredient?.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <div className=''>
                    <h2>Directions</h2>
                    {htmlContent?.recipeInstructions && (
                        <RecipeInstructions instructions={htmlContent.recipeInstructions} />
                    )}
                </div>
            </div>
        </div>

    );
}

export default RecipeSummarizer;
