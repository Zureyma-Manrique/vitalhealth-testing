const CART_KEY = 'vitality-cart';

export function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartIcon();
}

export function updateCartIcon() {
    const cart = getCart();
    // Calculate total quantity of items
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

export function addToCart(product) {
    const cart = getCart();
    // Check if product already exists
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_path: product.image_path
        });
    }

    saveCart(cart);
}

// Initial update when the app loads
updateCartIcon();