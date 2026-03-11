import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.result;

                await SecureStore.setItemAsync('userToken', accessToken);
                await SecureStore.setItemAsync('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Refresh failed - logout user
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('user');
                // You might want to trigger a logout in AuthContext here
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
