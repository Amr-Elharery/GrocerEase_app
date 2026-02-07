import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProductDetails = {
  subtitle: string;
  storage: string;
  expiration: string;
  notes?: string;
};

type Product = {
  id: string;
  title: string;
  arWeight: string;
  inStock: boolean;
  image: string;
  price: number;
  details: ProductDetails;
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Cherry Tomatoes (500g)",
    arWeight: "500 جرام",
    inStock: true,
    image: "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg",
    price: 36,
    details: {
      subtitle: "Fresh cherry tomatoes",
      storage: "Chilled (1°C to 4°C)",
      expiration: "Lasts for 2 days from date of production.",
      notes: "Wash before use. Keep refrigerated.",
    },
  },
  {
    id: "2",
    title: "Carrot Fresh (500g)",
    arWeight: "500 جرام",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1582515073490-39981397c445?w=1400&q=80",
    price: 19,
    details: {
      subtitle: "Sweet organic carrots",
      storage: "Chilled (1°C to 4°C)",
      expiration: "Lasts for 4 days from date of production.",
      notes: "Keep in a sealed bag for best freshness.",
    },
  },
  {
    id: "3",
    title: "Pepper Fresh",
    arWeight: "500 جرام",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=1400&q=80",

    price: 12,
    details: {
      subtitle: "Organic Pepper Fresh",
      storage: "Chilled (1°C to 4°C)",
      expiration: "Lasts for 4 days from date of production.",
      notes: "Keep in a sealed bag for best freshness.",
    },
  },
  {
    id: "4",
    title: "Potato Fresh (500g)",
    arWeight: "500 جرام",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=1400&q=80",
    price: 25,
    details: {
      subtitle: "Potato for frying",
      storage: "Store in a cool, dry place",
      expiration: "Best within 5–7 days.",
      notes: "Do not refrigerate. Keep away from sunlight.",
    },
  },
  {
    id: "5",
    title: "Roumy eggplant (1Kg)",
    arWeight: "1 كجم",
    inStock: true,
    image:
      "https://www.sarasorganicfood.com/wp-content/uploads/2022/01/Saras-Organic-Food-Order-Now-Addons-Vegetables-Eggplants-1024x683.jpg",
    price: 27,
    details: {
      subtitle: "Fresh eggplant",
      storage: "Cool & dry place",
      expiration: "Best within 3–5 days.",
      notes: "Wash before use.",
    },
  },

  {
    id: "6",
    title: "Cucumber Fresh (1Kg)",
    arWeight: "1 كجم",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=1400&q=80",
    price: 18,
    details: {
      subtitle: "Fresh cucumbers",
      storage: "Chilled (1°C to 4°C)",
      expiration: "Best within 3–4 days.",
      notes: "Keep refrigerated.",
    },
  },
  {
    id: "7",
    title: "Red Onion (1Kg)",
    arWeight: "1 كجم",
    inStock: true,
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI4zHK_6jdbJF8lQtSEXnRXGLqLkFWQ_eWzlfNtGAitlpC_87nqi-nZ1I&s",
    price: 22,
    details: {
      subtitle: "Red onions",
      storage: "Cool & dry place",
      expiration: "Best within 10–14 days.",
      notes: "Keep away from moisture.",
    },
  },
  {
    id: "8",
    title: "Lettuce (1pc)",
    arWeight: "1 قطعة",
    inStock: true,
    image:"https://media.istockphoto.com/id/701087958/photo/raw-organic-round-crisp-iceberg-lettuce.jpg?s=612x612&w=0&k=20&c=VPobbFujAPJwlY1WeCYNIRvaUaDmvIe8AvT5ZJtYOgA=",
    price: 15,
    details: {
      subtitle: "Crisp lettuce",
      storage: "Chilled (1°C to 4°C)",
      expiration: "Best within 2–3 days.",
      notes: "Wash and dry before storing.",
    },
  },
];

type RelatedItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<Record<string, number>>({});

  const addToCart = (productId: string, amount: number) => {
    setCart((prev) => {
      const next = { ...prev };
      next[productId] = (next[productId] ?? 0) + amount;
      return next;
    });
  };

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, n) => sum + n, 0);
  }, [cart]);

  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.id === String(id)) ?? PRODUCTS[0];
  }, [id]);
  const relatedForThisProduct: RelatedItem[] = useMemo(() => {
    return PRODUCTS.filter((p) => p.id !== product.id).map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
    }));
  }, [product.id]);

  const total = useMemo(() => product.price * qty, [product.price, qty]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color="#41724c" />
          </Pressable>

          <Pressable
            style={styles.iconBtn}
            onPress={() => {
            }}
          >
            <Ionicons name="cart-outline" size={22} color="#41724c" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <View style={styles.imageWrap}>
            <Image source={{ uri: product.image }} style={styles.hero} />
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            {product.inStock && <Text style={styles.inStock}>In stock</Text>}
            <Text style={styles.title}>{product.title}</Text>

            <View style={styles.weightRow}>
              <Text style={styles.weight}>{product.arWeight}</Text>
              <View style={styles.dot} />
            </View>
          </View>

          {/* Product details */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/Product/details",
                params: {
                  id: product.id,
                  title: product.title,
                  subtitle: product.details.subtitle,
                  storage: product.details.storage,
                  expiration: product.details.expiration,
                  notes: product.details.notes ?? "",
                },
              })
            }
            style={styles.detailsCard}
          >
            <Text style={styles.detailsTitle}>Product details</Text>
            <Ionicons name="chevron-forward" size={24} color="#41724c" />
          </Pressable>

          {/* Related products */}
          <Text style={styles.section}>Related products</Text>

          <FlatList
            data={relatedForThisProduct}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingVertical: 12, paddingRight: 16 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/Product/[id]",
                    params: { id: item.id },
                  })
                }
                style={styles.relCard}
              >
                <Pressable style={styles.relHeart}>
                  <Ionicons name="heart-outline" size={18} color="#bbb" />
                </Pressable>

                <Image source={{ uri: item.image }} style={styles.relImg} />

                {}
                <Pressable
                  style={styles.relPlus}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    addToCart(item.id, 1);
                  }}
                >
                  <Ionicons name="add" size={18} color="white" />
                </Pressable>

                <Text style={styles.relPrice}>{item.price.toFixed(2)}</Text>
                <Text style={styles.relTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            )}
          />

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Bottom bar */}
        <View style={styles.bottom}>
          <View style={styles.qtyBox}>
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>

            <Text style={styles.qtyValue}>{qty}</Text>

            <Pressable
              onPress={() => setQty((q) => q + 1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>

          {}
          <Pressable
            style={styles.addBar}
            onPress={() => addToCart(product.id, qty)}
          >
            <Text style={styles.addText}>Add</Text>
            <Text style={styles.addPrice}>$ {total.toFixed(2)}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },
  screen: { flex: 1, backgroundColor: "#f3f4f6" },

  topBar: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    right: 6,
    top: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "900" },

  content: { paddingBottom: 24 },

  imageWrap: {
    height: 240,
    backgroundColor: "#f7d6d6",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  hero: { width: "100%", height: "100%" },

  infoBox: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  inStock: { color: "#16a34a", fontWeight: "900", marginBottom: 6 },
  title: { fontSize: 28, fontWeight: "900", color: "#111" },

  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  weight: { color: "#666", fontSize: 16 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#bbb" },

  detailsCard: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailsTitle: { fontSize: 18, fontWeight: "900" },

  section: { fontSize: 22, fontWeight: "900", marginTop: 22, marginLeft: 16 },

  relCard: {
    width: 150,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 12,
    marginLeft: 16,
    position: "relative",
  },

  relHeart: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  relImg: {
    width: "100%",
    height: 100,
    borderRadius: 14,
    marginTop: 26,
    backgroundColor: "#eee",
  },

  relPlus: {
    position: "absolute",
    right: 14,
    top: 112,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#41724c",
    alignItems: "center",
    justifyContent: "center",
  },

  relPrice: { marginTop: 18, fontSize: 16, fontWeight: "900", color: "#111" },
  relTitle: { marginTop: 4, color: "#777", fontWeight: "700" },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 86,
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  qtyBox: {
    width: 130,
    height: 50,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  qtyBtn: {
    width: 40,
    height: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "900", color: "#999" },
  qtyValue: { fontSize: 18, fontWeight: "900" },

  addBar: {
    flex: 1,
    height: 50,
    borderRadius: 20,
    backgroundColor: "#41724c",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 18,
  },
  addText: { color: "white", fontSize: 18, fontWeight: "900" },
  addPrice: { color: "white", fontSize: 16, fontWeight: "900" },
});
