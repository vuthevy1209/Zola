import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealmProvider } from '@/storage/realm';


export const unstable_settings = {
    anchor: '(tabs)',
};

const customPaperTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#528F72', // Cart UI green
        secondary: '#2A2A2A', // Cart UI dark button
        background: '#FAFAFA',
        surface: '#FFFFFF',
        surfaceVariant: '#F5F5F5',
        onSurfaceVariant: '#666666',
        outline: '#EAEAEA',
        outlineVariant: '#F0F0F0',
        elevation: {
            level0: 'transparent',
            level1: '#FFFFFF',
            level2: '#FFFFFF',
            level3: '#FFFFFF',
            level4: '#FFFFFF',
            level5: '#FFFFFF',
        },
    },
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (!navigationState?.key) return;
    }, [navigationState?.key]);

    const MyDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: Colors.dark.tint,
            background: Colors.dark.background,
            text: Colors.dark.text,
        },
    };

    const MyLightTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: Colors.light.tint,
            background: customPaperTheme.colors.background,
            text: Colors.light.text,
            card: customPaperTheme.colors.surface,
        },
    };

    return (
        <ThemeProvider value={colorScheme === 'dark' ? MyDarkTheme : MyLightTheme}>
            <PaperProvider theme={customPaperTheme}>
                <RealmProvider>
                    <AuthProvider>
                        <Stack>
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="addresses" options={{ headerShown: false }} />
                        <Stack.Screen name="address-form" options={{ headerShown: false }} />
                        <Stack.Screen
                            name="modal"
                            options={{
                                presentation: 'transparentModal',
                                animation: 'fade',
                                headerShown: false,
                            }}
                        />
                        </Stack>
                    </AuthProvider>
                </RealmProvider>
            </PaperProvider>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
