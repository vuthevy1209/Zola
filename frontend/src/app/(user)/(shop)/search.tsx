import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar, Text, useTheme, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { productService, Product, Category, SearchHistory, SearchFilters, getProductPrimaryImage } from '@/services/product.service';
import FilterModal, { FilterState } from '@/components/filter-modal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 16;

export default function SearchScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [history, setHistory] = useState<SearchHistory[]>([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        minPrice: '', maxPrice: '', colors: [], rating: null, category: null, discounts: []
    });
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        productService.getCategories().then(setCategories);
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await productService.getSearchHistory();
            setHistory(res);
        } catch(e) {}
    };

    const handleDeleteHistory = async (id: number) => {
        try {
            await productService.deleteSearchHistory(id);
            fetchHistory();
        } catch (e) {}
    };

    const handleClearHistory = async () => {
        try {
            await productService.clearSearchHistory();
            fetchHistory();
        } catch (e) {}
    };

    const doSearch = (query: string, f: FilterState = filters, pageNumber = 0, append = false) => {
        loadProducts(query, f, pageNumber, append);
    };

    const loadProducts = async (query: string, f: FilterState, pageNumber: number, append: boolean = false) => {
        if (pageNumber === 0) {
            setLoading(true);
            setHasSearched(true);
        }
        try {
            const searchPayload: SearchFilters = {
                keyword: query.trim() !== '' ? query.trim() : undefined,
                categoryId: f.category ?? undefined,
                minPrice: f.minPrice ? Number(f.minPrice) : undefined,
                maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined,
                page: pageNumber,
                size: 20
            };

            const initial = await productService.searchProducts(searchPayload);

            if (pageNumber === 0 && query.trim() !== '') {
                fetchHistory();
            }

            const newContent = initial?.content || (initial as any)?.data || [];
            if (append) {
                setResults(prev => [...prev, ...newContent]);
            } else {
                setResults(newContent);
            }
            setHasMore(newContent.length > 0 && !initial?.last);
            setPage(pageNumber);
        } catch (e) {
            console.error(e);
        } finally {
            if (pageNumber === 0) setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image 
                source={{ uri: getProductPrimaryImage(item) || 'https://via.placeholder.com/80' }} 
                style={styles.cardImage} 
                resizeMode="cover" 
            />
            <View style={styles.cardBody}>
                <Text numberOfLines={2} style={styles.cardName}>{item.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.cardPrice}>{formatPrice(item.basePrice)}</Text>
                </View>
                <Text numberOfLines={1} style={styles.statsText}>{item.brand}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <IconButton icon="arrow-left" iconColor="#1E1E1E" onPress={() => router.back()} style={{ marginLeft: 8 }} />
                <View style={styles.searchBarContainer}>
                    <IconButton icon="magnify" size={20} iconColor="#666" style={{ margin: 0, marginRight: 4 }} />
                    <TextInput
                        placeholder="Tìm kiếm sản phẩm..."
                        placeholderTextColor="#888"
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => {
                            if (searchQuery.trim() === '') return;
                            setSubmittedQuery(searchQuery);
                            setIsInputFocused(false);
                            doSearch(searchQuery);
                        }}
                        returnKeyType="search"
                        value={searchQuery}
                        style={styles.searchInput}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <IconButton
                            icon="close-circle"
                            size={18}
                            iconColor="#ccc"
                            onPress={() => {
                                setSearchQuery('');
                                setSubmittedQuery('');
                                setResults([]);
                                setHasSearched(false);
                            }}
                            style={{ margin: 0 }}
                        />
                    )}
                </View>
                {isInputFocused ? (
                    <IconButton 
                        icon="magnify"
                        onPress={() => {
                            if (searchQuery.trim() === '') return;
                            setSubmittedQuery(searchQuery);
                            setIsInputFocused(false);
                            doSearch(searchQuery);
                        }}
                    />
                ) : (
                    <IconButton icon="tune-variant" onPress={() => setFilterVisible(true)} />
                )}
            </View>

            <FilterModal 
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                initialFilters={filters}
                categories={categories}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setFilterVisible(false);
                    doSearch(submittedQuery, newFilters);
                }}
            />

            {!hasSearched ? (
                <View style={{ flex: 1, padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#666' }}>Recent Searches</Text>
                        <IconButton icon="delete-outline" iconColor="#666" size={20} onPress={handleClearHistory} />
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {history.map(item => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={styles.historyChip}
                                onPress={() => {
                                    setSearchQuery(item.keyword);
                                    setSubmittedQuery(item.keyword);
                                    doSearch(item.keyword);
                                }}
                            >
                                <Text style={{ color: '#444' }}>{item.keyword}</Text>
                                <IconButton 
                                    icon="close" 
                                    size={14} 
                                    iconColor="#888" 
                                    style={{ margin: 0, marginLeft: 4, width: 16, height: 16 }} 
                                    onPress={() => handleDeleteHistory(item.id)} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                <>
                    {/* Filters */}
            <View style={{ height: 12 }} />

            {/* Results */}
            {loading ? (
                <ActivityIndicator style={styles.loading} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    numColumns={2}
                    renderItem={renderProduct}
                    columnWrapperStyle={styles.row}
                    onEndReached={() => {
                        if (hasMore && !loading) {
                            loadProducts(submittedQuery, filters, page + 1, true);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContent}
                    ListFooterComponent={hasMore && page > 0 ? <ActivityIndicator style={{ margin: 16 }} /> : null}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 40, opacity: 0.6 }}>
                            Không tìm thấy sản phẩm nào
                        </Text>
                    }
                />
            )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20,
        paddingTop: 8,
        paddingBottom: 12,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        minHeight: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E1E1E',
        padding: 0,
    },
    filterContainer: {
        paddingLeft: 16,
        paddingBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        borderWidth: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    listContent: {
        paddingBottom: 24,
    },
    row: {
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    emptyContainer: {
        flexGrow: 1,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: CARD_WIDTH,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    cardBody: {
        padding: 12,
    },
    cardName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#222',
        lineHeight: 20,
        height: 40, // 2 lines
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },
    statsText: {
        fontSize: 12,
        color: '#888',
    },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 6,
    }
});
