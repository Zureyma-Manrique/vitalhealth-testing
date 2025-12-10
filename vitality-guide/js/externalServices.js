// Fallback data in case APIs fail
const FALLBACK_RECIPES = {
  Energy: [
    { id: 1, title: "Green Energy Smoothie", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop" },
    { id: 2, title: "Quinoa Power Bowl", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" },
    { id: 3, title: "Avocado Toast with Eggs", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop" }
  ],
  Digestion: [
    { id: 1, title: "Probiotic Yogurt Parfait", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop" },
    { id: 2, title: "Ginger Turmeric Tea", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop" },
    { id: 3, title: "Fiber-Rich Oatmeal", image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop" }
  ],
  Detox: [
    { id: 1, title: "Detox Green Juice", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop" },
    { id: 2, title: "Lemon Water Cleanse", image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400&h=300&fit=crop" },
    { id: 3, title: "Berry Antioxidant Smoothie", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop" }
  ],
  Strength: [
    { id: 1, title: "High-Protein Chicken Bowl", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" },
    { id: 2, title: "Post-Workout Protein Shake", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop" },
    { id: 3, title: "Salmon with Sweet Potato", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" }
  ],
  Restore: [
    { id: 1, title: "Chamomile Lavender Tea", image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop" },
    { id: 2, title: "Warm Golden Milk", image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop" },
    { id: 3, title: "Omega-3 Rich Salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop" }
  ]
};

const FALLBACK_EXERCISES = {
  hiit: [
    { name: "Burpees", type: "cardio", muscle: "full_body", difficulty: "intermediate" },
    { name: "High Knees", type: "cardio", muscle: "legs", difficulty: "beginner" },
    { name: "Mountain Climbers", type: "cardio", muscle: "core", difficulty: "intermediate" }
  ],
  walking: [
    { name: "Brisk Walking", type: "cardio", muscle: "legs", difficulty: "beginner" },
    { name: "Walking Lunges", type: "strength", muscle: "legs", difficulty: "beginner" },
    { name: "Power Walking Intervals", type: "cardio", muscle: "legs", difficulty: "beginner" }
  ],
  yoga: [
    { name: "Downward Dog", type: "stretching", muscle: "full_body", difficulty: "beginner" },
    { name: "Warrior Pose", type: "stretching", muscle: "legs", difficulty: "beginner" },
    { name: "Child's Pose", type: "stretching", muscle: "back", difficulty: "beginner" }
  ],
  weightlifting: [
    { name: "Bench Press", type: "strength", muscle: "chest", difficulty: "intermediate" },
    { name: "Squats", type: "strength", muscle: "legs", difficulty: "beginner" },
    { name: "Deadlifts", type: "strength", muscle: "back", difficulty: "intermediate" }
  ],
  cardio: [
    { name: "Jumping Jacks", type: "cardio", muscle: "full_body", difficulty: "beginner" },
    { name: "Running", type: "cardio", muscle: "legs", difficulty: "beginner" },
    { name: "Jump Rope", type: "cardio", muscle: "legs", difficulty: "intermediate" }
  ]
};

const RECIPE_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const EXERCISE_URL = 'https://api.api-ninjas.com/v1/exercises';

// IMPORTANT: Remove these from client-side code in production!
const SPOONACULAR_KEY = '3836092ca4ce4185b1067e447da390be';
const NINJA_KEY = 'yQdAKB2fLV7KW7y/m8B6GQ==yQiFLHiJAjys6My5';

// Helper function to get category for fallback
function getCategoryFromQuery(query) {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('citrus') || queryLower.includes('protein') || queryLower.includes('spinach')) return 'Energy';
    if (queryLower.includes('yogurt') || queryLower.includes('fiber')) return 'Digestion';
    if (queryLower.includes('green') || queryLower.includes('detox') || queryLower.includes('antioxidant')) return 'Detox';
    if (queryLower.includes('protein shake') || queryLower.includes('bone broth') || queryLower.includes('salmon')) return 'Strength';
    if (queryLower.includes('chamomile') || queryLower.includes('golden milk') || queryLower.includes('fish')) return 'Restore';
    return 'Energy';
}

export async function getRecipes(query, category = 'Energy') {
    try {
        const response = await fetch(
            `${RECIPE_URL}?apiKey=${SPOONACULAR_KEY}&query=${query}&number=3`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Recipe API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Success! Found recipes for "${query}":`, data);
        
        // Return API data if available
        if (data.results && data.results.length > 0) {
            return data;
        } else {
            throw new Error('No recipes found');
        }
    } catch (err) {
        console.error("Recipe Fetch Error:", err);
        console.log("Using fallback recipe data...");
        
        // Try to determine category from query if not provided
        const fallbackCategory = category || getCategoryFromQuery(query);
        
        // Return fallback data with proper structure
        return {
            results: FALLBACK_RECIPES[fallbackCategory] || FALLBACK_RECIPES.Energy
        };
    }
}

export async function getExercises(type) {
    try {
        const response = await fetch(
            `${EXERCISE_URL}?type=${type}`,
            {
                method: 'GET',
                headers: {
                    'X-Api-Key': NINJA_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Exercise API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Success! Found exercises for "${type}":`, data);
        
        // Return API data if available
        if (data && Array.isArray(data) && data.length > 0) {
            return data;
        } else {
            throw new Error('No exercises found');
        }
    } catch (err) {
        console.error("Exercise Fetch Error:", err);
        console.log("Using fallback exercise data...");
        
        // Return fallback data
        return FALLBACK_EXERCISES[type] || FALLBACK_EXERCISES.walking;
    }
}