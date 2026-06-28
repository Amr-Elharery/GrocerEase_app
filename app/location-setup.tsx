import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

import * as Location from "expo-location";

import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { MapPin } from "lucide-react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function LocationSetupScreen() {
  const router = useRouter();

  const { theme } = useTheme();

  const tokens = THEME[theme];

  const [query, setQuery] = useState("");

  const [results, setResults] = useState<any[]>([]);

  const [address, setAddress] = useState("");

  const [coords, setCoords] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // Search address FREE

  const searchAddress = async (text: string) => {
    setQuery(text);

    if (text.length < 3) {
      setResults([]);
      return;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${text}&format=json&addressdetails=1`,

      {
        headers: {
          "User-Agent": "grocery-app",
        },
      },
    );

    const data = await response.json();

    setResults(data);
  };

  // select suggestion

  const selectAddress = (item: any) => {
    setAddress(item.display_name);

    setCoords({
      latitude: parseFloat(item.lat),

      longitude: parseFloat(item.lon),
    });

    setQuery(item.display_name);

    setResults([]);
  };

  // GPS button

  const currentLocation = async () => {
    try {
      setLoading(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        alert("Permission denied");

        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const {
        latitude,

        longitude,
      } = location.coords;

      // Reverse geocode FREE

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,

        {
          headers: {
            "User-Agent": "grocery-app",
          },
        },
      );

      const data = await response.json();

      setAddress(data.display_name);

      setQuery(data.display_name);

      setCoords({
        latitude,

        longitude,
      });
    } catch (e) {
      alert("Cannot get location");
    } finally {
      setLoading(false);
    }
  };

  const continueHandler = async () => {
    if (!coords) {
      alert("Select address");

      return;
    }

    try {
      setLoading(true);

      console.log({
        address,
        ...coords,
      });

      // Save location to AsyncStorage
      await AsyncStorage.setItem("user_location", address);
      await AsyncStorage.setItem(
        "user_location_coords",
        JSON.stringify(coords),
      );

      // Navigate to home
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: tokens.background,
      }}
    >
      <View className="px-6 py-8 flex-1">
        <Text
          className="text-3xl font-bold mb-5"
          style={{
            color: tokens.foreground,
          }}
        >
          Delivery Location
        </Text>

        <TextInput
          value={query}
          onChangeText={searchAddress}
          placeholder="Search address"
          placeholderTextColor={tokens.mutedForeground}
          className="border rounded-xl px-4 py-3"
          style={{
            borderColor: tokens.border,

            color: tokens.foreground,

            backgroundColor: tokens.input,
          }}
        />

        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectAddress(item)}
              className="py-3 border-b"
              style={{
                borderColor: tokens.border,
              }}
            >
              <Text
                style={{
                  color: tokens.foreground,
                }}
              >
                {item.display_name}
              </Text>
            </Pressable>
          )}
        />

        <Pressable
          onPress={currentLocation}
          className="mt-5 p-4 rounded-xl flex-row justify-center"
          style={{
            backgroundColor: tokens.primary + "20",
          }}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <MapPin size={20} color={tokens.primary} />

              <Text
                className="ml-2"
                style={{
                  color: tokens.primaryForeground,
                }}
              >
                Use Current Location
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={continueHandler}
          disabled={!coords}
          className="mt-5 p-4 rounded-xl items-center"
          style={{
            backgroundColor: coords ? tokens.primary : tokens.mutedForeground,
          }}
        >
          <Text
            style={{
              color: tokens.background,
            }}
            className="font-bold"
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
