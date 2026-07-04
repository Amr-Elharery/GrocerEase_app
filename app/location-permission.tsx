import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

export default function LocationPermissionScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
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
      style={{ backgroundColor: tokens.background }}
    >
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
          Enable Your Location
        </Text>
        <Text
          className="text-center mb-10"
          style={{ color: tokens.mutedForeground }}
        >
          We use your location to show you shops near you and deliver your
          orders to the right place.
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
              Enable Location
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
