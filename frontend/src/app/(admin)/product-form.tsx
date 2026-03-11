import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { adminProductService } from '@/services/admin.service';
import { Category } from '@/services/product.service';

export default function ProductForm() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEdit = !!id;

    const categories = adminProductService.getCategories();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [image, setImage] = useState('');
    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isEdit && id) {
            const product = adminProductService.getById(id);
            if (product) {
                setName(product.name);
                setPrice(product.price.toString());
                setOriginalPrice(product.originalPrice?.toString() ?? '');
                setImage(product.image);
                setCategoryId(product.categoryId);
            }
        }
    }, [id]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Tên sản phẩm không được để trống';
        if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Giá không hợp lệ';
        if (!image.trim()) e.image = 'URL ảnh không được để trống';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        const data = {
            name: name.trim(),
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            discountRate: originalPrice ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : undefined,
            image: image.trim(),
            categoryId,
        };

        if (isEdit && id) {
            adminProductService.update(id, data);
            Alert.alert('Thành công', 'Đã cập nhật sản phẩm', [{ text: 'OK', onPress: () => router.back() }]);
        } else {
            adminProductService.create(data);
            Alert.alert('Thành công', 'Đã thêm sản phẩm mới', [{ text: 'OK', onPress: () => router.back() }]);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
                    </Text>
                    <Button onPress={() => router.back()}>Hủy</Button>
                </View>

                <TextInput
                    label="Tên sản phẩm *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    multiline
                    style={styles.input}
                    error={!!errors.name}
                />
                <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

                <TextInput
                    label="Giá bán (VND) *"
                    value={price}
                    onChangeText={setPrice}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!errors.price}
                />
                <HelperText type="error" visible={!!errors.price}>{errors.price}</HelperText>

                <TextInput
                    label="Giá gốc (VND) — để tính % giảm"
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                />

                <TextInput
                    label="URL ảnh *"
                    value={image}
                    onChangeText={setImage}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.image}
                />
                <HelperText type="error" visible={!!errors.image}>{errors.image}</HelperText>

                <Text variant="bodyMedium" style={styles.label}>Danh mục</Text>
                <View style={styles.categoryGrid}>
                    {categories.map((cat: Category) => (
                        <Button
                            key={cat.id}
                            mode={categoryId === cat.id ? 'contained' : 'outlined'}
                            onPress={() => setCategoryId(cat.id)}
                            style={styles.catBtn}
                            compact
                        >
                            {cat.name}
                        </Button>
                    ))}
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveBtn}
                    contentStyle={{ paddingVertical: 6 }}
                >
                    {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAFAFA' },
    container: { padding: 16, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    input: { marginBottom: 0, backgroundColor: '#fff' },
    label: { fontWeight: '600', marginTop: 8, marginBottom: 8 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    catBtn: { borderRadius: 8 },
    saveBtn: { marginTop: 8, borderRadius: 10 },
});
