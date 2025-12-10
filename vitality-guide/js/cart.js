import { getElement, renderTemplate } from './utils.js';

const CART_STORAGE_KEY = 'vitality-cart';

export function getCart() {
    const cartData = {};
    let i = 0;
    
    // Read from memory storage
    while (true) {
        const key = `${CART_STORAGE_KEY}-${i}`;
        const item = sessionStorage.getItem(key);
        if (!item) break;
        const product = JSON.parse(item);
        cartData[product.id] = product;
        i++;
    }
    
    return Object.values(cartData);
}

function saveCart(cart) {
    // Clear existing cart items
    let i = 0;
    while (sessionStorage.getItem(`${CART_STORAGE_KEY}-${i}`)) {
        sessionStorage.removeItem(`${CART_STORAGE_KEY}-${i}`);
        i++;
    }
    
    // Save new cart items
    cart.forEach((item, index) => {
        sessionStorage.setItem(`${CART_STORAGE_KEY}-${index}`, JSON.stringify(item));
    });
    
    updateCartIcon();
}

export function updateCartIcon() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

export function addToCart(product) {
    const cart = getCart();
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

export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

export function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

export function clearCart() {
    let i = 0;
    while (sessionStorage.getItem(`${CART_STORAGE_KEY}-${i}`)) {
        sessionStorage.removeItem(`${CART_STORAGE_KEY}-${i}`);
        i++;
    }
    updateCartIcon();
}

export function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function showCartPage() {
    const app = getElement('#app');
    const cart = getCart();
    
    if (cart.length === 0) {
        const emptyCartHtml = `
            <div class="cart-container">
                <div class="cart-header">
                    <h2>Shopping Cart</h2>
                </div>
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <button id="continue-shopping" class="cta-button">Start Shopping</button>
                </div>
            </div>
        `;
        renderTemplate(app, emptyCartHtml);
        
        document.getElementById('continue-shopping').addEventListener('click', () => {
            location.reload();
        });
        return;
    }
    
    const cartItemsHtml = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image_path}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn decrease" data-id="${item.id}">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="qty-btn increase" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-subtotal">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-btn" data-id="${item.id}">✕</button>
        </div>
    `).join('');
    
    const total = getCartTotal();
    
    const cartHtml = `
        <div class="cart-container">
            <div class="cart-header">
                <h2>Shopping Cart</h2>
                <button id="continue-shopping" class="secondary-btn">Continue Shopping</button>
            </div>
            
            <div class="cart-content">
                <div class="cart-items">
                    ${cartItemsHtml}
                </div>
                
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <button id="checkout-btn" class="cta-button">Proceed to Checkout</button>
                    <button id="clear-cart-btn" class="danger-btn">Clear Cart</button>
                </div>
            </div>
        </div>
    `;
    
    renderTemplate(app, cartHtml);
    attachCartListeners();
}

function attachCartListeners() {
    // Continue Shopping
    const continueBtn = document.getElementById('continue-shopping');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            location.reload();
        });
    }
    
    // Increase quantity
    document.querySelectorAll('.qty-btn.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const cart = getCart();
            const item = cart.find(i => i.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity + 1);
                showCartPage();
            }
        });
    });
    
    // Decrease quantity
    document.querySelectorAll('.qty-btn.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const cart = getCart();
            const item = cart.find(i => i.id === productId);
            if (item && item.quantity > 1) {
                updateQuantity(productId, item.quantity - 1);
                showCartPage();
            }
        });
    });
    
    // Remove item
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            if (confirm('Remove this item from cart?')) {
                removeFromCart(productId);
                showCartPage();
            }
        });
    });
    
    // Clear cart
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
                showCartPage();
            }
        });
    }
    
    // Checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Checkout functionality coming soon! Total: $' + getCartTotal().toFixed(2));
        });
    }
}

// Initial update when the app loads
updateCartIcon();