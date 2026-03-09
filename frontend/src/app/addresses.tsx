import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addressService, Address } from '@/services/address.service';

export default function AddressesScreen() {
    const router = useRouter();
    const theme = useTheme();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAddresses = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [])
    );

    const handleSetDefault = async (id: string) => {
        try {
            await addressService.setDefault(id);
            fetchAddresses(false);
        } catch {
            Alert.alert('Lỗi', 'Không thể đặt mặc định địa chỉ này.');
        }
    };

    const handleDelete = (address: Address) => {
        Alert.alert(
            'Xoá địa chỉ',
            `Bạn có chắc chắn muốn xoá địa chỉ này không?`,
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Xoá',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressService.deleteAddress(address.id);
                            fetchAddresses(false);
                        } catch {
                            Alert.alert('Lỗi', 'Không thể xoá địa chỉ.');
                        }
                    },
                },
            ]
        );
    };

    const formatAddress = (addr: Address) => {
        const parts = [addr.streetAddress, addr.ward, addr.district, addr.province].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1D1D1D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
                <View style={styles.backBtn} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchAddresses(false); }}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {addresses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="map-marker-off-outline" size={72} color="#CCCCCC" />
                            <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào</Text>
                            <Text style={styles.emptySubText}>Thêm địa chỉ để đặt hàng nhanh hơn</Text>
                        </View>
                    ) : (
                        addresses.map((addr) => (
                            <View key={addr.id} style={styles.card}>
                                {/* Left: address info */}
                                <View style={styles.cardLeft}>
                                    <View style={styles.addressRow}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={16} color="#888" style={{ marginRight: 6, marginTop: 2 }} />
                                        <Text style={styles.addressText}>{formatAddress(addr)}</Text>
                                    </View>
                                    {!addr.isDefault && (
                                        <TouchableOpacity
                                            style={styles.setDefaultBtn}
                                            onPress={() => handleSetDefault(addr.id)}
                                        >
                                            <MaterialCommunityIcons name="star-outline" size={13} color={theme.colors.primary} />
                                            <Text style={[styles.setDefaultText, { color: theme.colors.primary }]}>Đặt mặc định</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Right: badge + icon actions */}
                                <View style={styles.cardRight}>
                                    {addr.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>Mặc định</Text>
                                        </View>
                                    )}
                                    <View style={styles.iconActions}>
                                        <TouchableOpacity
                                            style={styles.iconBtn}
                                            onPress={() => router.push({ pathname: '/address-form', params: { addressId: addr.id } })}
                                        >
                                            <MaterialCommunityIcons name="pencil-outline" size={19} color="#555" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.iconBtn}
                                            onPress={() => handleDelete(addr)}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={19} color="#E53935" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Add button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push('/address-form')}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="plus" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.addBtnText}>Thêm địa chỉ mới</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1D1D1D',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        gap: 10,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginTop: 12,
    },
    emptySubText: {
        fontSize: 13,
        color: '#AAAAAA',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardLeft: {
        flex: 1,
        marginRight: 12,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: 10,
    },
    defaultBadge: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 8,
    },
    defaultBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2E7D32',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    addressText: {
        fontSize: 13,
        color: '#666666',
        flex: 1,
        lineHeight: 18,
    },
    setDefaultBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        marginLeft: 22,
    },
    setDefaultText: {
        fontSize: 12,
        fontWeight: '500',
    },
    iconActions: {
        flexDirection: 'row',
        gap: 4,
    },
    iconBtn: {
        padding: 6,
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 14,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
