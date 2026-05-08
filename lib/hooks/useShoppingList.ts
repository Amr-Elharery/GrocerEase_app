import { useCallback } from "react";
import {
  addToShoppingList,
  type ShoppingListItem,
} from "@/shared/shopping-list.service";
import { useToast } from "./useToast";

export function useShoppingList() {
  const toast = useToast();

  const addItem = useCallback(
    async (item: Omit<ShoppingListItem, "qty">) => {
      try {
        await addToShoppingList({
          ...item,
          qty: 1,
        });
        toast(`Added ${item.product_name} to your list`, "success");
      } catch (error) {
        console.error("Error adding to shopping list:", error);
        toast("Failed to add item to list", "error");
      }
    },
    [toast],
  );

  return {
    addItem,
  };
}
