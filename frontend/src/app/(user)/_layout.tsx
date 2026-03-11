import { Stack } from 'expo-router';

export default function UserLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(account)/addresses" />
            <Stack.Screen name="(account)/address-form" />
            <Stack.Screen name="(account)/change-password" />
            <Stack.Screen name="(account)/profile-settings" />
            <Stack.Screen name="(shop)/checkout" />
            <Stack.Screen name="(shop)/search" />
            <Stack.Screen name="(shop)/favorites" />
        </Stack>
    );
}
