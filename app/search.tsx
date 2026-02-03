import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#41724c" />
        </Pressable>

        <Text style={styles.title}>Search</Text>

        <View style={{ width: 44 }} />
      </View>

      {/* Search box */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#9aa0a6" />
        <TextInput
          placeholder="Search products"
          placeholderTextColor="#9aa0a6"
          style={styles.input}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 18, fontWeight: "900", color: "#111" },

  searchBox: {
    marginHorizontal: 16,
    height: 48,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  input: { flex: 1, fontSize: 14, color: "#111" },
});
