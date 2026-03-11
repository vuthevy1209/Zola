package com.zola.configuration;

import com.zola.entity.Role;
import com.zola.entity.User;
import com.zola.enums.PredefinedRole;
import com.zola.repository.RoleRepository;
import com.zola.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
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
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("ApplicationInitConfig initialized - PostgreSQL detected");

        return args -> {
            if (userRepository.findByUsername(ADMIN_USERNAME).isEmpty()) {
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
        };
    }
}