import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useAddress } from "@/lib/context/addressContext";
import { addressService } from "@/shared/address.service";
import { ChevronLeft, Trash2 } from "lucide-react-native";

export default function AddressBookScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { addresses, selectedAddressId, selectAddress, removeAddress } =
    useAddress();

  const handleDelete = async (address: any) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to remove this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (address.id) {
                await addressService.deleteAddress(address.id);
              }
              removeAddress(address.id);
            } catch {
              Alert.alert("Error", "Could not delete address.");
            }
          },
        },
      ]
    );
  };

  const handleSelect = (id: number | undefined) => {
    if (!id) return;
    selectAddress(id);
    router.back();
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedAddressId === item.id;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.id)}
        className="bg-card border rounded-2xl p-4 mb-3"
        style={{
          backgroundColor: tokens.card,
          borderColor: isSelected ? tokens.primary : tokens.border,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className="text-foreground font-bold text-base"
              style={{ color: tokens.foreground }}
            >
              {item.label || "Address"}
            </Text>

            <Text
              className="text-muted-foreground mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              {item.street}
              {item.building ? `, ${item.building}` : ""}
              {item.floor ? `, Floor ${item.floor}` : ""}
              {item.apt_number ? `, Apt ${item.apt_number}` : ""}
            </Text>

            <Text
              className="text-muted-foreground text-sm mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              Area ID: {item.area_id}
            </Text>

            <Text
              className="text-muted-foreground text-sm"
              style={{ color: tokens.mutedForeground }}
            >
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            {isSelected && (
              <View
                className="w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: tokens.primary }}
              >
                <Text className="text-white text-xs font-bold">✓</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => handleDelete(item)}
              className="p-2 rounded-full"
              style={{ backgroundColor: tokens.destructive + "1A" }}
            >
              <Trash2 size={18} color={tokens.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View className="px-4 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full mb-4"
          style={{ backgroundColor: tokens.muted }}
        >
          <ChevronLeft size={22} color={tokens.foreground} />
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mb-6">
          <Text
            className="text-foreground text-3xl font-bold"
            style={{ color: tokens.foreground }}
          >
            My Addresses
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/addresses")}
            className="bg-primary px-3 py-1 rounded-lg"
            style={{ backgroundColor: tokens.primary }}
          >
            <Text
              className="text-primary-foreground text-sm font-bold"
              style={{ color: tokens.primaryForeground }}
            >
              + Add New
            </Text>
          </TouchableOpacity>
        </View>

        {addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text
              className="text-foreground text-xl font-bold text-center"
              style={{ color: tokens.foreground }}
            >
              No saved addresses
            </Text>

            <Text
              className="text-muted-foreground mt-2 text-center"
              style={{ color: tokens.mutedForeground }}
            >
              Tap Add New to create your first address
            </Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(item) =>
              item.id ? item.id.toString() : Math.random().toString()
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
