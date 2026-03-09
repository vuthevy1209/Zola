import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, ActivityIndicator, Appbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { interactionService } from '@/services/interaction.service';
import { Product } from '@/services/product.service';

export default function FavoritesScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        setLoading(true);
        const data = await interactionService.getFavorites();
        setFavorites(data);
        setLoading(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: theme.colors.outlineVariant }]}
            onPress={() => router.push(`/(tabs)/product/${item.id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <View style={styles.resultContent}>
                <Text numberOfLines={2} style={styles.resultTitle}>{item.name}</Text>
                <Text style={{ color: theme.colors.error, fontWeight: 'bold', marginTop: 4 }}>
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Sản phẩm yêu thích" />
            </Appbar.Header>

            {loading ? (
                <ActivityIndicator style={styles.loading} />
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    contentContainerStyle={favorites.length === 0 ? styles.emptyContainer : styles.listContent}
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
