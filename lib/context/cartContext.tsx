import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext();

const initialState = {
  cart: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.cart.find(
        (item) => item.id === action.payload.id
      );

      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [
          ...state.cart,
          {
            ...action.payload,
            quantity: 1,
          },
        ],
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
      };

    case "SET_CART":
      return {
        ...state,
        cart: action.payload,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
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
  }, [state.cart]);

  async function loadCart() {
    try {
      const data = await AsyncStorage.getItem("cart");

      if (data) {
        dispatch({
          type: "SET_CART",
          payload: JSON.parse(data),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function saveCart() {
    try {
      await AsyncStorage.setItem(
        "cart",
        JSON.stringify(state.cart)
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
        addItem,
        removeItem,
        updateQty,
        clearCart,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);