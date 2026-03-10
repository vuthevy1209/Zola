import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import OtpInput from '@/components/OtpInput';

export default function RegisterScreen() {
    const [step, setStep] = useState<1 | 2>(1);
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const { signIn } = useAuth();
    const theme = useTheme();

    const handleRequestOTP = async () => {
        if (!username || !firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await authService.register({ username, email, phone, firstName, lastName, password });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError('Vui lòng nhập mã OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await authService.verifyOTPAndRegister(email, otp);
            await signIn(response);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'OTP không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <Text variant="displaySmall" style={styles.title}>Đăng ký</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>Tạo tài khoản Zola mới</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {step === 1 ? (
                        <>
                            <TextInput
                                label="Tên đăng nhập"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                style={styles.input}
                                mode="outlined"
                            />

                            <View style={styles.row}>
                                <TextInput
                                    label="Họ"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                                    mode="outlined"
                                />
                                <TextInput
                                    label="Tên"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    style={[styles.input, { flex: 1 }]}
                                    mode="outlined"
                                />
                            </View>

                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                                mode="outlined"
                            />

                            <TextInput
                                label="Số điện thoại"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
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

                            <TextInput
                                label="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                style={styles.input}
                                mode="outlined"
                                right={
                                    <TextInput.Icon
                                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowConfirmPassword(v => !v)}
                                    />
                                }
                            />

                            <Button
                                mode="contained"
                                onPress={handleRequestOTP}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                            >
                                Tiếp tục
                            </Button>
                        </>
                    ) : (
                        <>
                            <Text style={{ marginBottom: 28, textAlign: 'center', color: '#555' }}>
                                Mã OTP đã được gửi đến{' '}
                                <Text style={{ fontWeight: 'bold', color: '#1D1D1D' }}>{email}</Text>
                            </Text>

                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                primaryColor={theme.colors.primary}
                            />

                            <Button
                                mode="contained"
                                onPress={handleVerifyOTP}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                            >
                                Xác nhận & Đăng ký
                            </Button>

                            <Button
                                mode="text"
                                onPress={() => setStep(1)}
                                disabled={loading}
                                style={{ marginTop: 8 }}
                            >
                                Quay lại
                            </Button>
                        </>
                    )}

                    <View style={styles.loginContainer}>
                        <Text>Đã có tài khoản? </Text>
                        <Text
                            style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            Đăng nhập
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
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
    row: {
        flexDirection: 'row',
        marginBottom: 0,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    }
});
