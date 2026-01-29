package com.zola.enums;

import lombok.Getter;

@Getter
public enum PredefinedRole {
    USER("USER"),
    SHOPPER("SHOPPER"),;

    private final String roleName;

    PredefinedRole(String roleName) {
        this.roleName = roleName;
    }
}
