import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, IconButton, ActivityIndicator, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { productService, Product } from '@/services/product.service';
import { cartService } from '@/services/cart.service';
import { interactionService, Review } from '@/services/interaction.service';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const router = useRouter();
    const navigation = useNavigation();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#E4CDC0');
    const [selectedSize, setSelectedSize] = useState('M');
    const [isDescExpanded, setIsDescExpanded] = useState(true);
    const [isReviewsExpanded, setIsReviewsExpanded] = useState(true);

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const [data, revs, liked] = await Promise.all([
                productService.getProductDetail(id),
                interactionService.getReviews(id),
                interactionService.checkIsFavorite(id)
            ]);
            setProduct(data);
            setReviews(revs);
            setIsLiked(liked);

            // Set header title dynamically
            navigation.setOptions({
                title: data?.name || 'Chi tiết',
                headerTitleStyle: { fontSize: 16 }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!product) return;
        const newStatus = await interactionService.toggleFavorite(product);
        setIsLiked(newStatus);
    };

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            await cartService.addToCart(product, 1);
            alert('Đã thêm sản phẩm vào giỏ hàng');
        } catch {
            alert('Lỗi thêm giỏ hàng');
        } finally {
            setAddingToCart(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.centerContainer}>
                <Text>Không tìm thấy sản phẩm</Text>
                <Button onPress={() => router.back()} style={{ marginTop: 16 }}>Quay lại</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                    <View style={styles.headerButtons}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                            <IconButton icon="chevron-left" size={24} iconColor="#1E1E1E" style={{ margin: 0 }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.headerBtn, { padding: 4 }]} onPress={handleToggleFavorite}>
                            <IconButton icon={isLiked ? "heart" : "heart-outline"} size={22} iconColor={isLiked ? "#FF5252" : "#1E1E1E"} style={{ margin: 0 }} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSheet}>
                    <View style={styles.titlePriceRow}>
                        <Text style={styles.productTitle}>{product.name}</Text>
                        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    </View>

                    <View style={styles.ratingRow}>
                        <Text style={styles.starsText}>{'★'.repeat(Math.round(product.rating))}<Text style={{ color: '#E0E0E0' }}>{'★'.repeat(5 - Math.round(product.rating))}</Text></Text>
                        <Text style={styles.reviewCount}>({product.sold})</Text>
                    </View>

                    <View style={styles.specificationsRow}>
                        <View style={styles.specColumn}>
                            <Text style={styles.specTitle}>Color</Text>
                            <View style={styles.optionsRow}>
                                {['#E4CDC0', '#000000', '#EF6D6D'].map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={[
                                            styles.colorCircle,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.colorSelected
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                        <View style={styles.specColumn}>
                            <Text style={styles.specTitle}>Size</Text>
                            <View style={styles.optionsRow}>
                                {['S', 'M', 'L'].map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => setSelectedSize(size)}
                                        style={[styles.sizeCircle, selectedSize === size && styles.sizeCircleSelected]}
                                    >
                                        <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Description Section */}
                    <TouchableOpacity style={styles.accordionHeader} onPress={() => setIsDescExpanded(!isDescExpanded)} activeOpacity={0.7}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <IconButton icon={isDescExpanded ? "chevron-up" : "chevron-down"} size={20} style={{ margin: 0 }} />
                    </TouchableOpacity>
                    {isDescExpanded && (
                        <View style={styles.accordionContent}>
                            <Text style={styles.descriptionText}>
                                Đây là phần phân phối chính thức thông qua hệ thống Zola. Sản phẩm này có mã {product.id}, thuộc danh mục {product.categoryId}.
                                Cam kết hàng chính hãng 100%, bảo hành 12 tháng. Form oversize, bạn có thể cân nhắc giảm một size nhé. <Text style={{ textDecorationLine: 'underline', color: '#1E1E1E' }}>Read more</Text>
                            </Text>
                        </View>
                    )}

                    {/* Reviews Section */}
                    <TouchableOpacity style={[styles.accordionHeader, { marginTop: 16 }]} onPress={() => setIsReviewsExpanded(!isReviewsExpanded)} activeOpacity={0.7}>
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        <IconButton icon={isReviewsExpanded ? "chevron-up" : "chevron-down"} size={20} style={{ margin: 0 }} />
                    </TouchableOpacity>
                    {isReviewsExpanded && (
                        <View style={styles.accordionContent}>
                            <View style={styles.reviewSummaryRow}>
                                <Text style={styles.bigRatingText}>{product.rating} <Text style={styles.outOf5}>OUT OF 5</Text></Text>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.starsText}>{'★'.repeat(Math.round(product.rating))}<Text style={{ color: '#E0E0E0' }}>{'★'.repeat(5 - Math.round(product.rating))}</Text></Text>
                                    <Text style={styles.totalReviewsText}>{product.reviews} ratings</Text>
                                </View>
                            </View>

                            <View style={styles.ratingBarsContainer}>
                                {[
                                    { star: 5, pct: '80%' },
                                    { star: 4, pct: '12%' },
                                    { star: 3, pct: '5%' },
                                    { star: 2, pct: '3%' },
                                    { star: 1, pct: '0%' },
                                ].map((b, i) => (
                                    <View key={i} style={styles.ratingBarRow}>
                                        <Text style={styles.ratingBarStarText}>{b.star} ★</Text>
                                        <View style={styles.ratingBarTrack}>
                                            <View style={[styles.ratingBarFill, { width: b.pct as any }]} />
                                        </View>
                                        <Text style={styles.ratingBarPctText}>{b.pct}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.reviewControlsRow}>
                                <Text style={styles.totalReviewsText}>{product.reviews} Reviews</Text>
                                <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.writeReviewText}>WRITE A REVIEW</Text>
                                    <IconButton icon="pencil-outline" size={14} style={{ margin: 0, marginLeft: 4, width: 16, height: 16 }} iconColor="#1E1E1E" />
                                </TouchableOpacity>
                            </View>

                            {reviews.length === 0 ? (
                                <Text style={{ opacity: 0.6, marginTop: 16 }}>Chưa có đánh giá nào.</Text>
                            ) : (
                                reviews.map((rev) => (
                                    <View key={rev.id} style={styles.reviewItem}>
                                        <View style={styles.reviewItemHeader}>
                                            <Image source={{ uri: 'https://i.pravatar.cc/150?u=' + rev.id }} style={styles.reviewAvatar} />
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={styles.reviewUserName}>{rev.userName}</Text>
                                                <Text style={styles.reviewStars}>
                                                    {'★'.repeat(rev.rating)}<Text style={{ color: '#E0E0E0' }}>{'★'.repeat(5 - rev.rating)}</Text>
                                                </Text>
                                            </View>
                                            <Text style={styles.reviewTimeText}>
                                                {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </View>
                                        <Text style={styles.reviewCommentText}>{rev.comment}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <Button
                    mode="contained"
                    style={styles.addToCartBtn}
                    buttonColor="#333333"
                    onPress={handleAddToCart}
                    loading={addingToCart}
                    disabled={addingToCart}
                    icon="cart-outline"
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                >
                    Add To Cart
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#F7F7F7',
    },
    productImage: {
        width: width,
        height: width * 1.3,
    },
    headerButtons: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    contentSheet: {
        backgroundColor: '#FFFFFF',
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 20,
    },
    titlePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    productTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E1E1E',
        flex: 1,
        marginRight: 16,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E1E1E',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    starsText: {
        color: '#439775',
        fontSize: 14,
        letterSpacing: 2,
    },
    reviewCount: {
        color: '#8A8A8A',
        fontSize: 12,
        marginLeft: 8,
    },
    specificationsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        marginBottom: 8,
    },
    specColumn: {
        flex: 1,
    },
    specTitle: {
        fontSize: 14,
        color: '#1E1E1E',
        marginBottom: 12,
        fontWeight: '500'
    },
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    colorSelected: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    sizeCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeCircleSelected: {
        backgroundColor: '#333333',
    },
    sizeText: {
        fontSize: 14,
        color: '#8A8A8A',
        fontWeight: '600',
    },
    sizeTextSelected: {
        color: '#FFFFFF',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E1E1E',
    },
    accordionContent: {
        paddingTop: 16,
    },
    descriptionText: {
        fontSize: 14,
        color: '#8A8A8A',
        lineHeight: 22,
    },
    reviewSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    bigRatingText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E1E1E',
    },
    outOf5: {
        fontSize: 10,
        color: '#8A8A8A',
        fontWeight: 'normal',
    },
    totalReviewsText: {
        fontSize: 10,
        color: '#8A8A8A',
        textAlign: 'right',
        marginTop: 4,
    },
    ratingBarsContainer: {
        marginBottom: 24,
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingBarStarText: {
        width: 24,
        fontSize: 12,
        color: '#439775',
    },
    ratingBarTrack: {
        flex: 1,
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        marginHorizontal: 12,
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#439775',
        borderRadius: 2,
    },
    ratingBarPctText: {
        width: 32,
        fontSize: 12,
        color: '#8A8A8A',
        textAlign: 'right',
    },
    reviewControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    writeReviewText: {
        fontSize: 12,
        color: '#1E1E1E',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    reviewItem: {
        marginBottom: 24,
    },
    reviewItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    reviewUserName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E1E1E',
        marginBottom: 2,
    },
    reviewStars: {
        fontSize: 12,
        color: '#439775',
    },
    reviewTimeText: {
        fontSize: 12,
        color: '#C0C0C0',
    },
    reviewCommentText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    bottomBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    addToCartBtn: {
        borderRadius: 30,
        elevation: 0,
        paddingVertical: 4,
    }
});
