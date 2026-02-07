import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Optimization() {
  const [selectedWay, setSelectedWay] = useState<"cheapest" | "minimum">("minimum");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      
      {/* Header */}
      <Text style={styles.title}>Optimization Results</Text>
      <Text style={styles.subtitle}>
        We found <Text style={styles.bold}>2 ways</Text> to fulfill your 10-item list
      </Text>

      {/* Ways */}
      <View style={styles.waysContainer}>
        
        {/* Cheapest */}
        <TouchableOpacity
          style={[
            styles.wayCard,
            selectedWay === "cheapest" && styles.activeCard,
          ]}
          onPress={() => setSelectedWay("cheapest")}
        >
          <Ionicons name="cash-outline" size={32} color="#2DBE60" />
          <Text style={styles.wayTitle}>Cheapest Total</Text>
          <Text style={styles.green}>Save 32 EGP</Text>
          <Text style={styles.gray}>
            Split between: Kazyon, Spinneys, Al Othaim
          </Text>
          <Text style={styles.gray}>Estimated Delivery: 1 hour</Text>
        </TouchableOpacity>

        {/* Minimum */}
        <TouchableOpacity
          style={[
            styles.wayCard,
            selectedWay === "minimum" && styles.activeCard,
          ]}
          onPress={() => setSelectedWay("minimum")}
        >
          <Ionicons name="bag-outline" size={32} color="#999" />
          <Text style={styles.wayTitle}>Minimum Stores</Text>
          <Text style={styles.blue}>All from Spinneys</Text>
          <Text style={styles.gray}>Save time with a single delivery</Text>
          <Text style={styles.gray}>Estimated Delivery: 30 mins</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Details */}
      {selectedWay === "minimum" ? <MinimumStores /> : <CheapestTotal />}

    </ScrollView>
  );
}
function MinimumStores() {
  return (
    <View style={styles.detailsCard}>
      <Text style={styles.detailsTitle}>Store Group: Spinneys (10 Items)</Text>

      <Text style={styles.item}>2 × Milk 1L — 80 EGP</Text>
      <Text style={styles.item}>Eggs — 160 EGP</Text>
      <Text style={styles.item}>4 × Juhayna Plain Yogurt — 40 EGP</Text>
      <Text style={styles.item}>Raw Sea Salt Potatoes — 17 EGP</Text>
      <Text style={styles.item}>Corona Dark Chocolate — 30 EGP</Text>

      <Text style={styles.greenRight}>−30 mins</Text>
    </View>
  );
}
function CheapestTotal() {
  return (
    <>
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Store Group 1: Kazyon (3 Items)</Text>
        <Text style={styles.item}>2 × Milk 1L — 70 EGP (Save 10)</Text>
        <Text style={styles.item}>Eggs — 150 EGP (Save 10)</Text>
        <Text style={styles.greenRight}>−20 EGP</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Store Group 2: Spinneys (5 Items)</Text>
        <Text style={styles.item}>4 × Plain Yogurt — 35 EGP (Save 5)</Text>
        <Text style={styles.item}>Raw Sea Salt Potatoes — 15 EGP (Save 2)</Text>
        <Text style={styles.greenRight}>−7 EGP</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Store Group 3: Al Othaim (2 Items)</Text>
        <Text style={styles.item}>2 × Dark Chocolate — 25 EGP (Save 5)</Text>
        <Text style={styles.greenRight}>−5 EGP</Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F1EF",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#666",
    marginBottom: 16,
  },

  bold: { fontWeight: "bold" },

  waysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  wayCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  activeCard: {
    borderColor: "#1E2A78",
    borderWidth: 2,
  },

  wayTitle: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },

  green: { color: "#2DBE60", fontWeight: "600" },
  blue: { color: "#1E2A78", fontWeight: "600" },
  gray: { color: "#777", fontSize: 12, marginTop: 4 },

  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  detailsTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1E2A78",
  },

  item: {
    color: "#555",
    marginBottom: 4,
  },

  greenRight: {
    color: "#2DBE60",
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginTop: 8,
  },
});

