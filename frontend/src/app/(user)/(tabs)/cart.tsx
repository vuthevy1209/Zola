import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { cartService, CartItem } from '@/services/cart.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CartScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
    const initialLoadDone = useRef(false);

    useFocusEffect(
        useCallback(() => {
            loadCart(!initialLoadDone.current);
        }, [])
    );

    const loadCart = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        const items = await cartService.getCart();
        setCartItems(items);

        // Select all items initially if not already set
        const newSelection: Record<string, boolean> = {};
        items.forEach(item => {
            newSelection[item.product.id] = true;
        });
        setSelectedItems(newSelection);

        setLoading(false);
        initialLoadDone.current = true;
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) {
            confirmRemove(productId);
            return;
        }
        await cartService.updateQuantity(productId, quantity);
        await loadCart(false);
    };

    const confirmRemove = (productId: string) => {
        Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    await cartService.removeFromCart(productId);
                    await loadCart(false);
                }
            }
        ]);
    };

    const toggleSelection = (productId: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    // Calculate totals
    const selectedCartItems = cartItems.filter(item => selectedItems[item.product.id]);
    const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const formatVND = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cardContainer}>
            <Image source={{ uri: item.product.image }} style={styles.itemImage} resizeMode="cover" />
            <View style={styles.itemInfo}>
                <View style={styles.titleRow}>
                    <Text numberOfLines={1} style={styles.itemName}>{item.product.name}</Text>
                    <TouchableOpacity
                        onPress={() => toggleSelection(item.product.id)}
                        style={[
                            styles.checkbox,
                            selectedItems[item.product.id] ? styles.checkboxSelected : styles.checkboxUnselected
                        ]}
                    >
                        {selectedItems[item.product.id] && <MaterialCommunityIcons name="check" size={16} color="white" />}
                    </TouchableOpacity>
                </View>

                <Text style={styles.itemPrice}>{formatVND(item.product.price)}</Text>

                <View style={styles.bottomRow}>
                    <Text style={styles.variantText}>Size: L | Màu: Mặc định</Text>
                    <View style={styles.quantityPill}>
                        <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity - 1)} style={styles.iconBtn}>
                            <MaterialCommunityIcons name="minus" size={16} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity + 1)} style={styles.iconBtn}>
                            <MaterialCommunityIcons name="plus" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
                    <View style={{ width: 44 }} />
                </View>
                <ActivityIndicator style={styles.center} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/')} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
                <View style={{ width: 44 }} />
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="cart-outline" size={64} color="#ccc" />
                    <Text style={{ opacity: 0.6, marginTop: 16 }}>Giỏ hàng của bạn đang trống</Text>
                </View>
            ) : (
                <FlatList
                    data={cartItems}
                    keyExtractor={item => item.product.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {cartItems.length > 0 && (
                <View style={styles.bottomContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tiền hàng</Text>
                        <Text style={styles.summaryValue}>{formatVND(totalPrice)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                        <Text style={styles.summaryValue}>Miễn phí</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={[styles.summaryRow, { marginBottom: 24 }]}>
                        <Text style={styles.subtotalLabel}>Tổng cộng</Text>
                        <Text style={styles.subtotalValue}>{formatVND(totalPrice)}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }, selectedCartItems.length === 0 && { opacity: 0.5 }]}
                        onPress={() => router.push('/checkout')}
                        disabled={selectedCartItems.length === 0}
                    >
                        <Text style={styles.checkoutText}>Thanh toán ngay ({selectedCartItems.length})</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginLeft: -10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    itemImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
        flex: 1,
        marginRight: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#528F72',
    },
    checkboxUnselected: {
        backgroundColor: '#F0F0F0',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        marginTop: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    variantText: {
        fontSize: 12,
        color: '#888',
    },
    quantityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    iconBtn: {
        padding: 4,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 12,
        color: '#333',
    },
    bottomContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#777',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    subtotalLabel: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    subtotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    checkoutButton: {
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 8,
    },
    checkoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
