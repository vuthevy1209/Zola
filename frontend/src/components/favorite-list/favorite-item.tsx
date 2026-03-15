import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Product, getProductPrimaryImage } from '@/services/product.service';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 16;

interface FavoriteItemProps {
    item: Product;
    onPress: () => void;
}

export const FavoriteItem: React.FC<FavoriteItemProps> = ({ item, onPress }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: getProductPrimaryImage(item) }} 
                style={styles.productImage} 
                resizeMode="cover" 
            />
            <View style={styles.productContent}>
                <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
                <Text style={styles.priceText}>{formatPrice(item.basePrice)}</Text>
                <Text numberOfLines={1} style={styles.statsText}>{item.brand}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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
});
