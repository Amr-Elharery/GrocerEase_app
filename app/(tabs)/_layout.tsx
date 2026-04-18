import { THEME } from '@/lib/theme';
import { useTheme } from '@/lib/theme-context';
import { Tabs } from 'expo-router';
import {
  BarChart3,
  ClipboardList,
  Home,
  Search,
  User,
} from 'lucide-react-native';

export default function TabsLayout() {
  const { theme } = useTheme();
  const tokens = THEME[theme];

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
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
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
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
