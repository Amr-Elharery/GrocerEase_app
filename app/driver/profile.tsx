import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useToast } from "@/lib/toast/useToast";
import { fetchMyDeliveryProfile } from "@/features/driver/services/delivery.service";
import { DeliveryProfile } from "@/features/driver/types";

const FIELD_KEYS: { labelKey: string; key: keyof DeliveryProfile }[] = [
  { labelKey: "driver.createProfile.fullName", key: "full_name" },
  { labelKey: "driver.createProfile.phoneNumber", key: "phone_number" },
  { labelKey: "driver.createProfile.vehicleType", key: "vehicle_type" },
  { labelKey: "driver.createProfile.vehiclePlateNumber", key: "vehicle_plate_number" },
  { labelKey: "driver.createProfile.nationalId", key: "national_id" },
  { labelKey: "driver.createProfile.city", key: "city" },
  { labelKey: "driver.createProfile.address", key: "address" },
];

export default function DriverProfileScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const showToast = useToast();

  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDeliveryProfile()
      .then(setProfile)
      .catch(() => showToast(t("driver.profile.loadFailed"), "error"))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View
        className="flex-row items-center px-4 py-4 border-b"
        style={{ borderColor: tokens.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className={isRTL ? "ml-3" : "mr-3"}>
          <BackIcon variant="chevron" size={24} color={tokens.foreground} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ color: tokens.foreground }}
        >
          {t("driver.profile.title")}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={tokens.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View
            className="flex-row justify-around rounded-2xl border p-4 mb-4"
            style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
          >
            <View className="items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: tokens.foreground }}
              >
                {profile?.rating ?? "—"}
              </Text>
              <Text style={{ color: tokens.mutedForeground }}>{t("driver.profile.rating")}</Text>
            </View>
            <View className="items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: tokens.foreground }}
              >
                {profile?.total_deliveries ?? 0}
              </Text>
              <Text style={{ color: tokens.mutedForeground }}>{t("driver.profile.deliveries")}</Text>
            </View>
          </View>

          {FIELD_KEYS.map((field) => (
            <View
              key={field.key}
              className="py-3 border-b"
              style={{ borderColor: tokens.border }}
            >
              <Text
                className="text-sm mb-1"
                style={{ color: tokens.mutedForeground }}
              >
                {t(field.labelKey)}
              </Text>
              <Text
                className="text-base capitalize"
                style={{ color: tokens.foreground }}
              >
                {String(profile?.[field.key] ?? "—")}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
