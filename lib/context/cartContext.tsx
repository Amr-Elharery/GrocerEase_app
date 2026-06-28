import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartContextValue {
  cart: any[];
  shopId: number | null;
  addItem: (item: any) => void;
  conflictAddItem: (item: any) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  canAddItem: (shopId: number) => boolean;
  getCartShopId: () => number | null;
  subtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextValue>({
  cart: [],
  shopId: null,
  addItem: () => {},
  conflictAddItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  canAddItem: () => true,
  getCartShopId: () => null,
  subtotal: 0,
  cartCount: 0,
});

const initialState = {
  cart: [],
  shopId: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.cart.find(
        (item) => item.id === action.payload.id
      );

      const newItems = existing
        ? state.cart.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          )
        : [...state.cart, { ...action.payload, quantity: 1 }];

      return {
        ...state,
        cart: newItems,
        shopId: action.payload.shop_id ?? state.shopId,
      };
    }

    case "CONFLICT_ADD_ITEM": {
      return {
        ...state,
        cart: [{ ...action.payload, quantity: 1 }],
        shopId: action.payload.shop_id,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter(
          (item) => item.id !== action.payload
        ),
      };

    case "UPDATE_QTY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: action.payload.qty,
              }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
        shopId: null,
      };

    case "SET_CART":
      return {
        ...state,
        cart: action.payload.cart,
        shopId: action.payload.shopId ?? null,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState
  );

  // Load Cart
  useEffect(() => {
    loadCart();
  }, []);

  // Save Cart
  useEffect(() => {
    saveCart();
  }, [state.cart, state.shopId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCart() {
    try {
      const data = await AsyncStorage.getItem("cart");

      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object" && "cart" in parsed) {
          dispatch({
            type: "SET_CART",
            payload: parsed,
          });
        } else {
          dispatch({
            type: "SET_CART",
            payload: { cart: parsed, shopId: null },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function saveCart() {
    try {
      await AsyncStorage.setItem(
        "cart",
        JSON.stringify({ cart: state.cart, shopId: state.shopId })
      );
    } catch (error) {
      console.log(error);
    }
  }

  // Actions
  const addItem = (item) => {
    dispatch({
      type: "ADD_ITEM",
      payload: item,
    });
  };

  const conflictAddItem = (item) => {
    dispatch({
      type: "CONFLICT_ADD_ITEM",
      payload: item,
    });
  };

  const removeItem = (id) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: id,
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }

    dispatch({
      type: "UPDATE_QTY",
      payload: { id, qty },
    });
  };

  const clearCart = () => {
    dispatch({
      type: "CLEAR_CART",
    });
  };

  const canAddItem = (shopId) => {
    if (!state.shopId || state.cart.length === 0) return true;
    return state.shopId === shopId;
  };

  const getCartShopId = () => state.shopId;

  const subtotal = state.cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const cartCount = state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        shopId: state.shopId,
        addItem,
        conflictAddItem,
        removeItem,
        updateQty,
        clearCart,
        canAddItem,
        getCartShopId,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);