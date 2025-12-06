// Function to simplify element selection
export function getElement(selector) {
    return document.querySelector(selector);
}

// Function to render HTML from a template string
export function renderTemplate(parent, html, clear = true) {
    if (clear) {
        parent.innerHTML = '';
    }
    parent.insertAdjacentHTML('beforeend', html);
}

// --- LocalStorage Management (My Regimen Persistence) ---
const QUIZ_KEY = 'vitality-quiz-result';

export function saveQuizResult(result) {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(result));
}

export function loadQuizResult() {
    const result = localStorage.getItem(QUIZ_KEY);
    return result ? JSON.parse(result) : null;
}