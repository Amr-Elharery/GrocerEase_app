import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { ThemeSwitcher } from "@/components/domain/theme-switcher";
import { useAuth } from "@/lib/auth-context";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "expo-router";
import { ChevronRight, Lock, LogOut, Mail, User } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { user, logout, isLoading } = useAuth();

  // Use actual user data from auth context or fallback
  const userProfile = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    phone: user?.phone || "+1 (555) 123-4567",
  
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedScreen screenName="Profile">
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
          {/* Header */}
          <View className="py-4 mb-6">
            <Text className="text-foreground text-2xl font-bold">Profile</Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Manage your account preferences.
            </Text>
          </View>

          {/* User Profile Section */}
          <View
            className="p-4 rounded-lg border mb-6"
            style={{
              backgroundColor: tokens.muted,
              borderColor: tokens.border,
            }}
          >
            {/* Profile Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-16 h-16 rounded-full flex-center justify-center"
                  style={{ backgroundColor: tokens.primary }}
                >
                  <User size={32} color={tokens.primaryForeground} />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: tokens.foreground }}
                  >
                    {userProfile.name}
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View
              className="border-t pt-4"
              style={{ borderTopColor: tokens.border }}
            >
              {/* Email */}
              <View className="flex-row items-center mb-4">
                <Mail size={20} color={tokens.mutedForeground} />
                <View className="ml-3 flex-1">
                  <Text
                    className="text-xs"
                    style={{ color: tokens.mutedForeground }}
                  >
                    Email
                  </Text>
                  <Text
                    className="text-sm font-medium mt-1"
                    style={{ color: tokens.foreground }}
                  >
                    {userProfile.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: tokens.foreground }}
            >
              Security
            </Text>
            <Pressable
              onPress={handleChangePassword}
              className="flex-row items-center justify-between p-4 rounded-lg border mb-3"
              style={{
                backgroundColor: tokens.background,
                borderColor: tokens.border,
              }}
            >
              <View className="flex-row items-center flex-1">
                <Lock size={20} color={tokens.primary} />
                <Text
                  className="text-base font-medium ml-3"
                  style={{ color: tokens.foreground }}
                >
                  Change Password
                </Text>
              </View>
              <ChevronRight size={20} color={tokens.mutedForeground} />
            </Pressable>
          </View>

          {/* Preferences Section */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-3"
              style={{ color: tokens.foreground }}
            >
              Preferences
            </Text>
            <ThemeSwitcher />
          </View>

          {/* Logout Section */}
          <View>
            <Pressable
              onPress={handleLogout}
              disabled={isLoading}
              className="flex-row items-center justify-center p-4 rounded-lg opacity-100"
              style={{
                backgroundColor: tokens.destructive,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <LogOut size={20} color={tokens.background} />
              <Text
                className="text-base font-semibold ml-2"
                style={{ color: tokens.background }}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
