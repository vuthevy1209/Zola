import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, IconButton, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface FilterState {
    minPrice: string;
    maxPrice: string;
    colors: string[];
    rating: string | null;
    category: string | null;
    discounts: string[];
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
}

const AVAILABLE_COLORS = ['#E6A23C', '#F56C6C', '#1E1E1E', '#606266', '#DCDFE6', '#8B5A2B', '#FFB6C1'];
const RATINGS = ['1', '2', '3', '4', '5'];
const DISCOUNTS = ['50% off', '40% off', '30% off', '25% off'];

export default function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
    const theme = useTheme();
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    const handleReset = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            colors: [],
            rating: null,
            category: null,
            discounts: [],
        });
    };

    const toggleColor = (color: string) => {
        setFilters(prev => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color]
        }));
    };

    const toggleDiscount = (discount: string) => {
        setFilters(prev => ({
            ...prev,
            discounts: prev.discounts.includes(discount)
                ? prev.discounts.filter(d => d !== discount)
                : [...prev.discounts, discount]
        }));
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Filter</Text>
                            <IconButton icon="close" onPress={onClose} />
                        </View>
                        
                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {/* Price Section */}
                            <View style={styles.section}>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Price range ($)</Text>
                                <View style={styles.priceInputs}>
                                    <TextInput 
                                        style={styles.priceInput} 
                                        placeholder="Min" 
                                        keyboardType="numeric"
                                        value={filters.minPrice}
                                        onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                                    />
                                    <Text style={{ marginHorizontal: 12 }}>-</Text>
                                    <TextInput 
                                        style={styles.priceInput} 
                                        placeholder="Max" 
                                        keyboardType="numeric"
                                        value={filters.maxPrice}
                                        onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                                    />
                                </View>
                            </View>

                            {/* Color Section */}
                            <View style={styles.section}>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Color</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {AVAILABLE_COLORS.map(color => {
                                        const isSelected = filters.colors.includes(color);
                                        return (
                                            <TouchableOpacity 
                                                key={color} 
                                                onPress={() => toggleColor(color)}
                                                style={[
                                                    styles.colorCircle, 
                                                    { backgroundColor: color },
                                                    isSelected && styles.colorCircleSelected
                                                ]} 
                                            />
                                        )
                                    })}
                                </ScrollView>
                            </View>

                            {/* Star Rating */}
                            <View style={styles.section}>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Star Rating</Text>
                                <View style={styles.ratingRow}>
                                    {RATINGS.map(rating => {
                                        const isSelected = filters.rating === rating;
                                        return (
                                            <TouchableOpacity 
                                                key={rating}
                                                onPress={() => setFilters(prev => ({ ...prev, rating: isSelected ? null : rating }))}
                                                style={[
                                                    styles.ratingBtn,
                                                    isSelected && { backgroundColor: '#1E1E1E', borderColor: '#1E1E1E' }
                                                ]}
                                            >
                                                <Text style={{ color: isSelected ? 'white' : '#1E1E1E' }}>⭐ {rating}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Discount */}
                            <View style={styles.section}>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Discount</Text>
                                <View style={styles.discountGrid}>
                                    {DISCOUNTS.map(d => {
                                        const isSelected = filters.discounts.includes(d);
                                        return (
                                            <TouchableOpacity 
                                                key={d}
                                                onPress={() => toggleDiscount(d)}
                                                style={[
                                                    styles.discountChip,
                                                    isSelected && { backgroundColor: '#1E1E1E', borderColor: '#1E1E1E' }
                                                ]}
                                            >
                                                <Text style={{ color: isSelected ? 'white' : '#1E1E1E' }}>
                                                    {d} {isSelected ? 'x' : ''}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                        
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                                <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(filters)}>
                                <Text style={styles.applyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    content: {
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: 'bold',
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    colorCircleSelected: {
        borderColor: '#000',
        borderWidth: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 12,
    },
    ratingBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    discountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    discountChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    resetBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
    },
    resetText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    applyBtn: {
        flex: 2,
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        alignItems: 'center',
        paddingVertical: 14,
    },
    applyText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
