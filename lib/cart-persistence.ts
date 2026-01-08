import { Product } from './types';

export interface CartItem extends Product {
  cartQuantity: number;
  customDiscount?: number;
}

/**
 * Load cart items from localStorage
 */
export function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
}

/**
 * Save cart items to localStorage
 */
export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCartFromStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('cart');
  } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
  }
}

/**
 * Get cart item count
 */
export function getCartCount(): number {
  const items = loadCartFromStorage();
  return items.reduce((sum, item) => sum + item.cartQuantity, 0);
}

/**
 * Add item to cart in localStorage
 */
export function addToCartStorage(product: Product): void {
  const items = loadCartFromStorage();
  const existingItem = items.find((item) => (item._id || item.id) === (product._id || product.id));

  if (existingItem) {
    existingItem.cartQuantity += 1;
  } else {
    items.push({ ...product, cartQuantity: 1 });
  }

  saveCartToStorage(items);
}

/**
 * Remove item from cart in localStorage
 */
export function removeFromCartStorage(productId: string): void {
  const items = loadCartFromStorage();
  const filtered = items.filter((item) => (item._id || item.id) !== productId);
  saveCartToStorage(filtered);
}

/**
 * Update item quantity in cart
 */
export function updateCartItemQuantity(productId: string, quantity: number): void {
  const items = loadCartFromStorage();
  const item = items.find((item) => (item._id || item.id) === productId);

  if (item) {
    if (quantity <= 0) {
      removeFromCartStorage(productId);
    } else {
      item.cartQuantity = quantity;
      saveCartToStorage(items);
    }
  }
}
