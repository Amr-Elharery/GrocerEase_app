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
import { useTranslation } from "react-i18next";
import { BackIcon } from "@/components/ui/back-icon";
import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import { addressService } from "@/features/addresses/services/address.service";
import { Trash2 } from "lucide-react-native";

export default function AddressBookScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const { addresses, selectedAddressId, selectAddress, removeAddress } =
    useAddress();

  const handleDelete = async (address: any) => {
    Alert.alert(
      t("addresses.addressBook.deleteTitle"),
      t("addresses.addressBook.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              if (address.id) {
                await addressService.deleteAddress(address.id);
              }
              removeAddress(address.id);
            } catch {
              Alert.alert(t("common.error"), t("addresses.addressBook.deleteFailed"));
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
        <View className={isRTL ? "flex-row-reverse items-start justify-between" : "flex-row items-start justify-between"}>
          <View className="flex-1">
            <Text
              className="text-foreground font-bold text-base"
              style={{ color: tokens.foreground }}
            >
              {item.label || t("checkout.address")}
            </Text>

            <Text
              className="text-muted-foreground mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              {item.street}
              {item.building ? `, ${item.building}` : ""}
              {item.floor ? `, ${t("checkout.floor", { floor: item.floor })}` : ""}
              {item.apt_number ? `, ${t("checkout.apt", { apt: item.apt_number })}` : ""}
            </Text>

            <Text
              className="text-muted-foreground text-sm mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              {t("checkout.areaId", { id: item.area_id })}
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
          <BackIcon variant="chevron" size={22} color={tokens.foreground} />
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mb-6">
          <Text
            className="text-foreground text-3xl font-bold"
            style={{ color: tokens.foreground }}
          >
            {t("addresses.addressBook.title")}
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
              {t("checkout.addNew")}
            </Text>
          </TouchableOpacity>
        </View>

        {addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text
              className="text-foreground text-xl font-bold text-center"
              style={{ color: tokens.foreground }}
            >
              {t("addresses.addressBook.noneSaved")}
            </Text>

            <Text
              className="text-muted-foreground mt-2 text-center"
              style={{ color: tokens.mutedForeground }}
            >
              {t("addresses.addressBook.tapAddNew")}
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
