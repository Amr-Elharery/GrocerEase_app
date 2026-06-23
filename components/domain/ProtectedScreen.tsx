/**
 * Protected Screen Component
 * Wraps screens that require authentication
 * Shows login message if user is not logged in
 */

import { useAuth } from "@/lib/auth-context";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "expo-router";
import { Lock, LogIn } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProtectedScreenProps {
  children: React.ReactNode;
  screenName?: string;
}

export function ProtectedScreen({
  children,
  screenName = "This feature",
}: ProtectedScreenProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: tokens.background }}
        className="flex-1 justify-center items-center"
      >
        <Text style={{ color: tokens.foreground }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView
        style={{ backgroundColor: tokens.background }}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="items-center">
          {/* Lock Icon */}
          <View
            className="w-20 h-20 rounded-full mb-6 justify-center items-center"
            style={{ backgroundColor: tokens.primary + "20" }}
          >
            <Lock size={40} color={tokens.primary} />
          </View>

          {/* Title */}
          <Text
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: tokens.foreground }}
          >
            Login Required
          </Text>

          {/* Message */}
          <Text
            className="text-base text-center mb-8"
            style={{ color: tokens.mutedForeground }}
          >
            {screenName} requires you to be logged in. Please login to continue.
          </Text>

          {/* Login Button */}
          <Pressable
            onPress={() => router.push("/login")}
            className="py-3 px-8 rounded-lg flex-row items-center"
            style={{ backgroundColor: tokens.primary }}
          >
            <LogIn size={20} color={tokens.background} />
            <Text
              className="ml-2 font-semibold text-base"
              style={{ color: tokens.background }}
            >
              Go to Login
            </Text>
          </Pressable>

          {/* Sign Up Link */}
          <Pressable onPress={() => router.push("/sign-up")} className="mt-4">
            <Text
              className="text-base font-semibold"
              style={{ color: tokens.primary }}
            >
              Don't have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
