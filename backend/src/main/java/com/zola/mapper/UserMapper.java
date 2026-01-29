package com.zola.mapper;

import com.zola.dto.request.UserCreationRequest;
import com.zola.dto.response.UserResponse;
import com.zola.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUserEntity(UserCreationRequest request);

    UserResponse toUserResponse(User user);
}
