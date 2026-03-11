import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar, Text, useTheme, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { productService, Product, Category } from '@/services/product.service';

export default function SearchScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        productService.getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        handleSearch();
    }, [debouncedQuery, selectedCategory]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            let filtered = [];
            if (debouncedQuery.trim() === '') {
                // Just load some default products if query is empty
                const initial = await productService.getProducts(1, 20, selectedCategory || undefined);
                filtered = initial.data;
            } else {
                filtered = await productService.searchProducts(debouncedQuery);
                if (selectedCategory) {
                    filtered = filtered.filter((p) => p.categoryId === selectedCategory);
                }
            }
            setResults(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: theme.colors.outlineVariant }]}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <View style={styles.resultContent}>
                <Text numberOfLines={2} style={styles.resultTitle}>{item.name}</Text>
                <Text style={{ color: '#222', fontWeight: 'bold', marginTop: 4, fontSize: 16 }}>
                    {formatPrice(item.price)}
                </Text>
                <View style={styles.statsContainer}>
                    <Text variant="labelSmall" style={{ opacity: 0.6 }}>⭐ {item.rating}</Text>
                    <Text variant="labelSmall" style={{ opacity: 0.6 }}>Đã bán {item.sold}</Text>
                </View>
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
                        value={searchQuery}
                        style={styles.searchInput}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <IconButton
                            icon="close-circle"
                            size={18}
                            iconColor="#ccc"
                            onPress={() => setSearchQuery('')}
                            style={{ margin: 0 }}
                        />
                    )}
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[{ id: 'all', name: 'Tất cả' }, ...categories]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isSelected = item.id === 'all' ? selectedCategory === null : selectedCategory === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.elevation.level2,
                                        borderColor: theme.colors.primary,
                                    }
                                ]}
                                onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
                            >
                                <Text style={{ color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface }}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Results */}
            {loading ? (
                <ActivityIndicator style={styles.loading} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContent}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 40, opacity: 0.6 }}>
                            Không tìm thấy sản phẩm nào
                        </Text>
                    }
                />
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
    emptyContainer: {
        flexGrow: 1,
    },
    resultItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
    },
    resultImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    resultContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    resultTitle: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        width: 140,
    }
});
