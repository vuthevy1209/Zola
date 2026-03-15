import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { orderService, Order, OrderStatus } from '@/services/order.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TABS = [
    { value: 'PROCESSING', label: 'Đang xử lý', icon: 'clock-outline' },
    { value: 'DELIVERED', label: 'Đã giao', icon: 'check-circle-outline' },
    { value: 'CANCELLED', label: 'Đã hủy', icon: 'close-circle-outline' },
];

const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return 'Đang xử lý';
    }
};

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'DELIVERED': return '#388E3C';
        case 'CANCELLED': return '#D32F2F';
        default: return '#FFA000';
    }
};

export default function OrdersScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('PROCESSING');
    const initialLoadDone = useRef(false);

    const loadOrders = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        const data = await orderService.getOrderHistory();
        setOrders(data);
        setLoading(false);
        initialLoadDone.current = true;
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders(!initialLoadDone.current);
        }, [])
    );

    const filteredOrders = orders.filter(o => {
        if (activeTab === 'PROCESSING') {
            return ['NEW', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes(o.status);
        }
        return o.status === activeTab;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderOrder = ({ item }: { item: Order }) => {
        const itemCount = item.items.reduce((sum, current) => sum + current.quantity, 0);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push(`/orders/${item.id}`)}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.orderIdText}>Order #{item.id.replace('ORD_', '').substring(0, 4)}</Text>
                    <Text style={styles.orderDateText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                </View>

                <View style={styles.cardInfoRow}>
                    <Text style={styles.infoLabel}>Tracking number:</Text>
                    <Text style={styles.infoValue}>IK287368838</Text>
                </View>

                <View style={styles.cardInfoRow}>
                    <View style={styles.rowLeft}>
                        <Text style={styles.infoLabel}>Quantity:</Text>
                        <Text style={[styles.infoValue, { marginLeft: 8 }]}>{itemCount}</Text>
                    </View>
                    <View style={styles.rowRight}>
                        <Text style={styles.infoLabel}>Subtotal:</Text>
                        <Text style={styles.subtotalValue}>{formatPrice(item.total)}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status).toUpperCase()}
                    </Text>
                    <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => router.push(`/orders/${item.id}`)}
                    >
                        <Text style={styles.detailsBtnText}>Details</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#FAFAFA' }]} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/product')} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của bạn</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.tabsContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsListContent}
                    data={TABS}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => {
                        const isActive = activeTab === item.value;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveTab(item.value)}
                                style={[
                                    styles.tabChip,
                                    isActive
                                        ? { backgroundColor: theme.colors.primary }
                                        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E0E0E0' },
                                ]}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons
                                    name={item.icon as any}
                                    size={15}
                                    color={isActive ? '#FFFFFF' : '#888'}
                                    style={{ marginRight: 5 }}
                                />
                                <Text style={isActive ? styles.activeTabText : styles.inactiveTabText}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {loading ? (
                <ActivityIndicator style={styles.center} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 40, opacity: 0.6 }}>
                            Không có đơn hàng nào
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
    center: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'space-between',
        backgroundColor: '#FAFAFA',
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
    tabsContainer: {
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        zIndex: 1,
    },
    tabsListContent: {
        flex: 1,
        justifyContent: 'space-evenly',
        paddingHorizontal: 8,
    },
    tabChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    inactiveTabText: {
        color: '#666666',
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    orderDateText: {
        fontSize: 14,
        color: '#8A8D9F',
        marginTop: 2,
    },
    cardInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8A8D9F',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
        marginLeft: 8,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtotalValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginLeft: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailsBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        backgroundColor: 'white',
    },
    detailsBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    }
});
