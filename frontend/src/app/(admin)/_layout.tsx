import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function AdminLayout() {
    const theme = useTheme();

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.primary, headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Tổng quan',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Sản phẩm',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="package-variant-closed" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Đơn hàng',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="feedbacks"
                options={{
                    title: 'Đánh giá',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="star-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="product-form"
                options={{ href: null }}
            />
        </Tabs>
    );
}
