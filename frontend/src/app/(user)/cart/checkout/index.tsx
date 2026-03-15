import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Button, ActivityIndicator, RadioButton, Divider, Appbar, TextInput } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { cartService, CartItem } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { promotionService, Voucher } from '@/services/promotion.service';
import { formatPrice } from '@/utils/format';

export default function CheckoutScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [address, setAddress] = useState('123 Đường Nguyễn Huệ, Quận 1, TP. HCM');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [notes, setNotes] = useState('');

    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<{ discount: number, voucher: Voucher } | null>(null);
    const [applyingVoucher, setApplyingVoucher] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        const items = await cartService.getCart();
        setCartItems(items);
        setLoading(false);

        if (items.length === 0) {
            router.replace('/cart');
        }
    };

    const totalItemPrice = cartItems.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
    const finalTotal = Math.max(0, totalItemPrice - (appliedVoucher?.discount || 0));

    const handleApplyVoucher = async () => {
        if (!voucherCode) return;
        setApplyingVoucher(true);
        try {
            const result = await promotionService.applyVoucher(voucherCode, totalItemPrice);
            setAppliedVoucher({ discount: result.discountAmount, voucher: result.voucher });
            Alert.alert('Thành công', 'Áp dụng mã giảm giá thành công');
        } catch (e: any) {
            Alert.alert('Lỗi', e.message || 'Mã không hợp lệ');
            setAppliedVoucher(null);
        } finally {
            setApplyingVoucher(false);
        }
    };

    const handleCheckout = async () => {
        if (!address) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        setSubmitting(true);
        try {
            const order = await orderService.createOrder(cartItems, finalTotal);
            await cartService.clearCart();
            Alert.alert(
                'Thành công',
                'Đặt hàng thành công! Trạng thái đơn hàng đang chờ xác nhận.',
                [
                    { text: 'Xem đơn hàng', onPress: () => router.replace(`/orders/${order.id}`) },
                    { text: 'Trang chủ', onPress: () => router.replace('/') }
                ]
            );
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình đặt hàng');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Thanh toán" titleStyle={styles.headerTitle} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Address */}
                <View style={styles.card}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                    <TextInput
                        mode="outlined"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        style={styles.input}
                        outlineColor="#EAEAEA"
                        activeOutlineColor={theme.colors.primary}
                    />
                </View>

                {/* Order Details */}
                <View style={styles.card}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
                    {cartItems.map((item) => (
                        <View key={item.product.id} style={styles.orderRow}>
                            <Text numberOfLines={1} style={styles.orderItemName}>{item.quantity}x {item.product.name}</Text>
                            <Text style={styles.orderItemPrice}>{formatPrice(item.product.basePrice * item.quantity)}</Text>
                        </View>
                    ))}

                    <View style={styles.voucherContainer}>
                        <TextInput
                            mode="outlined"
                            placeholder="Nhập mã ưu đãi (ZOLA100, WELCOME50)"
                            value={voucherCode}
                            onChangeText={setVoucherCode}
                            style={styles.voucherInput}
                            outlineColor="#EAEAEA"
                            activeOutlineColor={theme.colors.primary}
                            autoCapitalize="characters"
                        />
                        <Button
                            mode="contained"
                            onPress={handleApplyVoucher}
                            loading={applyingVoucher}
                            style={styles.applyBtn}
                            labelStyle={{ fontWeight: 'bold' }}
                        >
                            Áp dụng
                        </Button>
                    </View>

                    {appliedVoucher && (
                        <View style={[styles.summaryRow, { borderTopWidth: 0, paddingBottom: 0 }]}>
                            <Text style={{ color: theme.colors.primary, fontWeight: '500' }}>Giảm giá ({appliedVoucher.voucher.code}):</Text>
                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>-{formatPrice(appliedVoucher.discount)}</Text>
                        </View>
                    )}

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tổng cộng:</Text>
                        <Text style={styles.summaryTotal}>
                            {formatPrice(finalTotal)}
                        </Text>
                    </View>
                </View>

                {/* Notification / Notes */}
                <View style={styles.card}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Lưu ý thêm (không bắt buộc)</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Ghi chú cho shipper..."
                        value={notes}
                        onChangeText={setNotes}
                        style={styles.input}
                        outlineColor="#EAEAEA"
                        activeOutlineColor={theme.colors.primary}
                    />
                </View>

                {/* Payment */}
                <View style={styles.card}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <RadioButton.Group onValueChange={newValue => setPaymentMethod(newValue)} value={paymentMethod}>
                        <View style={styles.radioRow}>
                            <RadioButton value="COD" color={theme.colors.primary} />
                            <Text style={styles.radioLabel}>Thanh toán khi nhận hàng (COD)</Text>
                        </View>
                        <View style={styles.radioRow}>
                            <RadioButton value="MOMO" disabled />
                            <Text style={[styles.radioLabel, { opacity: 0.5 }]}>Ví MoMo (Sắp ra mắt)</Text>
                        </View>
                    </RadioButton.Group>
                </View>

            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}>
                <Button
                    mode="contained"
                    onPress={handleCheckout}
                    loading={submitting}
                    disabled={submitting}
                    style={styles.checkoutBtn}
                    labelStyle={styles.checkoutBtnLabel}
                >
                    Đặt hàng ({formatPrice(finalTotal)})
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
        fontSize: 16,
        color: '#1E1E1E',
    },
    input: {
        backgroundColor: '#FAFAFA',
        fontSize: 14,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    orderItemName: {
        flex: 1,
        fontSize: 14,
        color: '#444',
        marginRight: 16,
    },
    orderItemPrice: {
        fontWeight: '600',
        fontSize: 14,
        color: '#1E1E1E',
    },
    voucherContainer: {
        flexDirection: 'row',
        marginTop: 12,
        alignItems: 'center',
        gap: 8,
    },
    voucherInput: {
        flex: 1,
        height: 44,
        backgroundColor: '#FAFAFA',
        fontSize: 14,
    },
    applyBtn: {
        height: 44,
        justifyContent: 'center',
        borderRadius: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
    },
    summaryLabel: {
        fontSize: 15,
        color: '#444',
    },
    summaryTotal: {
        color: '#1E1E1E',
        fontWeight: 'bold',
        fontSize: 20,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    radioLabel: {
        fontSize: 15,
        color: '#1E1E1E',
        marginLeft: 4,
    },
    bottomBar: {
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    checkoutBtn: {
        borderRadius: 30,
        paddingVertical: 4,
        elevation: 0,
    },
    checkoutBtnLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    }
});
