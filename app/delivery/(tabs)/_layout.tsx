import { useTheme } from "@/lib/theme-context";
import { Tabs } from "expo-router";
import { Home, Package, User } from "lucide-react-native";

export default function TabsLayout() {
  const { theme } = useTheme();

  const iconColor = theme === "dark" ? "rgb(250 250 250)" : "rgb(13 13 13)";
  const inactiveColor =
    theme === "dark" ? "rgb(115 115 115)" : "rgb(115 115 115)";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor:
            theme === "dark" ? "rgb(32 32 36)" : "rgb(255 255 255)",
          borderTopColor:
            theme === "dark" ? "rgb(75 85 99)" : "rgb(229 231 235)",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
