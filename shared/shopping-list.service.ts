import AsyncStorage from "@react-native-async-storage/async-storage";
import httpService from "./httpService";

export interface ShoppingListItem {
  product_id: number;
  product_name: string;
  brand?: string;
  image_url?: string;
  qty: number;
}

export interface OptimizePayload {
  product_id: number;
  qty: number;
}

export interface OptimizeResponse {
  optimal_combination: any;
  total_cost: number;
  savings: number;
}

const SHOPPING_LIST_KEY = "shopping_list_v1";

/**
 * Get all items from the local shopping list
 */
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  try {
    const data = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading shopping list:", error);
    return [];
  }
}

/**
 * Add or update an item in the shopping list
 */
export async function addToShoppingList(
  item: ShoppingListItem,
): Promise<ShoppingListItem[]> {
  try {
    const list = await getShoppingList();
    const existingIndex = list.findIndex(
      (i) => i.product_id === item.product_id,
    );

    if (existingIndex > -1) {
      // Update quantity if product already exists
      list[existingIndex].qty += item.qty;
    } else {
      // Add new item
      list.push(item);
    }

    await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list));
    return list;
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    throw error;
  }
}

/**
 * Remove an item from the shopping list
 */
export async function removeFromShoppingList(
  productId: number,
): Promise<ShoppingListItem[]> {
  try {
    const list = await getShoppingList();
    const filtered = list.filter((item) => item.product_id !== productId);
    await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error("Error removing from shopping list:", error);
    throw error;
  }
}

/**
 * Update quantity of an item in the shopping list
 */
export async function updateShoppingListQuantity(
  productId: number,
  qty: number,
): Promise<ShoppingListItem[]> {
  try {
    const list = await getShoppingList();
    const item = list.find((i) => i.product_id === productId);

    if (item) {
      if (qty <= 0) {
        // Remove item if quantity is 0 or less
        return removeFromShoppingList(productId);
      }
      item.qty = qty;
      await AsyncStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list));
    }

    return list;
  } catch (error) {
    console.error("Error updating shopping list quantity:", error);
    throw error;
  }
}

/**
 * Clear the entire shopping list
 */
export async function clearShoppingList(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SHOPPING_LIST_KEY);
  } catch (error) {
    console.error("Error clearing shopping list:", error);
    throw error;
  }
}

/**
 * Send shopping list to optimization engine
 */
export async function optimizeShoppingList(
  items: ShoppingListItem[],
): Promise<OptimizeResponse> {
  try {
    const payload = items.map((item) => ({
      product_id: item.product_id,
      qty: item.qty,
    }));

    const response = await httpService.post("/optimize", payload);
    return response.data;
  } catch (error) {
    console.error("Error optimizing shopping list:", error);
    throw error;
  }
}
