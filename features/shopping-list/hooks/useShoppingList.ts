import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  addToShoppingList,
  type ShoppingListItem,
} from "@/features/shopping-list/services/shopping-list.service";
import { useToast } from "@/lib/toast/useToast";

export function useShoppingList() {
  const toast = useToast();
  const { t } = useTranslation();

  const addItem = useCallback(
    async (item: Omit<ShoppingListItem, "qty">) => {
      try {
        await addToShoppingList({
          ...item,
          qty: 1,
        });
        toast(t("shoppingList.addedToList", { name: item.product_name }), "success");
      } catch (error) {
        console.error("Error adding to shopping list:", error);
        toast(t("shoppingList.addToListFailed"), "error");
      }
    },
    [toast, t],
  );

  return {
    addItem,
  };
}
