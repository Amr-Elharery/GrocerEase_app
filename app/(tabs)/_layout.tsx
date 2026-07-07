import { THEME, useTheme } from '@/lib/theme';

import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  ShoppingCart,
  ClipboardList,
  Home,
  ShoppingBag,
  User,
  Store,
} from 'lucide-react-native';

export default function TabsLayout() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();

  const iconColor = tokens.foreground;
  const inactiveColor = tokens.mutedForeground;

  return (
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
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shops"
        options={{
          title: t('tabs.shops'),
          tabBarIcon: ({ color, size }) => (
            <Store size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.products'),
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shopping-list"
        options={{
          title: t('tabs.lists'),
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}