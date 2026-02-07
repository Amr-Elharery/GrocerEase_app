import { Ionicons } from "@expo/vector-icons"; // For trash icon
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const initialItems = [
  {
    id: "1",
    name: "Red Eggs",
    image: "https://i.imgur.com/0ZfKx5b.png", // replace with your own image URL
    quantity: 1,
    unit: "8 per pack",
  },
  {
    id: "2",
    name: "Juhayna Milk",
    image: "https://i.imgur.com/7K7Fj6t.png",
    quantity: 2,
    unit: "1 Liter",
  },
  {
    id: "3",
    name: "Juhayna Plain Yogurt",
    image: "https://i.imgur.com/8w8w8w8.png",
    quantity: 4,
    unit: "105 Gram",
  },
  {
    id: "4",
    name: "Raw Sea Salt & Balsamic Vinegar Potatoes",
    image: "https://i.imgur.com/5u5u5u5.png",
    quantity: 1,
    unit: "42 Gram",
  },
];

export default function Orders() {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const increment = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrement = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemUnit}>{item.unit}</Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => decrement(item.id)}
        >
          <Text style={styles.quantityText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.quantityNumber}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => increment(item.id)}
        >
          <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{ marginLeft: 12 }}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="trash-bin" size={22} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shopping List</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push("/(tabs)/optimization")}
      >
        <Text style={styles.nextText}>Next</Text>
        <Text style={styles.itemsText}>{totalItems} items</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemUnit: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityNumber: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  separator: {
    height: 12,
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    height: 60,
    backgroundColor: "#1E2A78", // نفس الأزرق في الصورة
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    elevation: 5,
  },

  nextText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  itemsText: {
    color: "#fff",
    fontSize: 16,
  },
});
