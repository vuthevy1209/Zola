import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './product.service';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const LIKED_PRODUCTS_KEY = '@zola_likes';

export const interactionService = {
    async getReviews(productId: string): Promise<Review[]> {
        await delay(600);
        // Mock reviews
        return [
            {
                id: 'r1', productId, userId: 'u1', userName: 'Người dùng Zola', rating: 5, comment: 'Sản phẩm tuyệt vời, đóng gói cẩn thận!', createdAt: new Date().toISOString()
            },
            {
                id: 'r2', productId, userId: 'u2', userName: 'Khách hàng ẩn danh', rating: 4, comment: 'Giao hàng nhanh, chất lượng ok so với tầm giá.', createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    },

    async addReview(productId: string, rating: number, comment: string): Promise<boolean> {
        await delay(800);
        // Mock logic to add review, award points
        return true;
    },

    async getFavorites(): Promise<Product[]> {
        try {
            const data = await AsyncStorage.getItem(LIKED_PRODUCTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    async toggleFavorite(product: Product): Promise<boolean> {
        try {
            let favorites = await this.getFavorites();
            const existing = favorites.find(p => p.id === product.id);
            let isLiked = false;

            if (existing) {
                favorites = favorites.filter(p => p.id !== product.id);
            } else {
                favorites.push(product);
                isLiked = true;
            }

            await AsyncStorage.setItem(LIKED_PRODUCTS_KEY, JSON.stringify(favorites));
            return isLiked;
        } catch (e) {
            console.error('Toggle favorite failed', e);
            return false;
        }
    },

    async checkIsFavorite(productId: string): Promise<boolean> {
        const favorites = await this.getFavorites();
        return favorites.some(p => p.id === productId);
    }
};
