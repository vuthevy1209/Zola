import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, ActivityIndicator, Divider, Appbar } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { orderService, Order } from '@/services/order.service';

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return 'Đang xử lý';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'DELIVERED': return '#388E3C';
        case 'CANCELLED': return '#D32F2F';
        default: return '#FFA000';
    }
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        setLoading(true);
        const data = await orderService.getOrderById(id);
        setOrder(data);
        setLoading(false);
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Hủy đơn hàng',
            'Bạn có chắc chắn muốn hủy đơn hàng này?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Có, Hủy đơn',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            await orderService.cancelOrder(id);
                            Alert.alert('Thành công', 'Đơn hàng đã được hủy');
                            loadOrder();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể hủy đơn hàng');
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const canCancel = () => {
        if (!order) return false;
        if (order.status !== 'NEW') return false;
        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();
        const minutesDiff = (now - createdAt) / 1000 / 60;
        return minutesDiff <= 30;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centerContainer}>
                <Text>Không tìm thấy đơn hàng</Text>
                <Button onPress={() => router.back()} style={{ marginTop: 16 }}>Quay lại</Button>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Order #{order.id.replace('ORD_', '').substring(0, 4)}</Text>
                        <Text style={styles.headerSubtitle}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {getStatusLabel(order.status).toUpperCase()}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Items Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
                    {order.items.map((item, idx) => (
                        <View key={idx} style={[styles.itemRow, idx === order.items.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <Image source={{ uri: item.product.image }} style={styles.itemImage} resizeMode="cover" />
                            <View style={styles.itemContent}>
                                <Text numberOfLines={2} style={styles.itemName}>{item.product.name}</Text>
                                <Text style={styles.itemVariant}>Phân loại: Mặc định</Text>
                                <View style={styles.itemSubRow}>
                                    <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
                                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Summary Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tiền hàng:</Text>
                        <Text style={styles.summaryValue}>{formatPrice(order.total)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.summaryValue}>{formatPrice(0)}</Text>
                    </View>
                    <Divider style={{ marginVertical: 12, backgroundColor: '#EAEAEA' }} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Thành tiền:</Text>
                        <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#666" style={styles.infoIcon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
                            <Text style={styles.infoValueDark}>Thanh toán khi nhận hàng (COD)</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" style={styles.infoIcon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Địa chỉ nhận hàng</Text>
                            <Text style={styles.infoValueDark}>123 Đường Nguyễn Huệ, Quận 1, TP. HCM</Text>
                        </View>
                    </View>
                </View>

                {canCancel() && (
                    <View style={styles.actionSection}>
                        <Text style={styles.warningText}>Bạn chỉ có thể hủy đơn hàng trong vòng 30 phút sau khi đặt.</Text>
                        <Button
                            mode="contained"
                            buttonColor={theme.colors.error}
                            onPress={handleCancelOrder}
                            loading={cancelling}
                            disabled={cancelling}
                            style={{ marginTop: 12 }}
                        >
                            Hủy Đơn Hàng
                        </Button>
                    </View>
                )}
            </ScrollView>
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
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginRight: 12,
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#8A8D9F',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: 12,
        color: '#8A8D9F',
        marginBottom: 8,
    },
    itemSubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222',
    },
    itemQuantity: {
        fontSize: 13,
        color: '#8A8D9F',
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#8A8D9F',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#8A8D9F',
        marginBottom: 4,
    },
    infoValueDark: {
        fontSize: 14,
        color: '#222',
        fontWeight: '500',
        lineHeight: 20,
    },
    actionSection: {
        padding: 16,
    },
    warningText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    }
});
