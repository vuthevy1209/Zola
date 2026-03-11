import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminProductService, adminOrderService, adminFeedbackService } from '@/services/admin.service';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
    const theme = useTheme();
    const { user, signOut } = useAuth();
    const router = useRouter();

    const products = adminProductService.getAll();
    const orders = adminOrderService.getAll();
    const feedbacks = adminFeedbackService.getAll();

    const newOrders = orders.filter(o => o.status === 'NEW').length;
    const avgRating = feedbacks.length
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0';

    const stats = [
        { label: 'Sản phẩm', value: products.length, icon: 'package-variant-closed', color: '#528F72' },
        { label: 'Đơn hàng mới', value: newOrders, icon: 'clipboard-alert-outline', color: '#F59E0B' },
        { label: 'Tổng đơn', value: orders.length, icon: 'clipboard-list-outline', color: '#3B82F6' },
        { label: 'Đánh giá TB', value: avgRating, icon: 'star-outline', color: '#EF4444' },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text variant="titleMedium" style={{ color: '#888' }}>Xin chào,</Text>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{user?.firstName} {user?.lastName}</Text>
                    </View>
                    <MaterialCommunityIcons
                        name="logout"
                        size={24}
                        color="#888"
                        onPress={signOut}
                    />
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>Thống kê nhanh</Text>
                <View style={styles.grid}>
                    {stats.map(stat => (
                        <Surface key={stat.label} style={styles.statCard} elevation={1}>
                            <MaterialCommunityIcons name={stat.icon as any} size={28} color={stat.color} />
                            <Text variant="headlineMedium" style={[styles.statValue, { color: stat.color }]}>
                                {stat.value}
                            </Text>
                            <Text variant="bodySmall" style={styles.statLabel}>{stat.label}</Text>
                        </Surface>
                    ))}
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>Đơn hàng gần đây</Text>
                {orders.slice(0, 5).map(order => (
                    <Card key={order.id} style={styles.orderCard} onPress={() => router.push('/(admin)/orders')}>
                        <Card.Content style={styles.orderRow}>
                            <View>
                                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>#{order.id.slice(-6).toUpperCase()}</Text>
                                <Text variant="bodySmall" style={{ color: '#888' }}>{order.customerName}</Text>
                            </View>
                            <View style={styles.orderRight}>
                                <Text variant="bodySmall" style={[styles.badge, { backgroundColor: getBadgeColor(order.status) }]}>
                                    {getStatusLabel(order.status)}
                                </Text>
                                <Text variant="bodySmall" style={{ color: '#528F72', fontWeight: '600' }}>
                                    {order.total.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        NEW: 'Mới', CONFIRMED: 'Xác nhận', PREPARING: 'Chuẩn bị',
        DELIVERING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Hủy',
    };
    return map[status] ?? status;
};

const getBadgeColor = (status: string) => {
    const map: Record<string, string> = {
        NEW: '#3B82F6', CONFIRMED: '#8B5CF6', PREPARING: '#F59E0B',
        DELIVERING: '#06B6D4', DELIVERED: '#10B981', CANCELLED: '#EF4444',
    };
    return map[status] ?? '#888';
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAFAFA' },
    container: { padding: 16, paddingBottom: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    sectionTitle: { fontWeight: '700', marginBottom: 12, marginTop: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    statCard: { width: '46%', borderRadius: 12, padding: 16, alignItems: 'center', gap: 4, backgroundColor: '#fff' },
    statValue: { fontWeight: 'bold' },
    statLabel: { color: '#888', textAlign: 'center' },
    orderCard: { marginBottom: 8, borderRadius: 10 },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderRight: { alignItems: 'flex-end', gap: 4 },
    badge: { color: '#fff', fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
});

