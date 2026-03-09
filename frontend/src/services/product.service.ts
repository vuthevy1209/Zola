const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Category {
    id: string;
    name: string;
    icon: string;
    image: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discountRate?: number;
    sold: number;
    rating: number;
    reviews: number;
    image: string;
    categoryId: string;
}

const mockCategories: Category[] = [
    { id: '1', name: 'Điện thoại', icon: 'cellphone', image: 'https://picsum.photos/id/1/200/200' },
    { id: '2', name: 'Laptop', icon: 'laptop', image: 'https://picsum.photos/id/2/200/200' },
    { id: '3', name: 'Đồng hồ', icon: 'watch', image: 'https://picsum.photos/id/3/200/200' },
    { id: '4', name: 'Tai nghe', icon: 'headphones', image: 'https://picsum.photos/id/4/200/200' },
    { id: '5', name: 'Phụ kiện', icon: 'cable-data', image: 'https://picsum.photos/id/5/200/200' },
    { id: '6', name: 'Tivi', icon: 'television', image: 'https://picsum.photos/id/6/200/200' },
];

// Generate 40 products
export const mockProducts: Product[] = Array.from({ length: 40 }).map((_, idx) => {
    const price = Math.floor(Math.random() * 20000000) + 1000000;
    const isDiscounted = Math.random() > 0.5;
    const discountRate = isDiscounted ? Math.floor(Math.random() * 50) + 5 : 0;

    return {
        id: `prod_${idx + 1}`,
        name: `Sản phẩm mẫu điện tử cao cấp ${idx + 1} chính hãng bảo hành 12 tháng`,
        price: price,
        originalPrice: isDiscounted ? Math.floor(price / (1 - discountRate / 100)) : undefined,
        discountRate: isDiscounted ? discountRate : undefined,
        sold: Math.floor(Math.random() * 5000),
        rating: (Math.random() * 2 + 3).toFixed(1) as any,
        reviews: Math.floor(Math.random() * 1000),
        image: `https://picsum.photos/id/${(idx % 50) + 10}/400/400`,
        categoryId: mockCategories[idx % mockCategories.length].id,
    }
}).sort((a, b) => (b.discountRate || 0) - (a.discountRate || 0)); // Sort by discount high to low as requested


export const productService = {
    async getCategories(): Promise<Category[]> {
        await delay(600);
        return mockCategories;
    },

    async getHotProducts(): Promise<Product[]> {
        await delay(800);
        // Return top 10 best selling
        return [...mockProducts].sort((a, b) => b.sold - a.sold).slice(0, 10);
    },

    async getProducts(page = 1, limit = 10, categoryId?: string): Promise<{ data: Product[], total: number }> {
        await delay(1000);
        let filtered = mockProducts;
        if (categoryId) {
            filtered = filtered.filter(p => p.categoryId === categoryId);
        }

        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            data: filtered.slice(start, end),
            total: filtered.length
        };
    },

    async getProductDetail(id: string): Promise<Product | null> {
        await delay(500);
        return mockProducts.find(p => p.id === id) || null;
    },

    async searchProducts(query: string): Promise<Product[]> {
        await delay(800);
        const lowerQuery = query.toLowerCase();
        return mockProducts.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }
};
