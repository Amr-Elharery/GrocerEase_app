import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
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
import { THEME, useTheme } from "@/lib/theme";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import { addressService } from "@/features/addresses/services/address.service";

export default function AddressFormScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();
  const { addAddress, selectAddress: selectAddressCtx } = useAddress();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [coords, setCoords] = useState<any>(null);
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [aptNumber, setAptNumber] = useState("");
  const [label, setLabel] = useState("");
  const [additionalDirections, setAdditionalDirections] = useState("");
  const [areas, setAreas] = useState<{ id: number; area_name: string; city_id: number }[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    addressService.getAreas().then(setAreas);
  }, []);

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
        { headers: { "User-Agent": "grocery-app" } }
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectAddressFromSearch = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setCoords({ latitude: lat, longitude: lon });
    setQuery(item.display_name);
    setStreet(item.display_name);
    setResults([]);

    const addr = item.address || {};
    const areaName = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || "";
    if (areaName) {
      const matched = areas.find((a) => a.area_name.toLowerCase() === areaName.toLowerCase());
      if (matched) {
        setSelectedAreaId(matched.id);
      }
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(t("addresses.newAddressForm.permissionDeniedTitle"), t("addresses.newAddressForm.permissionDeniedMessage"));
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "User-Agent": "grocery-app" } }
        );
        if (resp.ok) {
          const data = await resp.json();
          const addr = data.address || {};
          const display = data.display_name || `${addr.road || addr.suburb || ""}, ${addr.city || addr.town || ""}`;
          setQuery(display);
          setStreet(display);
          const areaName = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || "";
          if (areaName) {
            const matched = areas.find((a) => a.area_name.toLowerCase() === areaName.toLowerCase());
            if (matched) {
              setSelectedAreaId(matched.id);
            }
          }
        } else {
          setQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setStreet(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      } catch {
        setQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setStreet(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch {
      Alert.alert(t("common.error"), t("addresses.newAddressForm.locationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAreaId) {
      Alert.alert(t("checkout.missingInfoTitle"), t("addresses.newAddressForm.selectArea"));
      return;
    }
    if (!street) {
      Alert.alert(t("checkout.missingInfoTitle"), t("addresses.newAddressForm.enterStreet"));
      return;
    }
    if (!coords) {
      Alert.alert(t("checkout.missingInfoTitle"), t("addresses.newAddressForm.selectLocation"));
      return;
    }

    const payload = {
      area_id: selectedAreaId,
      street,
      building,
      floor,
      apt_number: aptNumber,
      latitude: coords.latitude,
      longitude: coords.longitude,
      label,
      additional_directions: additionalDirections,
    };

    try {
      setLoading(true);
      const created = await addressService.createAddress(payload);
      const newAddress = { ...payload, id: created.id };
      addAddress(newAddress);
      selectAddressCtx(created.id);
      router.replace("/address-book");
    } catch {
      Alert.alert(t("common.error"), t("addresses.newAddressForm.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full mb-4"
          style={{ backgroundColor: tokens.muted }}
        >
          <BackIcon variant="chevron" size={22} color={tokens.foreground} />
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-foreground text-3xl font-bold" style={{ color: tokens.foreground }}>
            {t("addresses.newAddressForm.title")}
          </Text>
          <Text className="text-muted-foreground mt-1" style={{ color: tokens.mutedForeground }}>
            {t("addresses.newAddressForm.subtitle")}
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <TextInput
              value={query}
              onChangeText={searchAddress}
              placeholder={t("addresses.newAddressForm.searchPlaceholder")}
              placeholderTextColor={tokens.mutedForeground}
              className="border rounded-xl px-4 py-3"
              style={{ borderColor: tokens.border, color: tokens.foreground, backgroundColor: tokens.input }}
            />
          </View>
          <TouchableOpacity
            onPress={useCurrentLocation}
            disabled={loading}
            className="p-3 rounded-xl border"
            style={{ borderColor: tokens.border, backgroundColor: tokens.background }}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <MapPin size={20} color={tokens.primary} />
            )}
          </TouchableOpacity>
        </View>
        {searching && (
          <Text className="text-muted-foreground text-sm mt-1" style={{ color: tokens.mutedForeground }}>
            {t("addresses.newAddressForm.searching")}
          </Text>
        )}

        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            style={{ maxHeight: 200, marginBottom: 16 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => selectAddressFromSearch(item)}
                className="py-3 border-b"
                style={{ borderColor: tokens.border }}
              >
                <Text style={{ color: tokens.foreground }}>{item.display_name}</Text>
              </Pressable>
            )}
          />
        )}

        {coords && (
          <Text className="text-muted-foreground text-sm mb-3" style={{ color: tokens.mutedForeground }}>
            {t("addresses.newAddressForm.location", { lat: coords.latitude.toFixed(6), lon: coords.longitude.toFixed(6) })}
          </Text>
        )}

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("driver.createProfile.area")}
        </Text>
        <View className="mb-4">
          <FlatList
            data={areas}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedAreaId === item.id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedAreaId(item.id)}
                  className="px-4 py-2 rounded-full mr-2 border"
                  style={{
                    backgroundColor: isSelected ? tokens.primary : tokens.background,
                    borderColor: isSelected ? tokens.primary : tokens.border,
                  }}
                >
                  <Text
                    className="font-semibold text-sm"
                    style={{ color: isSelected ? tokens.primaryForeground : tokens.foreground }}
                  >
                    {item.area_name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
         
        </View>

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.street")}
        </Text>
        <TextInput
          value={street}
          onChangeText={setStreet}
          placeholder={t("addresses.newAddressForm.streetPlaceholder")}
          placeholderTextColor="#888"
          className="bg-background border border-border rounded-xl px-4 py-4 text-foreground mb-4"
          style={{ backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.foreground }}
        />

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.building")}
        </Text>
        <TextInput
          value={building}
          onChangeText={setBuilding}
          placeholder={t("addresses.newAddressForm.buildingPlaceholder")}
          placeholderTextColor="#888"
          className="bg-background border border-border rounded-xl px-4 py-4 text-foreground mb-4"
          style={{ backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.foreground }}
        />

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.floor")}
        </Text>
        <TextInput
          value={floor}
          onChangeText={setFloor}
          placeholder={t("addresses.newAddressForm.floor")}
          placeholderTextColor="#888"
          className="bg-background border border-border rounded-xl px-4 py-4 text-foreground mb-4"
          style={{ backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.foreground }}
        />

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.aptNumber")}
        </Text>
        <TextInput
          value={aptNumber}
          onChangeText={setAptNumber}
          placeholder={t("addresses.newAddressForm.aptNumberPlaceholder")}
          placeholderTextColor="#888"
          className="bg-background border border-border rounded-xl px-4 py-4 text-foreground mb-4"
          style={{ backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.foreground }}
        />

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.label")}
        </Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder={t("addresses.newAddressForm.labelPlaceholder")}
          placeholderTextColor="#888"
          className="bg-background border border-border rounded-xl px-4 py-4 text-foreground mb-4"
          style={{ backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.foreground }}
        />

        <Text className="text-muted-foreground mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.additionalDirections")}
        </Text>
        <TextInput
          value={additionalDirections}
          onChangeText={setAdditionalDirections}
          placeholder={t("addresses.newAddressForm.additionalDirectionsPlaceholder")}
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-background border border-border rounded-xl px-4 py-4 text-foreground min-h-[100px] mb-6"
          style={{ backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.foreground }}
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-2xl ${loading ? "bg-gray-400" : "bg-primary"}`}
        >
          <Text className="text-white text-center text-lg font-bold">
            {loading ? t("common.saving") : t("addresses.newAddressForm.saveButton")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
