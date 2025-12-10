import { getElement, renderTemplate, saveQuizResult } from './utils.js';
import { getKeywordsForCategory, findProductsByCategory } from './productData.js';
import { getRecipes, getExercises } from './externalServices.js';
import * as cartModule from './cart.js';
import { 
    getQuizStepTemplate, 
    getLoadingTemplate, 
    getErrorTemplate,
    getProductCardTemplate,
    getRecipeCardTemplate,
    getExerciseCardTemplate,
    getResultsPageTemplate
} from '../templates/quizTemplates.js';

const QUIZ_STEPS = [
    {
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
let finalCategory = 'Energy';

export function initQuiz() {
    currentStep = 0;
    renderQuizStep();
}

function renderQuizStep() {
    const app = getElement('#app');
    if (currentStep < QUIZ_STEPS.length) {
        const step = QUIZ_STEPS[currentStep];
        const quizHtml = getQuizStepTemplate(step, currentStep, QUIZ_STEPS.length);
        renderTemplate(app, quizHtml);
        attachQuizListeners();
    } else {
        showResultsPage();
    }
}

function attachQuizListeners() {
    const optionsContainer = getElement('.quiz-options');
    if (optionsContainer) {
        optionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-option')) {
                if (e.target.dataset.category) {
                    finalCategory = e.target.dataset.category;
                    console.log("Category set to:", finalCategory);
                }

                currentStep++;
                
                if (currentStep < QUIZ_STEPS.length) {
                    renderQuizStep();
                } else {
                    showResultsPage();
                }
            }
        });
    }
}

async function showResultsPage() {
    const app = getElement('#app');
    renderTemplate(app, getLoadingTemplate()); 
    
    const category = finalCategory;
    let recipes = { results: [] };
    let exercises = [];
    let recommendedProducts = [];

    try {
        const [fetchedProducts, keywords] = await Promise.all([
            findProductsByCategory(category),
            getKeywordsForCategory(category)
        ]);
        
        recommendedProducts = fetchedProducts;

        const [fetchedRecipes, fetchedExercises] = await Promise.all([
            getRecipes(keywords.recipe, category).catch(err => {
                console.error("External Recipe Fetch Failed:", err);
                return { results: [] }; 
            }),
            getExercises(keywords.exercise).catch(err => {
                console.error("External Exercise Fetch Failed:", err);
                return []; 
            })
        ]);

        recipes = fetchedRecipes;
        exercises = fetchedExercises;

        saveQuizResult({ category, recommendedProducts });
        
    } catch (error) {
        console.error("Critical error during plan generation:", error);
        renderTemplate(app, getErrorTemplate());
        return; 
    }
    
    renderResultsPage(category, recommendedProducts, recipes, exercises);
}

function renderResultsPage(category, products, recipeData, exerciseData) {
    const app = getElement('#app');
    
    const productListHtml = products.map(p => getProductCardTemplate(p)).join('');

    const recipesHtml = recipeData && recipeData.results && recipeData.results.length > 0 
        ? recipeData.results.slice(0, 3).map(r => getRecipeCardTemplate(r, category)).join('') 
        : '<p>Recipe recommendations are being loaded...</p>'; 

    const exercisesHtml = exerciseData && Array.isArray(exerciseData) && exerciseData.length > 0 
        ? exerciseData.slice(0, 3).map(e => getExerciseCardTemplate(e)).join('') 
        : '<p>Exercise recommendations are being loaded...</p>'; 

    const resultsHtml = getResultsPageTemplate(category, productListHtml, recipesHtml, exercisesHtml);

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