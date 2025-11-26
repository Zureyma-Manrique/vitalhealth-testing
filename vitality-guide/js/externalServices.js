// Base URLs
const RECIPE_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const EXERCISE_URL = 'https://api.api-ninjas.com/v1/exercises';

// REPLACE THESE WITH YOUR ACTUAL KEYS
const SPOONACULAR_KEY = 'YOUR_SPOONACULAR_KEY_HERE';
const NINJA_KEY = 'YOUR_NINJA_KEY_HERE';

export async function getRecipes(query) {
    try {
        // Fetch 3 recipes based on query [cite: 17]
        const response = await fetch(`${RECIPE_URL}?apiKey=${SPOONACULAR_KEY}&query=${query}&number=3`);
        const data = await response.json();
        console.log(`Success! Found recipes for "${query}":`, data);
        return data;
    } catch (err) {
        console.error("Recipe Fetch Error:", err);
    }
}

export async function getExercises(type) {
    try {
        // Fetch exercises based on type [cite: 18]
        const response = await fetch(`${EXERCISE_URL}?type=${type}`, {
            headers: { 'X-Api-Key': NINJA_KEY }
        });
        const data = await response.json();
        console.log(`Success! Found exercises for "${type}":`, data);
        return data;
    } catch (err) {
        console.error("Exercise Fetch Error:", err);
    }
}