import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Truck } from "lucide-react-native";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();

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
          {t("welcome.appName")}
        </Text>
        <Text
          className="text-center mb-16"
          style={{ color: tokens.mutedForeground }}
        >
          {t("welcome.tagline")}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          className="py-4 rounded-2xl mb-3"
          style={{ backgroundColor: tokens.primary }}
        >
          <Text
            className="text-center text-lg font-bold"
            style={{ color: tokens.primaryForeground }}
          >
            {t("auth.login.title")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/sign-up")}
          className="py-4 rounded-2xl border mb-10"
          style={{ borderColor: tokens.border }}
        >
          <Text
            className="text-center text-lg font-bold"
            style={{ color: tokens.foreground }}
          >
            {t("auth.signUp.title")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/driver/register")}
          className="flex-row items-center justify-center"
        >
          <Truck size={16} color={tokens.mutedForeground} />
          <Text
            className={isRTL ? "mr-2 text-sm" : "ml-2 text-sm"}
            style={{ color: tokens.mutedForeground }}
          >
            {t("welcome.registerAsDriver")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
