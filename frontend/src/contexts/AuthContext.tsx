import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { UserProfile, AuthResponse } from '../services/auth.service';
import { useRouter, useSegments } from 'expo-router';
import { useRealm, useQuery } from '../storage/realm';
import { UserProfile as RealmUserProfile } from '../storage/realm';

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    signIn: (data: AuthResponse) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserContext: (user: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

function useProtectedRoute(user: UserProfile | null, isLoading: boolean) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, segments, isLoading]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const realm = useRealm();
    const realmUser = useQuery(RealmUserProfile)[0]; // Realm is reactive, this updates automatically
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Sync realm user to local state for easier consumption
    useEffect(() => {
        if (realmUser) {
            setUser({
                id: realmUser.id,
                username: realmUser.username,
                firstName: realmUser.firstName,
                lastName: realmUser.lastName,
                email: realmUser.email,
                phone: realmUser.phone,
                avatarUrl: realmUser.avatarUrl,
                role: realmUser.role,
                createdAt: realmUser.createdAt,
            });
        } else {
            setUser(null);
        }
    }, [realmUser]);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('userToken');
                if (!storedToken) {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    useProtectedRoute(user, isLoading);

    const signIn = async (authData: AuthResponse) => {
        try {
            await SecureStore.setItemAsync('userToken', authData.accessToken);
            await SecureStore.setItemAsync('refreshToken', authData.refreshToken);

            // Save to Realm
            realm.write(() => {
                const allUsers = realm.objects('UserProfile');
                realm.delete(allUsers);

                realm.create('UserProfile', {
                    id: authData.user.id.toString(),
                    username: authData.user.username,
                    firstName: authData.user.firstName,
                    lastName: authData.user.lastName,
                    email: authData.user.email,
                    phone: authData.user.phone,
                    avatarUrl: authData.user.avatarUrl || null,
                    role: authData.user.role,
                    createdAt: authData.user.createdAt,
                });
            });
        } catch (error) {
            console.error('Failed to save session:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('refreshToken');

            realm.write(() => {
                const allUsers = realm.objects('UserProfile');
                realm.delete(allUsers);
            });
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    };

    const updateUserContext = async (updatedUser: UserProfile) => {
        try {
            realm.write(() => {
                realm.create('UserProfile', {
                    id: updatedUser.id.toString(),
                    username: updatedUser.username,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    avatarUrl: updatedUser.avatarUrl || null,
                    role: updatedUser.role,
                    createdAt: updatedUser.createdAt,
                }, Realm.UpdateMode.Modified);
            });
        } catch (error) {
            console.error('Failed to update session:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUserContext }}>
            {children}
        </AuthContext.Provider>
    );
}
