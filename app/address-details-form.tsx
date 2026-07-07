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
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import { THEME, useTheme } from "@/lib/theme";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import { addressService } from "@/features/addresses/services/address.service";

export default function AddressDetailsFormScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();
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
      alert(t("addresses.detailsForm.selectAreaAndStreet"));
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
      alert(t("addresses.detailsForm.saveFailed"));
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
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full mb-4"
          style={{ backgroundColor: tokens.muted }}
        >
          <BackIcon variant="chevron" size={22} color={tokens.foreground} />
        </TouchableOpacity>

        <Text
          className="text-3xl font-bold mb-1"
          style={{ color: tokens.foreground }}
        >
          {t("addresses.detailsForm.title")}
        </Text>
        <Text className="mb-6" style={{ color: tokens.mutedForeground }}>
          {t("addresses.detailsForm.subtitle")}
        </Text>

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          {t("driver.createProfile.area")}
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
          {t("addresses.newAddressForm.street")}
        </Text>
        <TextInput
          value={street}
          onChangeText={setStreet}
          placeholder={t("addresses.newAddressForm.streetPlaceholder")}
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.building")}
        </Text>
        <TextInput
          value={building}
          onChangeText={setBuilding}
          placeholder={t("addresses.newAddressForm.buildingPlaceholder")}
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.floor")}
        </Text>
        <TextInput
          value={floor}
          onChangeText={setFloor}
          placeholder={t("addresses.newAddressForm.floor")}
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.aptNumber")}
        </Text>
        <TextInput
          value={aptNumber}
          onChangeText={setAptNumber}
          placeholder={t("addresses.newAddressForm.aptNumberPlaceholder")}
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.label")}
        </Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder={t("addresses.newAddressForm.labelPlaceholder")}
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          {t("addresses.newAddressForm.additionalDirections")}
        </Text>
        <TextInput
          value={additionalDirections}
          onChangeText={setAdditionalDirections}
          placeholder={t("addresses.newAddressForm.additionalDirectionsPlaceholder")}
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
              {t("addresses.detailsForm.saveAndContinue")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
