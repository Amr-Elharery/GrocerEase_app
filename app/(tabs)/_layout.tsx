 
 
 
 import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 70, backgroundColor: "#e5e5e5" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ tabBarIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#1e3a8a",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30
            }}>
              <Ionicons name="receipt-outline" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{ tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={28} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={28} color={color} /> }}
      />
    </Tabs>
  );
}
