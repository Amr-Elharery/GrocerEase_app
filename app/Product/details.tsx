import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Params = {
  id?: string;
  title?: string;
  subtitle?: string;
  storage?: string;
  expiration?: string;
  notes?: string;
};

export default function ProductMoreDetails() {
  const params = useLocalSearchParams<Params>();

  const data = useMemo(() => {
    return {
      title: params.title ?? `Product #${params.id ?? ""}`,
      subtitle: params.subtitle ?? "",
      storage: params.storage ?? "—",
      expiration: params.expiration ?? "—",
      notes: params.notes ?? "",
    };
  }, [params]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color="#41724c" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{data.title}</Text>
          {!!data.subtitle && <Text style={styles.cardSub}>{data.subtitle}</Text>}

          <View style={styles.divider} />

          {/* Storage */}
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="file-tray-outline" size={18} color="#111" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Storage instructions</Text>
              <Text style={styles.p}>{data.storage}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Expiration */}
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={18} color="#111" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Expiration</Text>
              <Text style={styles.p}>{data.expiration}</Text>
            </View>
          </View>

          {!!data.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Ionicons name="information-circle-outline" size={18} color="#111" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.h}>Notes</Text>
                  <Text style={styles.p}>{data.notes}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },

  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  content: { paddingBottom: 24 },

  card: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
  },

  cardTitle: { fontWeight: "900", fontSize: 18, color: "#111" },
  cardSub: { marginTop: 6, color: "#777", fontSize: 13 },

  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  h: { fontWeight: "900", fontSize: 16, color: "#111" },
  p: { marginTop: 4, color: "#777", fontSize: 14, lineHeight: 20 },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 16 },
});
