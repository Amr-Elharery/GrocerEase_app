import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";

export default function LocationPickerScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [display, setDisplay] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchAddress = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "grocery-app" } },
      );
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectFromSearch = (item: any) => {
    setCoords({ latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
    setDisplay(item.display_name);
    setQuery(item.display_name);
    setResults([]);
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        alert(t("addresses.locationPicker.permissionRequired"));
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "User-Agent": "grocery-app" } },
        );
        const data = await response.json();
        setDisplay(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setQuery(data.display_name || "");
      } catch {
        setDisplay(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }

      setCoords({ latitude, longitude });
    } catch {
      alert(t("addresses.locationPicker.locationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!coords) return;
    router.push({
      pathname: "/address-details-form",
      params: {
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
        display,
      },
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View className="flex-1 px-6 py-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full mb-4"
          style={{ backgroundColor: tokens.muted }}
        >
          <BackIcon variant="chevron" size={22} color={tokens.foreground} />
        </TouchableOpacity>

        <Text
          className="text-3xl font-bold mb-2"
          style={{ color: tokens.foreground }}
        >
          {t("addresses.locationPicker.title")}
        </Text>
        <Text className="mb-5" style={{ color: tokens.mutedForeground }}>
          {t("addresses.locationPicker.subtitle")}
        </Text>

        <TextInput
          value={query}
          onChangeText={searchAddress}
          placeholder={t("addresses.newAddressForm.searchPlaceholder")}
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-3"
          style={{
            borderColor: tokens.border,
            color: tokens.foreground,
            backgroundColor: tokens.input,
          }}
        />

        {searching && (
          <Text
            className="text-sm mt-1"
            style={{ color: tokens.mutedForeground }}
          >
            {t("addresses.newAddressForm.searching")}
          </Text>
        )}

        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            style={{ maxHeight: 220, marginTop: 8 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => selectFromSearch(item)}
                className="py-3 border-b"
                style={{ borderColor: tokens.border }}
              >
                <Text style={{ color: tokens.foreground }}>
                  {item.display_name}
                </Text>
              </Pressable>
            )}
          />
        )}

        <TouchableOpacity
          onPress={useCurrentLocation}
          disabled={loading}
          className="mt-5 p-4 rounded-xl flex-row justify-center items-center"
          style={{ backgroundColor: tokens.primary + "20" }}
        >
          {loading ? (
            <ActivityIndicator color={tokens.primary} />
          ) : (
            <>
              <MapPin size={20} color={tokens.primary} />
              <Text className={isRTL ? "mr-2 font-semibold" : "ml-2 font-semibold"} style={{ color: tokens.primary }}>
                {t("addresses.locationPicker.useCurrentLocation")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {coords && (
          <Text
            className="text-sm mt-4"
            style={{ color: tokens.mutedForeground }}
          >
            {t("addresses.locationPicker.selected", { location: display || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` })}
          </Text>
        )}

        <View className="flex-1" />

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!coords}
          className="p-4 rounded-2xl items-center"
          style={{
            backgroundColor: coords ? tokens.primary : tokens.muted,
          }}
        >
          <Text
            className="font-bold text-lg"
            style={{
              color: coords ? tokens.primaryForeground : tokens.mutedForeground,
            }}
          >
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
