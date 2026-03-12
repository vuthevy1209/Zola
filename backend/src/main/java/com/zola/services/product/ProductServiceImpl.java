package com.zola.services.product;

import com.zola.dto.request.product.ProductRequest;
import com.zola.dto.response.product.*; import com.zola.dto.response.category.*; import com.zola.dto.response.attribute.*;
import com.zola.entity.*;
import com.zola.enums.ProductStatus;
import com.zola.repository.*;
import com.zola.services.cloudinary.CloudinaryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductServiceImpl implements ProductService {

    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    SizeRepository sizeRepository;
    ColorRepository colorRepository;
    ProductVariantRepository productVariantRepository;
    ProductImageRepository productImageRepository;
    CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .status(request.getStatus() != null ? ProductStatus.valueOf(request.getStatus()) : ProductStatus.ACTIVE)
                .category(category)
                .build();

        Product savedProduct = productRepository.save(product);

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variants = request.getVariants().stream().map(vReq -> {
                Size size = vReq.getSizeId() != null ? sizeRepository.findById(vReq.getSizeId()).orElse(null) : null;
                Color color = vReq.getColorId() != null ? colorRepository.findById(vReq.getColorId()).orElse(null) : null;

                ProductVariant variant = ProductVariant.builder()
                        .product(savedProduct)
                        .size(size)
                        .color(color)
                        .stockQuantity(vReq.getStockQuantity())
                        .build();
                return productVariantRepository.save(variant);
            }).collect(Collectors.toList());
            savedProduct.setVariants(variants);
        }

        return mapToResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse uploadImages(String productId, List<MultipartFile> files) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean isFirst = product.getImages().isEmpty();
        for (MultipartFile file : files) {
            String imageUrl = cloudinaryService.uploadImage(file, "zola/products");
            ProductImage image = ProductImage.builder()
                    .imageUrl(imageUrl)
                    .isPrimary(isFirst)
                    .product(product)
                    .build();
            productImageRepository.save(image);
            product.getImages().add(image);
            isFirst = false;
        }

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductResponse> getProductsPaged(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    public ProductResponse getProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setStatus(request.getStatus() != null ? ProductStatus.valueOf(request.getStatus()) : ProductStatus.ACTIVE);
        product.setCategory(category);

        productVariantRepository.deleteAll(product.getVariants());
        product.getVariants().clear();

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variants = request.getVariants().stream().map(vReq -> {
                Size size = vReq.getSizeId() != null ? sizeRepository.findById(vReq.getSizeId()).orElse(null) : null;
                Color color = vReq.getColorId() != null ? colorRepository.findById(vReq.getColorId()).orElse(null) : null;

                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(size)
                        .color(color)
                        .stockQuantity(vReq.getStockQuantity())
                        .build();
                return productVariantRepository.save(variant);
            }).collect(Collectors.toList());
            product.setVariants(variants);
        }

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product product) {
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .build();

        List<ProductImageResponse> imageResponses = product.getImages().stream().map(img ->
                ProductImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isPrimary(img.getIsPrimary())
                        .build()
        ).collect(Collectors.toList());

        List<ProductVariantResponse> variantResponses = product.getVariants().stream().map(v -> {
            SizeResponse sizeResp = v.getSize() != null ? SizeResponse.builder()
                    .id(v.getSize().getId())
                    .name(v.getSize().getName())
                    .build() : null;

            ColorResponse colorResp = v.getColor() != null ? ColorResponse.builder()
                    .id(v.getColor().getId())
                    .name(v.getColor().getName())
                    .hexCode(v.getColor().getHexCode())
                    .build() : null;

            return ProductVariantResponse.builder()
                    .id(v.getId())
                    .size(sizeResp)
                    .color(colorResp)
                    .stockQuantity(v.getStockQuantity())
                    .build();
        }).collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .brand(product.getBrand())
                .category(categoryResponse)
                .images(imageResponses)
                .variants(variantResponses)
                .build();
    }
}
