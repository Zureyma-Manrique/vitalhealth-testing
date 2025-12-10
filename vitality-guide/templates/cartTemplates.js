export function getEmptyCartTemplate() {
    return `
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
}

export function getCartItemTemplate(item) {
    return `
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
    `;
}

export function getCartPageTemplate(cartItemsHtml, total) {
    return `
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
}