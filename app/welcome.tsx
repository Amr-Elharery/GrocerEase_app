import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Truck } from "lucide-react-native";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: tokens.background }}
    >
      <View className="flex-1 justify-center px-8">
        <Text
          className="text-5xl font-extrabold text-center mb-3"
          style={{ color: tokens.primary }}
        >
          Zad
        </Text>
        <Text
          className="text-center mb-16"
          style={{ color: tokens.mutedForeground }}
        >
          Groceries from your favorite shops, delivered to your door
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="py-4 rounded-2xl mb-3"
          style={{ backgroundColor: tokens.primary }}
        >
          <Text
            className="text-center text-lg font-bold"
            style={{ color: tokens.primaryForeground }}
          >
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/sign-up")}
          className="py-4 rounded-2xl border mb-10"
          style={{ borderColor: tokens.border }}
        >
          <Text
            className="text-center text-lg font-bold"
            style={{ color: tokens.foreground }}
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/driver/register")}
          className="flex-row items-center justify-center"
        >
          <Truck size={16} color={tokens.mutedForeground} />
          <Text
            className="ml-2 text-sm"
            style={{ color: tokens.mutedForeground }}
          >
            Register as a Delivery Driver
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
