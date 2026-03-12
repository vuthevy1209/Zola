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
    icon?: string;
}

// TODO: replace with real API once backend supports category icons
export const mockCategories: Category[] = [
    { id: 1, name: 'Điện thoại', icon: 'cellphone' },
    { id: 2, name: 'Laptop', icon: 'laptop' },
    { id: 3, name: 'Đồng hồ', icon: 'watch' },
    { id: 4, name: 'Tai nghe', icon: 'headphones' },
    { id: 5, name: 'Phụ kiện', icon: 'cable-data' },
    { id: 6, name: 'Tivi', icon: 'television' },
    { id: 7, name: 'Áo Thun', icon: 'tshirt-crew' },
    { id: 8, name: 'Giày Dép', icon: 'shoe-heel' },
    { id: 9, name: 'Mũ', icon: 'hat-fedora' },
    { id: 10, name: 'Trang Sức', icon: 'diamond' },
];

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

const CATEGORY_ICONS: Record<string, string> = {
    'Áo Thun': 'tshirt-crew',
    'Áo Sơ Mi': 'shirt',
    'Quần': 'hanger',
    'Áo Khoác (Jackets)': 'coat-rack',
    'Giày Dép': 'shoe-heel',
    'Mũ': 'hat-fedora',
    'Trang Sức': 'diamond',
};

export const getCategoryIcon = (cat: Category): string =>
    cat.icon ?? CATEGORY_ICONS[cat.name] ?? 'tag';

export const getProductImage = (product: Product): string | undefined =>
    product.images?.find(img => img.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl;

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
}

export const productService = {
    getCategories(): Category[] {
        // TODO: switch to api.get('/categories') once backend supports icons
        return mockCategories;
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
