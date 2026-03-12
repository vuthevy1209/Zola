package com.zola.services.product;

import com.zola.dto.request.product.ProductRequest;
import com.zola.dto.response.product.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse uploadImages(String productId, List<MultipartFile> files) throws IOException;
    List<ProductResponse> getAllProducts();
    ProductResponse getProduct(String id);
    ProductResponse updateProduct(String id, ProductRequest request);
    void deleteProduct(String id);
}
