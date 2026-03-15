import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addressService, Address } from '@/services/address.service';
import { AddressList } from '@/components/address/address-list';

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
                <AddressList
                    addresses={addresses}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchAddresses(false); }}
                    onSetDefault={handleSetDefault}
                    onEdit={(id) => router.push({ pathname: '/profile/address/form', params: { addressId: id } })}
                    onDelete={handleDelete}
                />
            )}

            {/* Add button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push('/profile/address/form')}
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
