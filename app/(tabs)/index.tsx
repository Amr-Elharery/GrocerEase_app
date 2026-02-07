import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRODUCTS = [
  {
    id: "1",
    title: "Tomato Fresh",
    rating: 4.6,
    price: 20,
    unit: "500gm",
    image: "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg",
  },
  {
    id: "2",
    title: "Carrot Fresh",
    rating: 4.5,
    price: 8,
    unit: "500gm",
    image:
      "https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&q=80",
  },
  {
    id: "3",
    title: "Pepper Fresh",
    rating: 4.4,
    price: 12,
    unit: "500gm",
    image: "data:image/jpeg;base64,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", 
  },
  {
    id: "4",
    title: "Potato Fresh",
    rating: 4.3,
    price: 6,
    unit: "500gm",
    image:
      "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800&q=80",
  },
];

export default function Home() {
  const [tab, setTab] = useState<"Items" | "Shop">("Items");
  const [city, setCity] = useState("Loading...");

  const [cart, setCart] = useState<Record<string, number>>({});

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCity("Permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(location.coords);

      if (geo.length > 0) {
        setCity(`${geo[0].city}, ${geo[0].country}`);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2ef" }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="location-outline" size={20} />
            <View>
              <Text style={styles.small}>Express delivery</Text>
              <Text style={styles.big}>{city}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push("/search")} hitSlop={10}>
              <Ionicons name="search-outline" size={22} />
            </Pressable>

            <Pressable onPress={() => console.log("Cart:", cart)} hitSlop={10}>
              <View style={{ position: "relative" }}>
                <Ionicons name="cart-outline" size={22} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? "99+" : cartCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>

            <Ionicons name="notifications-outline" size={22} />
          </View>
        </View>

        {/* Segment */}
        <View style={styles.segment}>
          <Pressable
            onPress={() => setTab("Items")}
            style={[styles.segBtn, tab === "Items" && styles.segActive]}
          >
            <Text style={tab === "Items" ? styles.segTextActive : styles.segText}>
              Items
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("Shop")}
            style={[styles.segBtn, tab === "Shop" && styles.segActive]}
          >
            <Text style={tab === "Shop" ? styles.segTextActive : styles.segText}>
              Shop
            </Text>
          </Pressable>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
            }}
            style={styles.bannerImg}
          />
          <View style={styles.overlay} />
          <Text style={styles.bannerText}>
            20% Discount For every 3 items Order{"\n"}in first time.
          </Text>
        </View>

        {/* Popular */}
        <Text style={styles.popular}>Popular Items</Text>

        <FlatList
          data={PRODUCTS}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/Product/[id]",
                  params: { id: item.id },
                })
              }
              style={styles.card}
            >
              <View>
                <Image source={{ uri: item.image }} style={styles.cardImg} />
                <Ionicons name="heart-outline" size={18} style={styles.heart} />
              </View>

              <View style={{ padding: 8 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.rating}>⭐ {item.rating}</Text>
                </View>

                <Text style={styles.price}>
                  ${item.price} <Text style={styles.unit}>/ {item.unit}</Text>
                </Text>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.(); 
                    addToCart(item.id);
                  }}
                  style={styles.addBtn}
                >
                  <Ionicons name="cart-outline" size={18} color="#16a34a" />
                  <Text style={styles.addText}>
                    {cart[item.id] ? `Added (${cart[item.id]})` : "Add to Cart"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          )}
        />

        {/* Bottom Nav */}
        <View style={styles.bottom}>
          <View style={styles.bottomItem}>
            <Ionicons name="home" size={22} />
            <Text>Home</Text>
          </View>

          <View style={styles.bottomItem}>
            <View style={{ position: "relative" }}>
              <Ionicons name="cart-outline" size={22} />
              {cartCount > 0 && (
                <View style={[styles.badge, { top: -6, right: -10 }]}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </Text>
                </View>
              )}
            </View>
            <Text>Cart</Text>
          </View>

          <View style={styles.bottomItem}>
            <Ionicons name="person-outline" size={22} />
            <Text>Profile</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", gap: 14, alignItems: "center" },

  small: { color: "#777", fontSize: 12 },
  big: { fontWeight: "800", fontSize: 18 },

  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "900" },

  segment: {
    marginTop: 12,
    backgroundColor: "#e5e5e5",
    borderRadius: 30,
    padding: 4,
    flexDirection: "row",
  },
  segBtn: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  segActive: { backgroundColor: "#fff", borderRadius: 20 },
  segText: { color: "#777", fontWeight: "700" },
  segTextActive: { fontWeight: "800" },

  banner: {
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
  },
  bannerImg: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.25)",
  },
  bannerText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "white",
    fontWeight: "800",
  },

  popular: { marginTop: 12, fontSize: 20, fontWeight: "900", color: "#111" },

  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 18,
    marginTop: 12,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: 100 },
  heart: { position: "absolute", right: 8, top: 8 },

  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontWeight: "800", flex: 1, paddingRight: 6 },
  rating: { fontWeight: "700" },

  price: { marginTop: 4, fontWeight: "900" },
  unit: { color: "#999" },

  addBtn: {
    marginTop: 8,
    backgroundColor: "#f3f4f6",
    height: 36,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addText: { color: "#16a34a", fontWeight: "800" },

  bottom: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 10,
    height: 60,
    borderRadius: 18,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomItem: { alignItems: "center" },
});
