package com.zola.entity;

import com.zola.enums.PredefinedRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Role {
    @Id
    @Column(name = "role_name", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    @Enumerated(EnumType.STRING)
    PredefinedRole roleName;

    @Column(name = "description")
    String description;
}
