import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import { THEME, useTheme } from "@/lib/theme";

export default function LocationPermissionScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();
  const [requesting, setRequesting] = useState(false);

  const handleEnableLocation = async () => {
    try {
      setRequesting(true);
      await Location.requestForegroundPermissionsAsync();
    } finally {
      setRequesting(false);
      router.replace("/location-picker");
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View className="px-4 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: tokens.muted }}
        >
          <BackIcon variant="chevron" size={22} color={tokens.foreground} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center px-8">
        <View
          className="h-24 w-24 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: tokens.primary + "20" }}
        >
          <MapPin size={40} color={tokens.primary} />
        </View>

        <Text
          className="text-2xl font-bold text-center mb-3"
          style={{ color: tokens.foreground }}
        >
          {t("addresses.locationPermission.title")}
        </Text>
        <Text
          className="text-center mb-10"
          style={{ color: tokens.mutedForeground }}
        >
          {t("addresses.locationPermission.subtitle")}
        </Text>

        <TouchableOpacity
          onPress={handleEnableLocation}
          disabled={requesting}
          className="w-full py-4 rounded-2xl items-center"
          style={{ backgroundColor: tokens.primary }}
        >
          {requesting ? (
            <ActivityIndicator color={tokens.primaryForeground} />
          ) : (
            <Text
              className="text-lg font-bold"
              style={{ color: tokens.primaryForeground }}
            >
              {t("addresses.locationPermission.enableButton")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
