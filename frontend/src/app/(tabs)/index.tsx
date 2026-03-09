import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { productService, Category, Product } from '@/services/product.service';


const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 16;

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();


  const [categories, setCategories] = useState<Category[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [cats, hot, prods] = await Promise.all([
        productService.getCategories(),
        productService.getHotProducts(),
        productService.getProducts(1, 10)
      ]);
      setCategories(cats);
      setHotProducts(hot);
      setProducts(prods.data);
      if (prods.data.length >= prods.total) setHasMore(false);
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
      const res = await productService.getProducts(nextPage, 10);
      setProducts(prev => [...prev, ...res.data]);
      setPage(nextPage);
      if (products.length + res.data.length >= res.total) {
        setHasMore(false);
      }
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
      onPress={() => router.push(`/(tabs)/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productContent}>
        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
          {item.discountRate && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discountRate}%</Text>
            </View>
          )}
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>⭐ {item.rating}</Text>
          <Text style={styles.statsText}>Đã bán {item.sold}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* User Greeting */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
          Chào, {user?.firstName || 'Bạn'}! 👋
        </Text>
        <Text variant="bodyMedium" style={{ opacity: 0.6 }}>
          Hôm nay bạn muốn mua gì nào?
        </Text>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/search')}
        activeOpacity={0.8}
      >
        <IconButton icon="magnify" size={20} iconColor="#666" style={{ margin: 0, marginRight: 4 }} />
        <Text style={{ color: '#888', fontSize: 15 }}>Tìm kiếm sản phẩm...</Text>
      </TouchableOpacity>


      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Danh mục</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => { }}>
            <View style={[styles.categoryIconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
              <IconButton icon={cat.icon} iconColor={theme.colors.primary} size={28} />
            </View>
            <Text variant="bodySmall" style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 16 }} />
      </ScrollView>

      {/* Hot Products */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotProductsContainer}>
        {hotProducts.map((prod) => (
          <TouchableOpacity
            key={prod.id}
            style={styles.hotProductCard}
            onPress={() => router.push(`/(tabs)/product/${prod.id}`)}
          >
            <Image source={{ uri: prod.image }} style={styles.hotProductImage} />
            <Text numberOfLines={1} style={styles.hotProductName}>{prod.name}</Text>
            <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>{formatPrice(prod.price)}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 16 }} />
      </ScrollView>

      {/* All Products Grid Header */}
      <View style={[styles.sectionHeader, { marginTop: 16 }]}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Gợi ý cho bạn</Text>
      </View>
    </View>
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
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProductItem}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
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
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
  },
  hotProductsContainer: {
    paddingLeft: 16,
  },
  hotProductCard: {
    width: 140,
    marginRight: 16,
  },
  hotProductImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  hotProductName: {
    fontSize: 13,
    marginBottom: 4,
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
    height: 40, // 2 lines
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222', // Match cart dark sleek text, error color removed
  },
  discountBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: '#d32f2f',
    fontSize: 10,
    fontWeight: 'bold'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#888',
  }
});
