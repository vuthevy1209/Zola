package com.zola.configuration;

import com.zola.entity.Role;
import com.zola.entity.User;
import com.zola.enums.PredefinedRole;
import com.zola.repository.*;
import com.zola.entity.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import java.math.BigDecimal;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${init.admin.username}")
    String ADMIN_USERNAME;

    @NonFinal
    @Value("${init.admin.password}")
    String ADMIN_PASSWORD;

    @NonFinal
    @Value("${init.admin.email}")
    String ADMIN_EMAIL;

    @NonFinal
    @Value("${init.admin.phone}")
    String ADMIN_PHONE;

    @Bean
    @ConditionalOnProperty(prefix = "spring", value = "datasource.driver-class-name", havingValue = "org.postgresql.Driver")
    ApplicationRunner applicationRunner(
            UserRepository userRepository, 
            RoleRepository roleRepository,
            CategoryRepository categoryRepository,
            SizeRepository sizeRepository,
            ColorRepository colorRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            ProductImageRepository productImageRepository
    ) {
        log.info("ApplicationInitConfig initialized - PostgreSQL detected");

        return args -> {
            // Seed Roles
            if (roleRepository.count() == 0) {
                log.info("Seeding system roles...");
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN.name())
                        .roleName("CHỦ CỬA HÀNG")
                        .description("Admin role")
                        .build());

                roleRepository.save(Role.builder()
                        .name(PredefinedRole.USER.name())
                        .roleName("KHÁCH HÀNG")
                        .description("User role")
                        .build());
            }

            // Seed Admin User
            if (userRepository.findByUsername(ADMIN_USERNAME).isEmpty()) {
                log.info("Seeding admin user...");
                User adminUser = User.builder()
                        .username(ADMIN_USERNAME)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .email(ADMIN_EMAIL)
                        .phone(ADMIN_PHONE)
                        .firstName("System")
                        .lastName("Administrator")
                        .role(roleRepository.findByRoleName(PredefinedRole.ADMIN))
                        .isActive(true)
                        .build();

                userRepository.save(adminUser);
                log.warn("Admin user has been created with default password: admin, please change it");
            }

            // Seed normal user
            if (userRepository.findByUsername("vuthevy1209").isEmpty()) {
                log.info("Seeding user vuthevy1209...");
                User normalUser = User.builder()
                        .username("vuthevy1209")
                        .password(passwordEncoder.encode("Password123@"))
                        .email("vuthevy12092004@gmail.com")
                        .phone("0354802825")
                        .firstName("Vy")
                        .lastName("Vu")
                        .role(roleRepository.findByRoleName(PredefinedRole.USER))
                        .isActive(true)
                        .build();

                userRepository.save(normalUser);
                log.info("Normal user 'vuthevy1209' has been created");
            }

            // Seed Categories
            if (categoryRepository.count() == 0) {
                log.info("Seeding E-commerce Categories...");
                categoryRepository.save(Category.builder().name("Áo Thun (T-Shirts)").description("Các loại áo thun basic và graphic").build());
                categoryRepository.save(Category.builder().name("Áo Sơ Mi (Shirts)").description("Áo sơ mi công sở, casual").build());
                categoryRepository.save(Category.builder().name("Quần (Bottoms)").description("Quần jean, kaki, short").build());
                categoryRepository.save(Category.builder().name("Áo Khoác (Jackets)").description("Áo khoác gió, hoodie, blazer").build());
                categoryRepository.save(Category.builder().name("Phụ Kiện (Accessories)").description("Nón, tất, thắt lưng").build());
            }

            // Seed Sizes
            if (sizeRepository.count() == 0) {
                log.info("Seeding E-commerce Sizes...");
                sizeRepository.saveAll(List.of(
                        Size.builder().name("S").build(),
                        Size.builder().name("M").build(),
                        Size.builder().name("L").build(),
                        Size.builder().name("XL").build(),
                        Size.builder().name("XXL").build()
                ));
            }

            // Seed Colors
            if (colorRepository.count() == 0) {
                log.info("Seeding E-commerce Colors...");
                colorRepository.saveAll(List.of(
                        Color.builder().name("Đen").hexCode("#000000").build(),
                        Color.builder().name("Trắng").hexCode("#FFFFFF").build(),
                        Color.builder().name("Xám").hexCode("#808080").build(),
                        Color.builder().name("Xanh Navy").hexCode("#000080").build(),
                        Color.builder().name("Be (Beige)").hexCode("#F5F5DC").build()
                ));
            }

            // Seed Products
            if (productRepository.count() == 0 && categoryRepository.count() > 0 && sizeRepository.count() > 0 && colorRepository.count() > 0) {
                log.info("Seeding initial Products...");
                Category tshirtCat = categoryRepository.findAll().stream().filter(c -> c.getName().contains("Áo Thun")).findFirst().orElse(null);
                Size sizeM = sizeRepository.findAll().stream().filter(s -> s.getName().equals("M")).findFirst().orElse(null);
                Size sizeL = sizeRepository.findAll().stream().filter(s -> s.getName().equals("L")).findFirst().orElse(null);
                Color colorBlack = colorRepository.findAll().stream().filter(c -> c.getName().equals("Đen")).findFirst().orElse(null);
                Color colorWhite = colorRepository.findAll().stream().filter(c -> c.getName().equals("Trắng")).findFirst().orElse(null);

                if (tshirtCat != null && sizeM != null && sizeL != null && colorBlack != null && colorWhite != null) {
                    Product p1 = Product.builder()
                            .name("Áo Thun Basic Cotton Zola")
                            .description("Áo thun basic form rộng thoải mái, chất liệu 100% cotton thoáng mát.")
                            .basePrice(new BigDecimal("150000"))
                            .status("ACTIVE")
                            .category(tshirtCat)
                            .build();

                    productRepository.save(p1);

                    productImageRepository.save(ProductImage.builder().product(p1).imageUrl("https://picsum.photos/seed/zola1/400/600").isPrimary(true).build());
                    productImageRepository.save(ProductImage.builder().product(p1).imageUrl("https://picsum.photos/seed/zola2/400/600").isPrimary(false).build());

                    productVariantRepository.save(ProductVariant.builder().product(p1).size(sizeM).color(colorBlack).stockQuantity(50).build());
                    productVariantRepository.save(ProductVariant.builder().product(p1).size(sizeL).color(colorBlack).stockQuantity(30).build());
                    productVariantRepository.save(ProductVariant.builder().product(p1).size(sizeM).color(colorWhite).stockQuantity(40).build());
                    productVariantRepository.save(ProductVariant.builder().product(p1).size(sizeL).color(colorWhite).stockQuantity(25).build());
                }
            }
        };
    }
}