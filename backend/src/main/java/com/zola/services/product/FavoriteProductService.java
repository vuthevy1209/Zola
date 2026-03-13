package com.zola.services.product;

public interface FavoriteProductService {
    void toggleFavorite(String productId);
    boolean isFavorite(String productId);
}
