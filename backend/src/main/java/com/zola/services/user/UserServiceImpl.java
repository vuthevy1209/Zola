package com.zola.services.user;

import com.zola.dto.request.UserCreationRequest;
import com.zola.dto.response.UserResponse;
import com.zola.entity.Role;
import com.zola.entity.User;
import com.zola.enums.PredefinedRole;
import com.zola.exception.AppException;
import com.zola.exception.ErrorCode;
import com.zola.mapper.UserMapper;
import com.zola.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.zola.repository.RoleRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        // check if password and confirmPassword match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        log.info("Creating user with username: {}", request.getUsername());

        User newUser = userMapper.toUserEntity(request);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findById(PredefinedRole.USER)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        newUser.setRole(role);

        try {
            newUser = userRepository.save(newUser);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(newUser);
    }
}
