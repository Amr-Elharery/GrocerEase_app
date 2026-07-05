import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/features/auth/hooks/auth-context";
import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Lock, LogOut, Mail, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const DisclosureIcon = isRTL ? ChevronLeft : ChevronRight;

  // Use actual user data from auth context or fallback
  const userProfile = {
    name: user?.name || t("profile.defaultName"),
    email: user?.email || "user@example.com",
    phone: user?.phone || "+1 (555) 123-4567",
  };

  const handleChangePassword = () => {
    router.push("/auth/change-password");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedScreen screenName={t("profile.title")}>
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
          {/* Header */}
          <View className="py-4 mb-6">
            <Text className="text-foreground text-2xl font-bold">{t("profile.title")}</Text>
            <Text className="text-muted-foreground text-sm mt-1">
              {t("profile.subtitle")}
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
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: tokens.primary }}
                >
                  <User size={32} color={tokens.primaryForeground} />
                </View>
                <View className={isRTL ? "mr-4 flex-1" : "ml-4 flex-1"}>
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
                <View className={isRTL ? "mr-3 flex-1" : "ml-3 flex-1"}>
                  <Text
                    className="text-xs"
                    style={{ color: tokens.mutedForeground }}
                  >
                    {t("profile.email")}
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
              {t("profile.security")}
            </Text>
            <Pressable
              onPress={() => router.push("/profile-orders")}
              className="flex-row items-center justify-between p-4 rounded-lg border mb-3"
              style={{
                backgroundColor: tokens.background,
                borderColor: tokens.border,
              }}
            >
              <View className="flex-row items-center flex-1">
                <User size={20} color={tokens.primary} />
                <Text
                  className={isRTL ? "text-base font-medium mr-3" : "text-base font-medium ml-3"}
                  style={{ color: tokens.foreground }}
                >
                  {t("profile.myOrders")}
                </Text>
              </View>
              <DisclosureIcon size={20} color={tokens.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={handleChangePassword}
              className="flex-row items-center justify-between p-4 rounded-lg border"
              style={{
                backgroundColor: tokens.background,
                borderColor: tokens.border,
              }}
            >
              <View className="flex-row items-center flex-1">
                <Lock size={20} color={tokens.primary} />
                <Text
                  className={isRTL ? "text-base font-medium mr-3" : "text-base font-medium ml-3"}
                  style={{ color: tokens.foreground }}
                >
                  {t("profile.changePassword")}
                </Text>
              </View>
              <DisclosureIcon size={20} color={tokens.mutedForeground} />
            </Pressable>
          </View>

          {/* Preferences Section */}
          <View className="mb-6 gap-3">
            <Text
              className="text-sm font-semibold"
              style={{ color: tokens.foreground }}
            >
              {t("profile.preferences")}
            </Text>
            <ThemeSwitcher />
            <LanguageSwitcher />
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
                className={isRTL ? "text-base font-semibold mr-2" : "text-base font-semibold ml-2"}
                style={{ color: tokens.background }}
              >
                {isLoading ? t("profile.loggingOut") : t("profile.logout")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
