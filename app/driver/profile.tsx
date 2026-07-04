import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/lib/hooks/useToast";
import { fetchMyDeliveryProfile } from "@/shared/delivery.service";
import { DeliveryProfile } from "@/lib/types/delivery";

const FIELDS: { label: string; key: keyof DeliveryProfile }[] = [
  { label: "Full Name", key: "full_name" },
  { label: "Phone Number", key: "phone_number" },
  { label: "Vehicle Type", key: "vehicle_type" },
  { label: "Vehicle Plate Number", key: "vehicle_plate_number" },
  { label: "National ID", key: "national_id" },
  { label: "City", key: "city" },
  { label: "Address", key: "address" },
];

export default function DriverProfileScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const showToast = useToast();

  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDeliveryProfile()
      .then(setProfile)
      .catch(() => showToast("Could not load profile", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

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
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={tokens.foreground} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ color: tokens.foreground }}
        >
          My Profile
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
              <Text style={{ color: tokens.mutedForeground }}>Rating</Text>
            </View>
            <View className="items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: tokens.foreground }}
              >
                {profile?.total_deliveries ?? 0}
              </Text>
              <Text style={{ color: tokens.mutedForeground }}>Deliveries</Text>
            </View>
          </View>

          {FIELDS.map((field) => (
            <View
              key={field.key}
              className="py-3 border-b"
              style={{ borderColor: tokens.border }}
            >
              <Text
                className="text-sm mb-1"
                style={{ color: tokens.mutedForeground }}
              >
                {field.label}
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
