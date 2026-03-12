package com.zola.services.productvariant;

import com.zola.dto.request.product.ProductVariantRequest;
import com.zola.dto.response.product.ProductVariantResponse;

public interface ProductVariantService {
    ProductVariantResponse updateStock(Long id, Integer quantity);
}
