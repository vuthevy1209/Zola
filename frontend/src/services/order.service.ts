import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './cart.service';

import { mockProducts } from './product.service';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    createdAt: string; // ISO String
}

const ORDERS_KEY = '@zola_orders';

export const orderService = {
    async getOrderHistory(): Promise<Order[]> {
        try {
            const data = await AsyncStorage.getItem(ORDERS_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.length > 0) return parsed;
            }

            // Generate initial mock orders if empty
            const statuses: OrderStatus[] = ['NEW', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
            const mockOrders: Order[] = statuses.map((status, index) => {
                const product1 = mockProducts[index % mockProducts.length];
                const product2 = mockProducts[(index + 1) % mockProducts.length];

                const items: CartItem[] = [
                    { product: product1, quantity: 1 },
                    { product: product2, quantity: 2 }
                ];

                const total = (product1.price * 1) + (product2.price * 2);

                return {
                    id: `MOCK_ORD_${status}_${Date.now()}`,
                    items,
                    total,
                    status,
                    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString() // Fake different days
                };
            });

            await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
            return mockOrders;

        } catch {
            return [];
        }
    },

    async createOrder(items: CartItem[], total: number): Promise<Order> {
        await delay(1000);
        const newOrder: Order = {
            id: `ORD_${Date.now()}`,
            items,
            total,
            status: 'NEW',
            createdAt: new Date().toISOString()
        };

        try {
            const orders = await this.getOrderHistory();
            orders.unshift(newOrder); // add to top
            await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            return newOrder;
        } catch (e) {
            console.error('Save order failed', e);
            throw e;
        }
    },

    async getOrderById(id: string): Promise<Order | null> {
        const orders = await this.getOrderHistory();
        return orders.find(o => o.id === id) || null;
    },

    async cancelOrder(id: string): Promise<void> {
        await delay(800);
        try {
            const orders = await this.getOrderHistory();
            const orderIndex = orders.findIndex(o => o.id === id);

            if (orderIndex >= 0) {
                const order = orders[orderIndex];
                const createdAt = new Date(order.createdAt).getTime();
                const now = Date.now();
                const minutesDiff = (now - createdAt) / 1000 / 60;

                if (minutesDiff > 30) {
                    throw new Error('Chỉ được hủy đơn trong vòng 30 phút sau khi đặt');
                }

                orders[orderIndex].status = 'CANCELLED';
                await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            } else {
                throw new Error('Order not found');
            }
        } catch (e) {
            throw e;
        }
    }
};
