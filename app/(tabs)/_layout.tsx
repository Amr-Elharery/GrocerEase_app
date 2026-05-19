 import { THEME } from '@/lib/theme';
import { useTheme } from '@/lib/theme-context';
import { CartProvider } from '@/lib/context/cartContext';

import { Tabs } from 'expo-router';

import {
  ShoppingCart,
  Bell,
  ClipboardList,
  Home,
  ShoppingBag,
  User,
} from 'lucide-react-native';

export default function TabsLayout() {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  const iconColor = tokens.foreground;
  const inactiveColor = tokens.mutedForeground;

  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: iconColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: tokens.background,
            borderTopColor: tokens.border,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => (
              <ShoppingBag size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="shopping-list"
          options={{
            title: 'Lists',
            tabBarIcon: ({ color, size }) => (
              <ClipboardList size={size} color={color} />
            ),
          }}
        />

      <Tabs.Screen
  name="cart"
  options={{
    title: "Cart",
    tabBarIcon: ({ color, size }) => (
      <ShoppingCart size={size} color={color} />
    ),
  }}
/>

        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Watchlist',
            tabBarIcon: ({ color, size }) => (
              <Bell size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </CartProvider>
  );
}