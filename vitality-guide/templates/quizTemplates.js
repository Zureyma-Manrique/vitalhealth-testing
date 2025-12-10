export function getQuizStepTemplate(step, currentStep, totalSteps) {
    const optionsHtml = step.options.map((option) => {
        const catAttr = option.category ? `data-category="${option.category}"` : '';
        return `<button class="quiz-option cta-button" ${catAttr}>${option.text}</button>`;
    }).join('');

    return `
        <div class="quiz-container">
            <div class="quiz-header">
                <h2>Vitality Finder Quiz</h2>
                <p>Question ${currentStep + 1} of ${totalSteps}</p>
            </div>
            <div class="quiz-progress">
                <div class="quiz-progress-bar" style="width: ${((currentStep + 1) / totalSteps) * 100}%"></div>
            </div>
            <div class="quiz-question">
                <p>${step.question}</p>
            </div>
            <div class="quiz-options">
                ${optionsHtml}
            </div>
        </div>
    `;
}

export function getLoadingTemplate() {
    return '<h2>Generating your personalized plan...</h2><p>Please wait while we coordinate your nutrition and activity data.</p>';
}

export function getErrorTemplate() {
    return '<h2>Error!</h2><p>We could not load the product data. Please ensure "products.json" is in the correct folder.</p>';
}

export function getProductCardTemplate(product) {
    return `
        <div class="product-card">
            <img src="${product.image_path}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button class="add-to-cart-btn cta-button" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image_path}">Add to Cart</button>
        </div>
    `;
}

export function getRecipeCardTemplate(recipe, category) {
    return `
        <div class="card recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}">
            <p class="card-title">${recipe.title}</p>
            <p class="card-description">Curated for ${category} goals.</p>
        </div>
    `;
}

export function getExerciseCardTemplate(exercise) {
    return `
        <div class="card exercise-card">
            <p class="card-title">${exercise.name}</p>
            <p class="card-description">Type: ${exercise.type} | Muscle: ${exercise.muscle}</p>
        </div>
    `;
}

export function getResultsPageTemplate(category, productListHtml, recipesHtml, exercisesHtml) {
    return `
        <div class="results-container">
            <div class="results-header">
                <h2>Your Perfect Match</h2>
                <p>Based on your goal <strong>(${category})</strong>, here's your personalized wellness plan.</p>
            </div>
            
            <div class="results-grid">
                <div class="match-section product-recommendations">
                    <h3>Your Top Recommendations</h3>
                    <div class="product-list-grid">
                        ${productListHtml}
                    </div>
                </div>

                <div class="match-section nutrition-plan">
                    <h3>🍽️ Nutrition Plan - Eat This</h3>
                    <div class="recipes-grid">
                        ${recipesHtml}
                    </div>
                </div>

                <div class="match-section activity-plan">
                    <h3>🏃 Activity Plan - Do This</h3>
                    <div class="exercises-list">
                        ${exercisesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}