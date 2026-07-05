import { useAuth } from "@/features/auth/hooks/auth-context";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import { useRTL } from "@/lib/i18n/RTLContext";
import { useRouter } from "expo-router";
import { Bell, ChevronDown, LogIn, MapPin, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SearchBar } from "./SearchBar";

type SearchMode = "product" | "store";

interface HeaderProps {
  onSearch?: (query: string, mode: SearchMode) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("product");
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const { addresses, selectedAddressId, isLoading: addressesLoading } =
    useAddress();

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const zone = selectedAddress?.label || selectedAddress?.street || null;

  const handleSearch = (query: string) => {
    onSearch?.(query, searchMode);
  };

  const handleLoginPress = () => {
    router.push("/auth/login");
  };

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  const handleSetLocation = () => {
    router.push("/location-permission");
  };

  const handleZonePress = () => {
    if (isLoggedIn) {
      router.push("/address-book");
    }
  };

  return (
    <View className="bg-background border-b border-border px-4 py-3">
      {/* Top Row: Zone + Login/Action Icon */}
      <View className={isRTL ? "flex-row-reverse items-center justify-between mb-3" : "flex-row items-center justify-between mb-3"}>
        {/* Left Side: Location or Login Prompt */}
        <View className="flex-1 min-w-0">
          {!isLoggedIn ? (
            // Not logged in: show login prompt
            <View className="flex-row items-center">
              <Text className="text-muted-foreground text-sm">
                {t("home.header.loginToSeeLocations")}
              </Text>
            </View>
          ) : addressesLoading ? (
            // Loading location
            <View className="flex-row items-center">
              <Text className="text-muted-foreground text-sm">{t("common.loading")}</Text>
            </View>
          ) : zone ? (
            // Logged in with location: show area
            <Pressable
              onPress={handleZonePress}
              className={isRTL ? "flex-row-reverse items-center min-w-0" : "flex-row items-center min-w-0"}
            >
              <MapPin size={20} className="text-primary" style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} />
              <Text
                className="text-foreground font-semibold text-base flex-shrink"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {zone}
              </Text>
              <ChevronDown size={16} className={isRTL ? "text-muted-foreground mr-1" : "text-muted-foreground ml-1"} />
            </Pressable>
          ) : (
            // Logged in but no location: show "Set location"
            <Pressable
              onPress={handleSetLocation}
              className={isRTL ? "flex-row-reverse items-center min-w-0" : "flex-row items-center min-w-0"}
            >
              <MapPin size={20} className="text-primary" style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} />
              <Text
                className="text-foreground font-semibold text-base flex-shrink"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("home.header.setLocation")}
              </Text>
              <Plus size={16} className={isRTL ? "text-primary mr-1" : "text-primary ml-1"} />
            </Pressable>
          )}
        </View>

        <View className={isRTL ? "flex-row items-center gap-3 mr-3" : "flex-row items-center gap-3 ml-3"}>
          {isLoggedIn && (
            <Pressable onPress={handleNotificationsPress}>
              <Bell size={22} className="text-foreground" />
            </Pressable>
          )}

          {!isLoggedIn && (
            <Pressable onPress={handleLoginPress}>
              <LogIn size={24} className="text-foreground" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Bottom Row: Search + Toggle */}
      <View className={isRTL ? "flex-row-reverse items-center gap-2" : "flex-row items-center gap-2"}>
        <View className="flex-1">
          <SearchBar
            placeholder={
              searchMode === "product"
                ? t("home.header.searchProducts")
                : t("home.header.searchStores")
            }
            onSearch={handleSearch}
          />
        </View>

        {/* Toggle Switch */}
        <View className={isRTL ? "flex-row-reverse bg-muted border border-border rounded-lg p-1" : "flex-row bg-muted border border-border rounded-lg p-1"}>
          <Pressable
            onPress={() => setSearchMode("product")}
            className={`px-3 py-1.5 rounded ${
              searchMode === "product" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                searchMode === "product"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {t("home.header.product")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSearchMode("store")}
            className={`px-3 py-1.5 rounded ${
              searchMode === "store" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                searchMode === "store"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {t("home.header.store")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
