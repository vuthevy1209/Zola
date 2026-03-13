package com.zola.controllers;

import com.zola.dto.response.ApiResponse;
import com.zola.services.product.FavoriteProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorite-products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FavoriteProductController {

    FavoriteProductService favoriteProductService;

    @PostMapping("/{productId}/toggle")
    public ApiResponse<Void> toggleFavorite(@PathVariable String productId) {
        favoriteProductService.toggleFavorite(productId);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{productId}/check")
    public ApiResponse<Boolean> isFavorite(@PathVariable String productId) {
        return ApiResponse.<Boolean>builder()
                .result(favoriteProductService.isFavorite(productId))
                .build();
    }
}
