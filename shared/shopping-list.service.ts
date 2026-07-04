import AsyncStorage from "@react-native-async-storage/async-storage";
import httpService from "./httpService";

export interface ShoppingListItem {
  product_id: number;
  product_name: string;
  brand?: string;
  image_url?: string;
  qty: number;
}

export interface OptimizeItemAssignment {
  store: string;
  shop_id: number;
  shop_product_id: number;
  price: number;
}

export interface OptimizationPlan {
  stores_to_visit: string[];
  item_assignment: Record<string, OptimizeItemAssignment>;
  item_cost: number;
  delivery_cost: number;
  total_cost: number;
  route: any[];
}

export interface OrderGroupOrderPayload {
  shop_id: number;
  customer_address_id: number;
  payment_method: string;
  items: { shop_product_id: number; quantity: number }[];
}

export interface OrderOptimizationPayload {
  customer_address_id: number;
  payment_method: string;
  orders: OrderGroupOrderPayload[];
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
 * Ask the optimizer for the best shop split for the given shopping list.
 * Read-only planning call — nothing is created in the database yet.
 */
export async function requestOptimizationPlan(
  items: ShoppingListItem[],
  customerAddressId: number,
  maxStores: number = 3,
): Promise<OptimizationPlan> {
  const shopping_list: Record<string, number> = {};
  for (const item of items) {
    shopping_list[String(item.product_id)] = item.qty;
  }

  const response = await httpService.post("/optimization/optimize", {
    shopping_list,
    customer_address_id: customerAddressId,
    max_stores: maxStores,
  });

  return response.data;
}

/**
 * Submit the confirmed plan as a real order group.
 * Only IDs and quantities are sent — the backend recomputes pricing.
 */
export async function submitOptimizedOrder(
  payload: OrderOptimizationPayload,
): Promise<any> {
  const response = await httpService.post("/orders/optimization", payload);
  return response.data;
}
