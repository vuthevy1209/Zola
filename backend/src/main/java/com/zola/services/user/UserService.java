package com.zola.services.user;

import com.zola.dto.request.UserCreationRequest;
import com.zola.dto.response.UserResponse;

public interface UserService {
    UserResponse createUser(UserCreationRequest request);
}
