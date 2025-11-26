import { getRecipes, getExercises } from './externalServices.js';

// Week 1 Test: Check if APIs are working
console.log("Vitality Guide App Initialized");

// Test the connections (Check your browser console!)
// We simulate a user who got an "Energy" result
getRecipes("smoothie"); 
getExercises("cardio");