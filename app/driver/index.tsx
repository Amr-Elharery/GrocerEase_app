import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { ClipboardList, ListChecks, LogOut, User as UserIcon } from "lucide-react-native";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useToast } from "@/lib/toast/useToast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/auth-context";
import {
  fetchMyDeliveryProfile,
  updateAvailability,
} from "@/features/driver/services/delivery.service";
import { DeliveryProfile } from "@/features/driver/types";

export default function DriverHomeScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const showToast = useToast();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyDeliveryProfile();
      setProfile(data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        router.replace("/driver/create-profile");
        return;
      }
      showToast(t("driver.home.couldNotLoadProfile"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleToggleAvailability = async (value: boolean) => {
    if (!profile) return;
    setTogglingAvailability(true);
    setProfile({ ...profile, is_available: value });
    try {
      const updated = await updateAvailability(value);
      setProfile(updated);
    } catch {
      setProfile({ ...profile, is_available: !value });
      showToast(t("driver.home.couldNotUpdateAvailability"), "error");
    } finally {
      setTogglingAvailability(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokens.background }}
      >
        <ActivityIndicator size="large" color={tokens.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View
        className="flex-row items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: tokens.border }}
      >
        <View>
          <Text
            className="text-2xl font-bold"
            style={{ color: tokens.foreground }}
          >
            {profile?.full_name ?? t("driver.home.defaultName")}
          </Text>
          <Text style={{ color: tokens.mutedForeground }}>
            {profile?.is_available ? t("driver.home.online") : t("driver.home.offline")}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text
            className={isRTL ? "ml-2 font-medium" : "mr-2 font-medium"}
            style={{
              color: profile?.is_available ? tokens.primary : tokens.mutedForeground,
            }}
          >
            {profile?.is_available ? t("driver.home.online") : t("driver.home.offline")}
          </Text>
          <Switch
            value={!!profile?.is_available}
            onValueChange={handleToggleAvailability}
            disabled={togglingAvailability}
            trackColor={{ true: tokens.primary, false: tokens.muted }}
          />
          <TouchableOpacity onPress={logout} className={isRTL ? "mr-4" : "ml-4"}>
            <LogOut size={22} color={tokens.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-4">
        <TouchableOpacity
          onPress={() => router.push("/driver/available")}
          disabled={!profile?.is_available}
          className={isRTL ? "flex-row-reverse items-center rounded-2xl border p-4 mb-3" : "flex-row items-center rounded-2xl border p-4 mb-3"}
          style={{
            borderColor: tokens.border,
            backgroundColor: tokens.card,
            opacity: profile?.is_available ? 1 : 0.5,
          }}
        >
          <ListChecks size={22} color={tokens.primary} />
          <View className={isRTL ? "mr-3" : "ml-3"}>
            <Text
              className="text-lg font-semibold"
              style={{ color: tokens.foreground }}
            >
              {t("driver.home.availableJobs")}
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              {profile?.is_available
                ? t("driver.home.browseJobsInArea")
                : t("driver.home.goOnlineToSee")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/driver/my-deliveries")}
          className={isRTL ? "flex-row-reverse items-center rounded-2xl border p-4 mb-3" : "flex-row items-center rounded-2xl border p-4 mb-3"}
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <ClipboardList size={22} color={tokens.primary} />
          <View className={isRTL ? "mr-3" : "ml-3"}>
            <Text
              className="text-lg font-semibold"
              style={{ color: tokens.foreground }}
            >
              {t("driver.home.myDeliveries")}
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              {t("driver.home.trackActiveJobs")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/driver/profile")}
          className={isRTL ? "flex-row-reverse items-center rounded-2xl border p-4" : "flex-row items-center rounded-2xl border p-4"}
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <UserIcon size={22} color={tokens.primary} />
          <View className={isRTL ? "mr-3" : "ml-3"}>
            <Text
              className="text-lg font-semibold"
              style={{ color: tokens.foreground }}
            >
              {t("driver.home.myProfile")}
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              {t("driver.home.ratingDeliveries", {
                rating: profile?.rating ?? "—",
                count: profile?.total_deliveries ?? 0,
              })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
