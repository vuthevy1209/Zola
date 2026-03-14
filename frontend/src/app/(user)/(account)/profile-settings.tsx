import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';

type ModalState = { visible: boolean; success: boolean; message: string };

export default function ProfileSettingsScreen() {
    const { user, updateUserContext } = useAuth();
    const router = useRouter();
    const theme = useTheme();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>({ visible: false, success: true, message: '' });

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setModal({ visible: true, success: false, message: 'Vui lòng cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện.' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.[0]?.uri) return;

        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        setUploadingAvatar(true);
        try {
            const newAvatarUrl = await profileService.uploadAvatar(uri);
            await updateUserContext({ ...user!, avatarUrl: newAvatarUrl });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.';
            setAvatarUri(null);
            setModal({ visible: true, success: false, message: msg });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const hasChanges = useMemo(() => (
        firstName !== (user?.firstName || '') ||
        lastName !== (user?.lastName || '') ||
        phone !== (user?.phone || '')
    ), [firstName, lastName, phone, user]);

    const handleSave = async () => {
        if (!user) return;

        if (!firstName.trim() || !lastName.trim()) {
            setModal({ visible: true, success: false, message: 'Họ và tên không được để trống' });
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await profileService.updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
            });
            await updateUserContext(updatedUser);
            setModal({ visible: true, success: true, message: 'Thông tin cá nhân đã được cập nhật thành công!' });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
            setModal({ visible: true, success: false, message: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModal(m => ({ ...m, visible: false }));
        if (modal.success) router.back();
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1D1D1D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={uploadingAvatar}>
                        <Avatar.Image
                            size={100}
                            source={{ uri: avatarUri || user.avatarUrl || 'https://static.vecteezy.com/system/resources/thumbnails/001/840/618/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg' }}
                            style={styles.avatar}
                        />
                        {uploadingAvatar && (
                            <View style={styles.avatarLoadingOverlay}>
                                <ActivityIndicator color="#FFF" size="small" />
                            </View>
                        )}
                        <View style={styles.cameraIconContainer}>
                            <MaterialCommunityIcons name="camera-outline" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tên đăng nhập</Text>
                            <TextInput
                                value={user?.username || ''}
                                editable={false}
                                style={[styles.input, { opacity: 0.5 }]}
                                textColor="#1D1D1D"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                theme={{ colors: { background: 'transparent' } }}
                            />
                            <View style={styles.bottomLine} />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { marginRight: 8 }]}>
                                <Text style={styles.label}>Họ</Text>
                                <TextInput
                                    value={lastName}
                                    onChangeText={setLastName}
                                    style={styles.input}
                                    textColor="#1D1D1D"
                                    cursorColor="#1D1D1D"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    theme={{ colors: { background: 'transparent' } }}
                                />
                                <View style={styles.bottomLine} />
                            </View>
                            <View style={[styles.inputGroup, { marginLeft: 8 }]}>
                                <Text style={styles.label}>Tên</Text>
                                <TextInput
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    style={styles.input}
                                    textColor="#1D1D1D"
                                    cursorColor="#1D1D1D"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    theme={{ colors: { background: 'transparent' } }}
                                />
                                <View style={styles.bottomLine} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                value={user?.email || ''}
                                editable={false}
                                style={[styles.input, { opacity: 0.5 }]}
                                textColor="#1D1D1D"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                theme={{ colors: { background: 'transparent' } }}
                            />
                            <View style={styles.bottomLine} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                style={styles.input}
                                textColor="#1D1D1D"
                                cursorColor="#1D1D1D"
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                                theme={{ colors: { background: 'transparent' } }}
                            />
                            <View style={styles.bottomLine} />
                        </View>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        disabled={loading || !hasChanges}
                        style={styles.saveBtn}
                        labelStyle={styles.saveBtnLabel}
                        buttonColor={theme.colors.primary}
                    >
                        Lưu thay đổi
                    </Button>
                </View>
            </KeyboardAvoidingView>

            {/* Custom Result Modal */}
            <Modal transparent animationType="fade" visible={modal.visible} onRequestClose={handleModalClose}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={[styles.modalIconContainer, { backgroundColor: modal.success ? '#F0FFF4' : '#FFF0F0' }]}>
                            <MaterialCommunityIcons
                                name={modal.success ? 'check-circle' : 'alert-circle'}
                                size={48}
                                color={modal.success ? '#4CAF50' : '#F44336'}
                            />
                        </View>
                        <Text style={styles.modalTitle}>
                            {modal.success ? 'Thành công!' : 'Có lỗi xảy ra'}
                        </Text>
                        <Text style={styles.modalMessage}>{modal.message}</Text>
                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: modal.success ? theme.colors.primary : '#F44336' }]}
                            onPress={handleModalClose}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.modalBtnText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1D1D1D',
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    avatar: {
        backgroundColor: '#EAEAEA',
    },
    avatarLoadingOverlay: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: '#2b2b2b',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    formContainer: {
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    inputGroup: {
        flex: 1,
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        color: '#A0A0A0',
        marginBottom: -5,
        fontWeight: '500',
    },
    input: {
        height: 45,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomLine: {
        height: 1,
        backgroundColor: '#EAEAEA',
        width: '100%',
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        paddingTop: 10,
    },
    saveBtn: {
        borderRadius: 30,
        paddingVertical: 8,
    },
    saveBtnLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 28,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1D1D1D',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalBtn: {
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 48,
    },
    modalBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});
