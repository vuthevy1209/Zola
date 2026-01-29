package com.zola.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String username;

    @Column(name = "password")
    String password;

    @Column(name = "first_name")
    String firstName;

    @Column(name = "last_name")
    String lastName;

    @Column(name = "dob")
    LocalDate dob;

    @Column(name = "email", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String email;

    @Column(name = "is_active")
    Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_name", referencedColumnName = "role_name")
    Role role;
}
