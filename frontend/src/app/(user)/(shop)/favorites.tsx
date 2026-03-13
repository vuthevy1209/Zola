import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator, Appbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { favoriteService } from '@/services/favorite.service';
import { Product, getProductPrimaryImage } from '@/services/product.service';

export default function FavoritesScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const res = await favoriteService.getFavorites(0);
            setProducts(res.content);
        } catch (error) {
            console.error("Failed to load favorites:", error);
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
            <Image source={{ uri: getProductPrimaryImage(item) }} style={styles.resultImage} />
            <View style={styles.resultContent}>
                <Text numberOfLines={2} style={styles.resultTitle}>{item.name}</Text>
                <Text style={{ color: theme.colors.error, fontWeight: 'bold', marginTop: 4 }}>
                    {formatPrice(item.basePrice)}
                </Text>
                <View style={styles.statsContainer}>
                    <Text variant="labelSmall" style={{ opacity: 0.6 }}>⭐ {item.favoriteCount || 0}</Text>
                    <Text variant="labelSmall" style={{ opacity: 0.6 }}>{item.brand}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Sản phẩm yêu thích" />
            </Appbar.Header>

            {loading ? (
                <ActivityIndicator style={styles.loading} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    contentContainerStyle={products.length === 0 ? styles.emptyContainer : styles.listContent}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 40, opacity: 0.6 }}>
                            Chưa có sản phẩm yêu thích nào
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
