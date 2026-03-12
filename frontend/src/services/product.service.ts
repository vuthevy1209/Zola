import api from './api';

export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
}



export interface ProductVariant {
    id: number;
    size?: { id: number; name: string };
    color?: { id: number; name: string; hexCode: string };
    stockQuantity: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    status: string;
    brand: string;
    category: Category;
    images: ProductImage[];
    variants: ProductVariant[];
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
}

export const getProductPrimaryImage = (product: Product): string | undefined =>
    product.images?.find(img => img.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl;

export const productService = {
    async getCategories(): Promise<Category[]> {
        const response = await api.get('/categories');
        return response.data.result;
    },

    async getProducts(page = 0, size = 10): Promise<PagedResponse<Product>> {
        const response = await api.get('/products', { params: { page, size } });
        return response.data.result;
    },

    async getProductById(id: string): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return response.data.result;
    },
};
