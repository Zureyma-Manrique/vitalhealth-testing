import { getElement, renderTemplate, saveQuizResult } from './utils.js';
import { getKeywordsForCategory, findProductsByCategory } from './productData.js';
import { getRecipes, getExercises } from './externalServices.js';
import * as cartModule from './cart.js'; 

// --- 10 QUESTIONS DATA ---
const QUIZ_STEPS = [
    {
        // Question 1: DETERMINES THE PRODUCT CATEGORY
        question: "What is your primary health goal right now?",
        options: [
            { text: "⚡ More Energy & Focus", category: "Energy" },
            { text: "🧘 Better Digestion/Gut Health", category: "Digestion" },
            { text: "🌿 Detox & Cleanse Body", category: "Detox" },
            { text: "💪 Build Muscle & Strength", category: "Strength" },
            { text: "🌙 Better Sleep & Recovery", category: "Restore" }
        ],
    },
    {
        question: "How would you describe your current activity level?",
        options: [
            { text: "Sedentary (Desk job, little exercise)" },
            { text: "Light Active (Walking, occasional yoga)" },
            { text: "Active (Gym 2-3x a week)" },
            { text: "Athlete (Training 5+ times a week)" }
        ],
    },
    {
        question: "How many hours of sleep do you get on average?",
        options: [
            { text: "Less than 5 hours" },
            { text: "5-6 hours" },
            { text: "7-8 hours (Optimal)" },
            { text: "9+ hours" }
        ],
    },
    {
        question: "How much water do you drink daily?",
        options: [
            { text: "Hardly any, mostly coffee/soda" },
            { text: "1-2 glasses" },
            { text: "3-5 glasses" },
            { text: "8+ glasses (Hydrated!)" }
        ],
    },
    {
        question: "What best describes your diet?",
        options: [
            { text: "Anything and everything" },
            { text: "Vegetarian / Vegan" },
            { text: "Keto / Low Carb" },
            { text: "Balanced / Whole Foods" }
        ],
    },
    {
        question: "How often do you feel stressed?",
        options: [
            { text: "Rarely, I'm pretty chill" },
            { text: "Sometimes, usually work-related" },
            { text: "Often, I feel overwhelmed" },
            { text: "Always, I need a break" }
        ],
    },
    {
        question: "Do you currently take any supplements?",
        options: [
            { text: "No, never" },
            { text: "Sometimes (Multivitamin)" },
            { text: "Yes, regularly" },
            { text: "Yes, I have a full stack" }
        ],
    },
    {
        question: "What is your biggest barrier to being healthy?",
        options: [
            { text: "Lack of Time" },
            { text: "Lack of Motivation" },
            { text: "Cost / Budget" },
            { text: "Don't know where to start" }
        ],
    },
    {
        question: "How is your energy level in the afternoon (2 PM - 4 PM)?",
        options: [
            { text: "High, keeps going" },
            { text: "Moderate" },
            { text: "Low, I need a nap" },
            { text: "Crashed completely" }
        ],
    },
    {
        question: "How committed are you to starting a new regimen?",
        options: [
            { text: "Just browsing" },
            { text: "Interested" },
            { text: "Ready to start today!" },
            { text: "100% All In" }
        ],
    }
];

let currentStep = 0;
let finalCategory = 'Energy'; // Default fallback

export function initQuiz() {
    currentStep = 0;
    renderQuizStep();
}

function renderQuizStep() {
    const app = getElement('#app');
    if (currentStep < QUIZ_STEPS.length) {
        const step = QUIZ_STEPS[currentStep];
        
        // Map options to buttons
        const optionsHtml = step.options.map((option) => {
            // Only add data-category if this option HAS a category (Question 1)
            const catAttr = option.category ? `data-category="${option.category}"` : '';
            return `<button class="quiz-option cta-button" ${catAttr}>${option.text}</button>`;
        }).join('');

        const quizHtml = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <h2>Vitality Finder Quiz</h2>
                    <p>Question ${currentStep + 1} of ${QUIZ_STEPS.length}</p>
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
    } else {
        // No more steps? Show results
        showResultsPage();
    }
}

function attachQuizListeners() {
    const optionsContainer = getElement('.quiz-options');
    if (optionsContainer) {
        optionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                // 1. Capture Category (Only from Question 1)
                if (e.target.dataset.category) {
                    finalCategory = e.target.dataset.category;
                    console.log("Category set to:", finalCategory);
                }

                // 2. Advance Quiz
                currentStep++;
                
                // 3. Check if done
                if (currentStep < QUIZ_STEPS.length) {
                    renderQuizStep();
                } else {
                    showResultsPage();
                }
            }
        });
    }
}


// --- RESULTS GENERATION ---

async function showResultsPage() {
    const app = getElement('#app');
    // Start Loading State
    renderTemplate(app, '<h2>Generating your personalized plan...</h2><p>Please wait while we coordinate your nutrition and activity data.</p>'); 
    
    const category = finalCategory;
    let recipes = { results: [] };
    let exercises = [];
    let recommendedProducts = [];

    try {
        // 1. Fetch Local Data and Keywords
        const [fetchedProducts, keywords] = await Promise.all([
            findProductsByCategory(category),
            getKeywordsForCategory(category)
        ]);
        
        recommendedProducts = fetchedProducts;

        // 2. Fetch External Data - Pass category to recipes for fallback
        const [fetchedRecipes, fetchedExercises] = await Promise.all([
            getRecipes(keywords.recipe, category),
            getExercises(keywords.exercise)
        ]);

        recipes = fetchedRecipes;
        exercises = fetchedExercises;

        // Save result
        saveQuizResult({ category, recommendedProducts });
        
    } catch (error) {
        console.error("Critical error during plan generation:", error);
        // If local data fails (e.g. products.json path is wrong), show error
        renderTemplate(app, '<h2>Error!</h2><p>We could not load the product data. Please ensure "products.json" is in the correct folder.</p>');
        return; 
    }
    
    renderResultsPage(category, recommendedProducts, recipes, exercises);
}

function renderResultsPage(category, products, recipeData, exerciseData) {
    const app = getElement('#app');
    
    // Products Grid
    const productListHtml = products.map(p => `
        <div class="product-card">
            <img src="${p.image_path}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>$${p.price.toFixed(2)}</p>
            <button class="add-to-cart-btn cta-button" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image_path}">Add to Cart</button>
        </div>
    `).join('');

    // Recipes
    const recipesHtml = recipeData && recipeData.results && recipeData.results.length > 0 
        ? recipeData.results.slice(0, 3).map(r => `
            <div class="card recipe-card">
                <img src="${r.image}" alt="${r.title}">
                <p class="card-title">${r.title}</p>
                <p class="card-description">Curated for ${category} goals.</p>
            </div>`).join('') 
        : '<p>Recipe recommendations are being loaded...</p>'; 

    // Exercises
    const exercisesHtml = exerciseData && Array.isArray(exerciseData) && exerciseData.length > 0 
        ? exerciseData.slice(0, 3).map(e => `
            <div class="card exercise-card">
                <p class="card-title">${e.name}</p>
                <p class="card-description">Type: ${e.type} | Muscle: ${e.muscle}</p>
            </div>`).join('') 
        : '<p>Exercise recommendations are being loaded...</p>'; 

    const resultsHtml = `
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
            alert(`${product.name} added to cart!`);
        });
    });
}