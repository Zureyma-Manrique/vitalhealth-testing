import { initQuiz } from './quiz.js';
import { getElement, loadQuizResult } from './utils.js';
import { updateCartIcon } from './cart.js';
import { getProducts } from './productData.js';

async function init() {
    console.log("Vitality Guide App Initialized");
    
    // Load product catalog (confirm data is available)
    await getProducts();
    
    // Update cart count
    updateCartIcon();

    // Attach listener to Start Quiz Button
    const startButton = getElement('#start-quiz-btn');
    if (startButton) {
        startButton.addEventListener('click', () => {
            initQuiz();
        });
    }

    // Optional: Check for persistence (if savedResult exists, you would render the results page directly)
    const savedResult = loadQuizResult();
    if (savedResult) {
        console.log("Saved quiz result found. User can resume plan.", savedResult);
    }
}

init();