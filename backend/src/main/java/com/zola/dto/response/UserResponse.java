package com.zola.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    String email;
    String roleName;
}
