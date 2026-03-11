import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, FAB, Searchbar, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { adminProductService } from '@/services/admin.service';
import { Product } from '@/services/product.service';

export default function AdminProducts() {
    const theme = useTheme();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');

    useFocusEffect(useCallback(() => {
        setProducts(adminProductService.getAll());
    }, []));

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Xóa sản phẩm',
            `Bạn có chắc muốn xóa "${name.slice(0, 40)}..."?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive',
                    onPress: () => {
                        adminProductService.delete(id);
                        setProducts(adminProductService.getAll());
                    }
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.img} />
            <View style={styles.info}>
                <Text variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '600' }}>{item.name}</Text>
                <Text variant="bodySmall" style={{ color: '#528F72', marginTop: 2 }}>
                    {item.price.toLocaleString('vi-VN')}đ
                </Text>
                <View style={styles.meta}>
                    <Chip compact icon="tag-outline" style={styles.chip} textStyle={{ fontSize: 11 }}>
                        {adminProductService.getCategories().find(c => c.id === item.categoryId)?.name ?? '—'}
                    </Chip>
                    <Text variant="bodySmall" style={{ color: '#888' }}>Đã bán: {item.sold}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <IconButton
                    icon="pencil-outline"
                    size={20}
                    onPress={() => router.push({ pathname: '/(admin)/product-form', params: { id: item.id } })}
                />
                <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor="#EF4444"
                    onPress={() => handleDelete(item.id, item.name)}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text variant="headlineSmall" style={styles.title}>Sản phẩm</Text>
                <Searchbar
                    placeholder="Tìm kiếm sản phẩm..."
                    value={search}
                    onChangeText={setSearch}
                    style={styles.search}
                />
                <Text variant="bodySmall" style={styles.count}>{filtered.length} sản phẩm</Text>
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#fff"
                onPress={() => router.push('/(admin)/product-form')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAFAFA' },
    container: { flex: 1, padding: 16 },
    title: { fontWeight: 'bold', marginBottom: 12 },
    search: { marginBottom: 8, backgroundColor: '#fff' },
    count: { color: '#888', marginBottom: 8 },
    row: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center' },
    img: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' },
    info: { flex: 1, marginLeft: 10 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    chip: { backgroundColor: '#E8F5E9', height: 24 },
    actions: { flexDirection: 'column', alignItems: 'center' },
    separator: { height: 8 },
    fab: { position: 'absolute', right: 16, bottom: 24 },
});
