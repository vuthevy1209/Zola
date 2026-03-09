import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '@/services/auth.service';

const OTP_RESEND_SECONDS = 60;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&*()\{\}\[\]!~`|])(?=.*\d).*$/;

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [identifier, setIdentifier] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const startCountdown = () => {
        setCountdown(OTP_RESEND_SECONDS);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // ── Step 1: Send OTP ───────────────────────────────────────────────────────
    const handleSendOTP = async () => {
        if (!identifier.trim()) {
            setError('Vui lòng nhập tên đăng nhập, số điện thoại hoặc email');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const masked = await authService.initForgotPassword(identifier.trim());
            setMaskedEmail(masked);
            setStep(2);
            startCountdown();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không tìm thấy tài khoản. Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Resend OTP ─────────────────────────────────────────────────────
    const handleResendOTP = async () => {
        if (countdown > 0) return;
        setLoading(true);
        setError('');
        try {
            const masked = await authService.initForgotPassword(identifier.trim());
            setMaskedEmail(masked);
            setOtp('');
            startCountdown();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã OTP.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2 → 3: Accept OTP (no API call yet) ──────────────────────────────
    const handleConfirmOTP = () => {
        if (otp.trim().length !== 6) {
            setError('Vui lòng nhập đúng mã OTP 6 chữ số');
            return;
        }
        setError('');
        setStep(3);
    };

    // ── Step 3: Reset password ─────────────────────────────────────────────────
    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ mật khẩu');
            return;
        }
        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        if (!PASSWORD_REGEX.test(newPassword)) {
            setError('Mật khẩu phải có chữ hoa, chữ thường, chữ số và ký tự đặc biệt');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authService.resetPassword(identifier.trim(), otp.trim(), newPassword);
            setStep(4);
        } catch (err: any) {
            const msg = err.response?.data?.message || '';
            // OTP expired/wrong → go back to OTP step
            if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('invalid')) {
                setError('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
                setStep(2);
                setOtp('');
            } else {
                setError(msg || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 3) { setStep(2); setError(''); }
        else if (step === 2) { setStep(1); setError(''); setOtp(''); setMaskedEmail(''); }
        else router.back();
    };

    // ── Step 4: Success ──────────────────────────────────────────────────────
    if (step === 4) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.successContainer}>
                    <View style={[styles.successIconCircle, { backgroundColor: '#F0FFF4' }]}>
                        <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
                    </View>
                    <Text style={styles.successTitle}>Thành công!</Text>
                    <Text style={styles.successSubtitle}>
                        Mật khẩu của bạn đã được đặt lại. Hãy đăng nhập bằng mật khẩu mới.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => router.replace('/(auth)/login')}
                        style={styles.successBtn}
                        labelStyle={styles.saveBtnLabel}
                        buttonColor={theme.colors.primary}
                    >
                        Về Đăng nhập
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    // ── Step 1: identifier entry (classic auth layout) ───────────────────────
    if (step === 1) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: theme.colors.background }]}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        <Text variant="displaySmall" style={styles.title}>Quên mật khẩu</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>
                            Nhập thông tin tài khoản để nhận mã xác nhận
                        </Text>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TextInput
                            label="Tên đăng nhập, SĐT hoặc email"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                            style={styles.outlinedInput}
                            mode="outlined"
                        />
                        <Button
                            mode="contained"
                            onPress={handleSendOTP}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        >
                            Gửi mã xác nhận
                        </Button>

                        <View style={styles.loginContainer}>
                            <Text>Nhớ mật khẩu? </Text>
                            <Text
                                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                                onPress={() => router.push('/(auth)/login')}
                            >
                                Đăng nhập ngay
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    // ── Step 2 & 3: OTP + new password (same layout as change-password) ──────
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1D1D1D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quên mật khẩu</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Info banner */}
                    <View style={styles.infoBanner}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={32} color={theme.colors.primary} />
                        <Text style={styles.infoText}>
                            {step === 2
                                ? `Mã OTP đã gửi đến\n${maskedEmail}`
                                : 'Đặt mật khẩu mới cho tài khoản'}
                        </Text>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* ── Step 2: OTP ──────────────────────────────────── */}
                    {step === 2 && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mã OTP</Text>
                                <TextInput
                                    value={otp}
                                    onChangeText={text => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    placeholder="Nhập mã 6 chữ số"
                                    style={styles.input}
                                    textColor="#1D1D1D"
                                    cursorColor="#1D1D1D"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    theme={{ colors: { background: 'transparent' } }}
                                />
                                <View style={styles.bottomLine} />
                            </View>

                            <View style={styles.resendRow}>
                                <Text style={styles.resendLabel}>Không nhận được mã? </Text>
                                {countdown > 0 ? (
                                    <Text style={styles.countdown}>Gửi lại sau {countdown}s</Text>
                                ) : (
                                    <Text
                                        style={[styles.resendLink, { color: theme.colors.primary }]}
                                        onPress={handleResendOTP}
                                    >
                                        Gửi lại
                                    </Text>
                                )}
                            </View>
                        </>
                    )}

                    {/* ── Step 3: New password ─────────────────────────── */}
                    {step === 3 && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu mới</Text>
                                <TextInput
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                    style={styles.input}
                                    textColor="#1D1D1D"
                                    cursorColor="#1D1D1D"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    theme={{ colors: { background: 'transparent' } }}
                                    right={
                                        <TextInput.Icon
                                            icon={showNewPassword ? 'eye-off' : 'eye'}
                                            onPress={() => setShowNewPassword(v => !v)}
                                            color="#999"
                                        />
                                    }
                                />
                                <View style={styles.bottomLine} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    style={styles.input}
                                    textColor="#1D1D1D"
                                    cursorColor="#1D1D1D"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    theme={{ colors: { background: 'transparent' } }}
                                    right={
                                        <TextInput.Icon
                                            icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                            onPress={() => setShowConfirmPassword(v => !v)}
                                            color="#999"
                                        />
                                    }
                                />
                                <View style={styles.bottomLine} />
                            </View>

                            <Text style={styles.hint}>
                                Mật khẩu gồm ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.
                            </Text>
                        </>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    {step === 2 ? (
                        <Button
                            mode="contained"
                            onPress={handleConfirmOTP}
                            disabled={loading || otp.length !== 6}
                            style={styles.saveBtn}
                            labelStyle={styles.saveBtnLabel}
                            buttonColor={theme.colors.primary}
                        >
                            Tiếp tục
                        </Button>
                    ) : (
                        <Button
                            mode="contained"
                            onPress={handleResetPassword}
                            loading={loading}
                            disabled={loading}
                            style={styles.saveBtn}
                            labelStyle={styles.saveBtnLabel}
                            buttonColor={theme.colors.primary}
                        >
                            Đặt lại mật khẩu
                        </Button>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },

    // ── Step 1 (classic auth layout) ──────────────────────────────────────────
    scrollContainer: { flexGrow: 1 },
    formContainer: { flex: 1, justifyContent: 'center', padding: 24 },
    title: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    subtitle: { textAlign: 'center', marginBottom: 32, opacity: 0.7, lineHeight: 22 },
    outlinedInput: { marginBottom: 16 },
    button: { marginTop: 8, paddingVertical: 6 },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },

    // ── Steps 2 & 3 (same as change-password) ─────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D1D1D' },
    content: { paddingHorizontal: 30, paddingTop: 16, paddingBottom: 20 },
    infoBanner: {
        alignItems: 'center',
        backgroundColor: '#F5F9FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        gap: 10,
    },
    infoText: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22 },
    errorText: { color: '#D32F2F', fontSize: 13, textAlign: 'center', marginBottom: 16 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 12, color: '#A0A0A0', marginBottom: -5, fontWeight: '500' },
    input: {
        height: 45, paddingHorizontal: 0,
        backgroundColor: 'transparent', fontSize: 16, fontWeight: '500',
    },
    bottomLine: { height: 1, backgroundColor: '#EAEAEA', width: '100%' },
    resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: -12, marginBottom: 24 },
    resendLabel: { fontSize: 13, color: '#666' },
    resendLink: { fontSize: 13, fontWeight: 'bold' },
    countdown: { fontSize: 13, color: '#999' },
    hint: { fontSize: 12, color: '#888', lineHeight: 18, marginTop: -8 },
    footer: { paddingHorizontal: 30, paddingBottom: 40, paddingTop: 10 },
    saveBtn: { borderRadius: 30, paddingVertical: 8 },
    saveBtnLabel: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },

    // ── Step 4: Success ───────────────────────────────────────────────────────
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
    successIconCircle: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#1D1D1D' },
    successSubtitle: {
        fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 8,
    },
    successBtn: { borderRadius: 30, paddingVertical: 8, width: '100%' },
});
