import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './product.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

const CART_KEY = '@zola_cart';

export const cartService = {
    async getCart(): Promise<CartItem[]> {
        try {
            const data = await AsyncStorage.getItem(CART_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    async addToCart(product: Product, quantity: number = 1): Promise<void> {
        try {
            const cart = await this.getCart();
            const existing = cart.find(item => item.product.id === product.id);

            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push({ product, quantity });
            }

            await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Add to cart failed', e);
        }
    },

    async updateQuantity(productId: string, quantity: number): Promise<void> {
        try {
            let cart = await this.getCart();
            const item = cart.find(i => i.product.id === productId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.product.id !== productId);
                }
                await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
            }
        } catch (e) {
            console.error('Update quantity failed', e);
        }
    },

    async removeFromCart(productId: string): Promise<void> {
        try {
            let cart = await this.getCart();
            cart = cart.filter(i => i.product.id !== productId);
            await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Remove from cart failed', e);
        }
    },

    async clearCart(): Promise<void> {
        try {
            await AsyncStorage.removeItem(CART_KEY);
        } catch (e) {
            console.error('Clear cart failed', e);
        }
    }
};
