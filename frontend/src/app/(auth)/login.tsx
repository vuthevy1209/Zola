import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const { signIn } = useAuth();
    const theme = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Vui lòng nhập tên đăng nhập/số điện thoại và mật khẩu');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await authService.login(email, password);
            await signIn(response);
        } catch (err: any) {

            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.formContainer}>
                <Text variant="displaySmall" style={styles.title}>Đăng nhập</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>Chào mừng bạn trở lại với Zola</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    label="Tên đăng nhập hoặc Số điện thoại"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="default"
                    style={styles.input}
                    mode="outlined"
                />

                <TextInput
                    label="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    mode="outlined"
                    right={
                        <TextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(v => !v)}
                        />
                    }
                />

                <View style={styles.forgotPasswordContainer}>
                    <Text
                        style={{ color: theme.colors.primary }}
                        onPress={() => router.push('/(auth)/forgot-password')}
                    >
                        Quên mật khẩu?
                    </Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Đăng nhập
                </Button>

                <View style={styles.registerContainer}>
                    <Text>Chưa có tài khoản? </Text>
                    <Text
                        style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        Đăng ký ngay
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.7,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
        textAlign: 'center',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    }
});
