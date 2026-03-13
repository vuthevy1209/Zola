import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { interactionService } from '@/services/interaction.service';
import { Product, getProductPrimaryImage } from '@/services/product.service';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 16;

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const res = await interactionService.getFavorites(0);
      setProducts(res.content);
      setHasMore(!res.last);
      setPage(0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await interactionService.getFavorites(nextPage);
      setProducts(prev => [...prev, ...res.content]);
      setPage(nextPage);
      setHasMore(!res.last);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: getProductPrimaryImage(item) }} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productContent}>
        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
        <Text style={styles.priceText}>{formatPrice(item.basePrice)}</Text>
        <Text numberOfLines={1} style={styles.statsText}>{item.brand}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={() => router.replace('/profile')}
          style={styles.backButton}
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>Sản phẩm yêu thích</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích nào</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginLeft: -8,
    marginRight: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: COLUMN_WIDTH,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    lineHeight: 20,
    height: 40,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  }
});
