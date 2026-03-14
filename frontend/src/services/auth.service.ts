import api from './api';

export interface UserProfile {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    role: string;
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
}

export const authService = {
    async register(data: { username: string, email: string, phone: string, firstName: string, lastName: string, password: string }): Promise<void> {
        await api.post('/auth/register', data);
    },

    async verifyOTPAndRegister(email: string, otp: string): Promise<AuthResponse> {
        const response = await api.post('/auth/register/verify', {
            email,
            otpCode: otp,
            type: 'REGISTER'
        });
        return response.data.result;
    },

    async login(phone_or_email: string, password: string): Promise<AuthResponse> {
        const response = await api.post('/auth/login', {
            identifier: phone_or_email,
            password: password
        });
        return response.data.result;
    },

    async forgotPassword(email: string): Promise<void> {
        await api.post('/otp/send', {
            email,
            type: 'RESET_PASSWORD'
        });
    },

    async initForgotPassword(identifier: string): Promise<string> {
        const response = await api.post('/auth/forgot-password/init', { identifier });
        return response.data.result;
    },

    async verifyForgotPasswordOtp(identifier: string, otp: string): Promise<string> {
        const response = await api.post('/auth/forgot-password/verify', { identifier, otpCode: otp });
        return response.data.result.resetToken;
    },

    async resetForgotPassword(identifier: string, resetToken: string, newPassword: string): Promise<void> {
        await api.post('/auth/forgot-password/reset', {
            identifier,
            resetToken,
            newPassword
        });
    },

    async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await api.patch('/profile/update', data);
        return response.data.result;
    },

    async getMyProfile(): Promise<UserProfile> {
        const response = await api.get('/profile/my');
        return response.data.result;
    },

    async sendChangePasswordOtp(): Promise<void> {
        await api.post('/profile/send-change-password-otp');
    },

    async changePassword(otpCode: string, newPassword: string): Promise<void> {
        await api.post('/profile/change-password', { otpCode, newPassword });
    },

    async uploadAvatar(imageUri: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'avatar.jpg',
        } as any);
        const response = await api.post('/profile/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.result;
    },
};
