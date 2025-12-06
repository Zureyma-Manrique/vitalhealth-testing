// File: js/quiz.js

import { getElement, renderTemplate, saveQuizResult } from './utils.js';
import { getKeywordsForCategory, findProductsByCategory } from './productData.js';
import { getRecipes, getExercises } from './externalServices.js';
import * as cartModule from './cart.js'; // Import cart functionality

// The quiz questions and mapping (based on your product categories)
const QUIZ_STEPS = [
    {
        question: "What's your primary health goal?",
        options: [
            { text: "More Energy", category: "Energy" },
            { text: "Better Digestion", category: "Digestion" },
            { text: "Detox & Cleanse", category: "Detox" },
            { text: "Build Strength", category: "Strength" },
            { text: "Restore & Rest", category: "Restore" }
        ],
    },
    // Add more steps here for a more complex quiz (e.g., secondary concerns)
];

let currentStep = 0;
let finalCategory = '';

export function initQuiz() {
    currentStep = 0;
    renderQuizStep();
}

function renderQuizStep() {
    const app = getElement('#app');
    if (currentStep < QUIZ_STEPS.length) {
        const step = QUIZ_STEPS[currentStep];
        const optionsHtml = step.options.map((option) => `
            <button class="quiz-option cta-button" data-category="${option.category}">${option.text}</button>
        `).join('');

        const quizHtml = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <h2>VitalityGuide - Quiz</h2>
                </div>
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${((currentStep + 1) / QUIZ_STEPS.length) * 100}%"></div>
                </div>
                <div class="quiz-question">
                    <p>${step.question}</p>
                </div>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
            </div>
        `;
        renderTemplate(app, quizHtml);
        attachQuizListeners();
    }
}

function attachQuizListeners() {
    getElement('.quiz-options').addEventListener('click', (e) => {
        if (e.target.classList.contains('quiz-option')) {
            finalCategory = e.target.dataset.category;
            currentStep++;
            showResultsPage(); // Go straight to results since we only have one step
        }
    });
}


async function showResultsPage() {
    const app = getElement('#app');
    // Start Loading State
    renderTemplate(app, '<h2>Generating your personalized plan...</h2><p>Please wait while we coordinate your nutrition and activity data.</p>'); 
    
    const category = finalCategory;
    let recipes = { results: [] }; // Initialize variables to ensure they exist
    let exercises = [];
    let recommendedProducts = [];

    try {
        // 1. Fetch Local Data and Keywords
        const [fetchedProducts, keywords] = await Promise.all([
            findProductsByCategory(category),
            getKeywordsForCategory(category)
        ]);
        
        recommendedProducts = fetchedProducts;

        // 2. Fetch External Data (The part that is currently failing)
        // Use Promise.all with .catch() on individual calls to prevent the whole function from halting 
        // if one API key is invalid or rate-limited (Asynchronous Data Coordination).
        
        const [fetchedRecipes, fetchedExercises] = await Promise.all([
            getRecipes(keywords.recipe).catch(err => {
                console.error("External Recipe Fetch Failed:", err);
                return { results: [] }; // Return empty structure on failure
            }),
            getExercises(keywords.exercise).catch(err => {
                console.error("External Exercise Fetch Failed:", err);
                return []; // Return empty array on failure
            })
        ]);

        recipes = fetchedRecipes;
        exercises = fetchedExercises;

        // Save result for LocalStorage Persistence
        saveQuizResult({ category, recommendedProducts });
        
    } catch (error) {
        // This catch block handles errors in local data loading or critical JS failures
        console.error("Critical error during plan generation:", error);
        // Fallback: If local data fails, render only the error message
        renderTemplate(app, '<h2>Error!</h2><p>We could not load the product data to generate your plan. Please check the console.</p>');
        return; // Stop execution
    }
    
    renderResultsPage(category, recommendedProducts, recipes, exercises);
}


function renderResultsPage(category, products, recipeData, exerciseData) {
    const app = getElement('#app');
    
    // Products Grid (3 Recommendations)
    const productListHtml = products.map(p => `
        <div class="product-card">
            <img src="${p.image_path}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>$${p.price.toFixed(2)}</p>
            <button class="add-to-cart-btn cta-button" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image_path}">Add to Cart</button>
        </div>
    `).join('');

    // Recipes (Error handling for API failures)
    const recipesHtml = recipeData && recipeData.results ? recipeData.results.slice(0, 3).map(r => `
        <div class="card recipe-card">
            <img src="${r.image}" alt="${r.title}">
            <p class="card-title">${r.title}</p>
            <p class="card-description">Curated for ${category} goals.</p>
        </div>
    `).join('') : '<p>We are temporarily unable to fetch recipes. Please visit our Nutrition Blog for advice!</p>'; 

    // Exercises (Error handling for API failures)
    const exercisesHtml = exerciseData && Array.isArray(exerciseData) && exerciseData.length > 0 ? exerciseData.slice(0, 3).map(e => `
        <div class="card exercise-card">
            <p class="card-title">${e.name} (${e.type})</p>
            <p class="card-description">Focus: ${e.muscle}</p>
        </div>
    `).join('') : '<p>We are temporarily unable to fetch exercises. Try a basic walking routine today!</p>'; 

    const resultsHtml = `
        <div class="results-container">
            <div class="results-header">
                <h2>Your Perfect Match</h2>
                <p>Based on your goal (${category}), here's your personalized wellness plan.</p>
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

    renderTemplate(app, resultsHtml);
    attachAddToCartListeners();
}


function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const data = e.target.dataset;
            const product = {
                id: data.id,
                name: data.name,
                price: parseFloat(data.price),
                image_path: data.image
            };
            cartModule.addToCart(product);
            alert(`${product.name} added to cart! Total items: ${cartModule.getCart().length}`); // Simple UX feedback
        });
    });
}