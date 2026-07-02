import { useAuth } from "@/lib/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Bell, ChevronDown, LogIn, MapPin, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SearchBar } from "../search-bar";

type SearchMode = "product" | "store";

interface HeaderProps {
  zone?: string;
  onZonePress?: () => void;
  onSearch?: (query: string, mode: SearchMode) => void;
}

export function Header({
  zone: initialZone,
  onZonePress,
  onSearch,
}: HeaderProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("product");
  const [zone, setZone] = useState<string | null>(initialZone || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Load location from AsyncStorage when component mounts
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem("user_location");
        if (savedLocation) {
          setZone(savedLocation);
        } else {
          setZone(null);
        }
      } catch (error) {
        console.error("Error loading location:", error);
        setZone(null);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    loadLocation();
  }, []);

  const handleSearch = (query: string) => {
    onSearch?.(query, searchMode);
  };

  const handleLoginPress = () => {
    router.push("/login");
  };

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  const handleSetLocation = () => {
    router.push("/location-setup");
  };

  const handleZonePress = () => {
    if (isLoggedIn && zone) {
      onZonePress?.();
    }
  };

  return (
    <View className="bg-background border-b border-border px-4 py-3">
      {/* Top Row: Zone + Login/Action Icon */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Left Side: Location or Login Prompt */}
        <View className="flex-1 min-w-0">
          {!isLoggedIn ? (
            // Not logged in: show login prompt
            <View className="flex-row items-center">
              <Text className="text-muted-foreground text-sm">
                Login to see locations
              </Text>
            </View>
          ) : isLoadingLocation ? (
            // Loading location
            <View className="flex-row items-center">
              <Text className="text-muted-foreground text-sm">Loading...</Text>
            </View>
          ) : zone ? (
            // Logged in with location: show area
            <Pressable
              onPress={handleZonePress}
              className="flex-row items-center min-w-0"
            >
              <MapPin size={20} className="text-primary mr-1" />
              <Text
                className="text-foreground font-semibold text-base flex-shrink"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {zone}
              </Text>
              <ChevronDown size={16} className="text-muted-foreground ml-1" />
            </Pressable>
          ) : (
            // Logged in but no location: show "Set location"
            <Pressable
              onPress={handleSetLocation}
              className="flex-row items-center min-w-0"
            >
              <MapPin size={20} className="text-primary mr-1" />
              <Text
                className="text-foreground font-semibold text-base flex-shrink"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Set location
              </Text>
              <Plus size={16} className="text-primary ml-1" />
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center gap-3 ml-3">
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
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <SearchBar
            placeholder={`Search ${searchMode}s...`}
            onSearch={handleSearch}
          />
        </View>

        {/* Toggle Switch */}
        <View className="flex-row bg-muted border border-border rounded-lg p-1">
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
              Product
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
              Store
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
