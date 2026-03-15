import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { CartItem } from '@/services/cart.service';
import { getProductPrimaryImage } from '@/services/product.service';
import { formatPrice } from '@/utils/format';

interface CartItemCardProps {
    item: CartItem;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onNavigateToProduct: (productId: string) => void;
    onRemove: (id: string) => void;
}

export default function CartItemCard({
    item,
    isSelected,
    onToggleSelection,
    onUpdateQuantity,
    onNavigateToProduct,
    onRemove
}: CartItemCardProps) {
    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity 
                onPress={() => onRemove(item.id)}
                activeOpacity={0.6}
            >
                <Animated.View 
                    style={[
                        styles.deleteAction,
                        {
                            transform: [{ translateX: trans }],
                        },
                    ]}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={28} color="white" />
                    <Text style={styles.deleteText}>Xóa</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={40}
        >
            <View style={styles.cardContainer}>
                <TouchableOpacity onPress={() => onNavigateToProduct(item.product.id)}>
                    <Image 
                        source={{ uri: getProductPrimaryImage(item.product) }} 
                        style={styles.itemImage} 
                        resizeMode="cover" 
                    />
                </TouchableOpacity>
                <View style={styles.itemInfo}>
                    <View style={styles.titleRow}>
                        <Text numberOfLines={1} style={styles.itemName}>{item.product.name}</Text>
                        <TouchableOpacity
                            onPress={() => onToggleSelection(item.id)}
                            style={[
                                styles.checkbox,
                                isSelected ? styles.checkboxSelected : styles.checkboxUnselected
                            ]}
                        >
                            {isSelected && <MaterialCommunityIcons name="check" size={16} color="white" />}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.itemPrice}>{formatPrice(item.product.basePrice)}</Text>

                    <View style={styles.bottomRow}>
                        <Text style={styles.variantText}>
                            Size: {item.variant.size?.name ?? 'N/A'} | Màu: {item.variant.color?.name ?? 'N/A'}
                        </Text>
                        <View style={styles.quantityPill}>
                            <TouchableOpacity 
                                onPress={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                                style={styles.iconBtn}
                            >
                                <MaterialCommunityIcons name="minus" size={16} color="#666" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <TouchableOpacity 
                                onPress={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                                style={styles.iconBtn}
                            >
                                <MaterialCommunityIcons name="plus" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
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
    deleteAction: {
        backgroundColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '84%', // Match card height minus margin
        borderRadius: 20,
        marginLeft: 10,
        // Align with card bottom margin
        marginBottom: 16,
    },
    deleteText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});
