package com.zola.services.profile;

import com.zola.dto.request.auth.password.ChangePasswordRequest;
import com.zola.dto.request.profile.*;
import com.zola.dto.response.profile.UserProfileResponse;

import org.springframework.web.multipart.MultipartFile;

public interface UserProfileService {
    UserProfileResponse getMyProfile();

    UserProfileResponse updateProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

    void sendChangePasswordOtp();

    void changeEmail(ChangeEmailRequest request);

    void changePhone(ChangePhoneRequest request);

    String uploadAvatar(MultipartFile file);
}
