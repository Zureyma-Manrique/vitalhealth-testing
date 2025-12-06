const baseURL = "./products.json";

// Fetches the full product catalog from the local JSON file.
export async function getProducts() {
    try {
        const response = await fetch(baseURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Finds the first 3 products matching the quiz result category.
export async function findProductsByCategory(category) {
    const products = await getProducts();
    // Return the first 3 products matching the category (since you require 3 recommendations)
    return products.filter(p => p.category === category).slice(0, 3);
}

// Finds the keywords for API calls (using the first product's keywords as the source).
export async function getKeywordsForCategory(category) {
    const recommendedProducts = await findProductsByCategory(category);
    // Use the keywords from the primary recommended product (the first one)
    if (recommendedProducts.length > 0) {
        return recommendedProducts[0].api_keywords;
    }
    // Fallback keywords for error handling
    return { recipe: 'healthy', exercise: 'wellness' }; 
}