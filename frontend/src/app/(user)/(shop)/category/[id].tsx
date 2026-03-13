import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    Category,
    getProductPrimaryImage,
    Product,
    productService,
} from '@/services/product.service';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function CategoryScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
    const router = useRouter();

    const categoryId = Number(id);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(categoryId);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const currentCategoryName = useMemo(() => {
        const found = categories.find(c => c.id === selectedCategoryId);
        return found?.name ?? name ?? 'Danh mục';
    }, [categories, selectedCategoryId, name]);

    // Load categories for filter chips
    useEffect(() => {
        productService.getCategories().then(setCategories).catch(console.error);
    }, []);

    // Reset & load when selectedCategoryId changes
    useEffect(() => {
        setProducts([]);
        setPage(0);
        setHasMore(true);
        loadPage(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId]);

    const loadPage = useCallback(
        async (pageNum: number, reset = false) => {
            if (reset) setLoading(true);
            else setLoadingMore(true);
            try {
                const res = await productService.getProductsByCategory(selectedCategoryId, pageNum, 10);
                setProducts(prev => (reset ? res.content : [...prev, ...res.content]));
                setHasMore(!res.last);
                setPage(pageNum);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [selectedCategoryId],
    );

    const loadMore = () => {
        if (loadingMore || !hasMore) return;
        loadPage(page + 1);
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: getProductPrimaryImage(item) }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
                    <IconButton icon="heart-outline" size={18} iconColor="#888" style={{ margin: 0 }} />
                </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
                <Text numberOfLines={2} style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPrice}>{formatPrice(item.basePrice)}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View>
            {/* Result count */}
            <View style={styles.resultRow}>
                <View>
                    <Text style={styles.foundLabel}>Tìm thấy</Text>
                    <Text style={styles.foundCount}>
                        {loading ? '...' : `${products.length}${hasMore ? '+' : ''} kết quả`}
                    </Text>
                </View>
            </View>

            {/* Category filter chips */}
            {categories.length > 0 && (
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.filterList}
                    renderItem={({ item }) => {
                        const isActive = item.id === selectedCategoryId;
                        return (
                            <TouchableOpacity
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setSelectedCategoryId(item.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <IconButton icon="chevron-left" size={24} iconColor="#1E1E1E" style={{ margin: 0 }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{currentCategoryName}</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    renderItem={renderProduct}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Không có sản phẩm nào.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#1E1E1E',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    foundLabel: { fontSize: 14, color: '#999999' },
    foundCount: { fontSize: 22, fontWeight: '700', color: '#1E1E1E', marginTop: 2 },
    filterList: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    chipActive: {
        backgroundColor: '#1E1E1E',
        borderColor: '#1E1E1E',
    },
    chipText: { fontSize: 13, color: '#555555', fontWeight: '500' },
    chipTextActive: { color: '#FFFFFF' },
    listContent: { paddingHorizontal: 12, paddingBottom: 24 },
    row: { justifyContent: 'space-between', marginBottom: 16 },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    imageWrapper: { position: 'relative' },
    cardImage: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.2,
        backgroundColor: '#F5F5F5',
    },
    heartBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardBody: { padding: 12 },
    cardName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1E1E1E',
        lineHeight: 18,
        marginBottom: 6,
        height: 36,
    },
    cardPrice: { fontSize: 15, fontWeight: '700', color: '#1E1E1E' },
    emptyText: { textAlign: 'center', marginTop: 60, opacity: 0.5, fontSize: 15 },
});
