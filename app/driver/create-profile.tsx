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
import { router } from "expo-router";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/lib/hooks/useToast";
import { addressService } from "@/shared/address.service";
import { createDeliveryProfile } from "@/shared/delivery.service";
import { VehicleType } from "@/lib/types/delivery";

const VEHICLE_TYPES: VehicleType[] = ["bike", "motorcycle", "car", "truck"];

export default function CreateDeliveryProfileScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const showToast = useToast();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("bike");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [areas, setAreas] = useState<{ id: number; area_name: string }[]>([]);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    addressService.getAreas().then(setAreas);
  }, []);

  const handleSubmit = async () => {
    if (
      !fullName ||
      !phoneNumber ||
      !vehiclePlateNumber ||
      !nationalId ||
      !city ||
      !address ||
      !areaId
    ) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      await createDeliveryProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        vehicle_type: vehicleType,
        vehicle_plate_number: vehiclePlateNumber,
        national_id: nationalId,
        city,
        address,
        area_id: areaId,
      });
      router.replace("/driver");
    } catch {
      showToast("Could not create your driver profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: tokens.background,
    borderColor: tokens.border,
    color: tokens.foreground,
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
          Create Delivery Profile
        </Text>
        <Text className="mb-6" style={{ color: tokens.mutedForeground }}>
          Tell us about you and your vehicle
        </Text>

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Full Name
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Phone Number
        </Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone number"
          placeholderTextColor={tokens.mutedForeground}
          keyboardType="phone-pad"
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Vehicle Type
        </Text>
        <View className="flex-row mb-4">
          {VEHICLE_TYPES.map((type) => {
            const isSelected = vehicleType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setVehicleType(type)}
                className="px-4 py-2 rounded-full mr-2 border"
                style={{
                  backgroundColor: isSelected ? tokens.primary : tokens.background,
                  borderColor: isSelected ? tokens.primary : tokens.border,
                }}
              >
                <Text
                  className="font-semibold text-sm capitalize"
                  style={{
                    color: isSelected ? tokens.primaryForeground : tokens.foreground,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Vehicle Plate Number
        </Text>
        <TextInput
          value={vehiclePlateNumber}
          onChangeText={setVehiclePlateNumber}
          placeholder="Plate number"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          National ID
        </Text>
        <TextInput
          value={nationalId}
          onChangeText={setNationalId}
          placeholder="National ID"
          placeholderTextColor={tokens.mutedForeground}
          keyboardType="number-pad"
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          City
        </Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Address
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-4 mb-4"
          style={inputStyle}
        />

        <Text className="mb-2" style={{ color: tokens.mutedForeground }}>
          Area
        </Text>
        <FlatList
          data={areas}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
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

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="py-4 rounded-2xl"
          style={{ backgroundColor: submitting ? tokens.muted : tokens.primary }}
        >
          {submitting ? (
            <ActivityIndicator color={tokens.primaryForeground} />
          ) : (
            <Text
              className="text-center text-lg font-bold"
              style={{ color: tokens.primaryForeground }}
            >
              Create Profile
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
