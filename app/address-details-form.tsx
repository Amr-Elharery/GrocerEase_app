import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useAddress } from "@/lib/context/addressContext";
import { addressService } from "@/shared/address.service";

export default function AddressDetailsFormScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { addresses, addAddress, selectAddress, setDefaultAddress } =
    useAddress();
  const params = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    display?: string;
  }>();

  const [street, setStreet] = useState(params.display ?? "");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [aptNumber, setAptNumber] = useState("");
  const [label, setLabel] = useState("Home");
  const [additionalDirections, setAdditionalDirections] = useState("");
  const [areas, setAreas] = useState<{ id: number; area_name: string }[]>([]);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    addressService.getAreas().then(setAreas);
  }, []);

  const inputStyle = {
    backgroundColor: tokens.background,
    borderColor: tokens.border,
    color: tokens.foreground,
  };

  const handleSubmit = async () => {
    if (!areaId || !street) {
      alert("Please select an area and enter a street.");
      return;
    }

    try {
      setSubmitting(true);
      const isFirstAddress = addresses.length === 0;

      const created = await addressService.createAddress({
        area_id: areaId,
        street,
        building,
        floor,
        apt_number: aptNumber,
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
        label,
        additional_directions: additionalDirections,
      });

      addAddress(created);

      if (created.id) {
        if (isFirstAddress) {
          try {
            await setDefaultAddress(created.id);
          } catch {
            selectAddress(created.id);
          }
        } else {
          selectAddress(created.id);
        }
      }

      router.replace("/(tabs)");
    } catch {
      alert("Could not save your address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-3xl font-bold mb-1"
          style={{ color: tokens.foreground }}
        >
          Address Details
        </Text>
        <Text className="mb-6" style={{ color: tokens.mutedForeground }}>
          Just a few more details for accurate delivery
        </Text>

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Area
        </Text>
        <FlatList
          data={areas}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          renderItem={({ item }) => {
            const isSelected = areaId === item.id;
            return (
              <TouchableOpacity
                onPress={() => setAreaId(item.id)}
                className="px-4 py-2 rounded-full mr-2 border"
                style={{
                  backgroundColor: isSelected ? tokens.primary : tokens.background,
                  borderColor: isSelected ? tokens.primary : tokens.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: isSelected ? tokens.primaryForeground : tokens.foreground,
                  }}
                >
                  {item.area_name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Street
        </Text>
        <TextInput
          value={street}
          onChangeText={setStreet}
          placeholder="Street address"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Building
        </Text>
        <TextInput
          value={building}
          onChangeText={setBuilding}
          placeholder="Building name/number"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Floor
        </Text>
        <TextInput
          value={floor}
          onChangeText={setFloor}
          placeholder="Floor"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Apartment Number
        </Text>
        <TextInput
          value={aptNumber}
          onChangeText={setAptNumber}
          placeholder="Apartment number"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Label
        </Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="e.g., Home, Work"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Additional Directions
        </Text>
        <TextInput
          value={additionalDirections}
          onChangeText={setAdditionalDirections}
          placeholder="Optional directions"
          placeholderTextColor={tokens.mutedForeground}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="border rounded-xl px-4 py-4 min-h-[100px] mb-6"
          style={inputStyle}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: submitting ? tokens.muted : tokens.primary }}
        >
          {submitting ? (
            <ActivityIndicator color={tokens.primaryForeground} />
          ) : (
            <Text
              className="text-lg font-bold"
              style={{ color: tokens.primaryForeground }}
            >
              Save & Continue
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
