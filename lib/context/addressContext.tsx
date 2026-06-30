import React, { createContext, useContext, useEffect, useReducer } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Address } from "@/lib/types/address";

interface AddressContextValue {
  addresses: Address[];
  addAddress: (address: Address) => void;
  removeAddress: (id: number) => void;
  updateAddress: (address: Address) => void;
  clearAddresses: () => void;
  selectedAddressId: number | null;
  selectAddress: (id: number | null) => void;
}

const AddressContext = createContext<AddressContextValue>({
  addresses: [],
  addAddress: () => {},
  removeAddress: () => {},
  updateAddress: () => {},
  clearAddresses: () => {},
  selectedAddressId: null,
  selectAddress: () => {},
});

interface State {
  addresses: Address[];
  selectedAddressId: number | null;
}

type Action =
  | { type: "SET_ADDRESSES"; payload: Address[] }
  | { type: "ADD_ADDRESS"; payload: Address }
  | { type: "REMOVE_ADDRESS"; payload: number }
  | { type: "CLEAR_ADDRESSES" }
  | { type: "SELECT_ADDRESS"; payload: number | null };

function addressReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ADDRESSES":
      return { ...state, addresses: action.payload };
    case "ADD_ADDRESS": {
      const existing = state.addresses.find((a) => a.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          addresses: state.addresses.map((a) =>
            a.id === action.payload.id ? action.payload : a
          ),
        };
      }
      return {
        ...state,
        addresses: [...state.addresses, action.payload],
      };
    }
    case "REMOVE_ADDRESS":
      return {
        ...state,
        addresses: state.addresses.filter((a) => a.id !== action.payload),
        selectedAddressId:
          state.selectedAddressId === action.payload
            ? null
            : state.selectedAddressId,
      };
    case "CLEAR_ADDRESSES":
      return { ...state, addresses: [], selectedAddressId: null };
    case "SELECT_ADDRESS":
      return { ...state, selectedAddressId: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  addresses: [],
  selectedAddressId: null,
};

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(addressReducer, initialState);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    saveAddresses();
  }, [state.addresses, state.selectedAddressId]);

  async function loadAddresses() {
    try {
      const data = await AsyncStorage.getItem("addresses");
      const selectedId = await AsyncStorage.getItem("selected_address_id");
      if (data) {
        const parsed = JSON.parse(data);
        dispatch({ type: "SET_ADDRESSES", payload: parsed });
      }
      if (selectedId) {
        dispatch({ type: "SELECT_ADDRESS", payload: JSON.parse(selectedId) });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function saveAddresses() {
    try {
      await AsyncStorage.setItem(
        "addresses",
        JSON.stringify(state.addresses)
      );
      if (state.selectedAddressId) {
        await AsyncStorage.setItem(
          "selected_address_id",
          JSON.stringify(state.selectedAddressId)
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  const addAddress = (address: Address) => {
    dispatch({ type: "ADD_ADDRESS", payload: address });
  };

  const removeAddress = (id: number) => {
    dispatch({ type: "REMOVE_ADDRESS", payload: id });
  };

  const updateAddress = (address: Address) => {
    dispatch({ type: "ADD_ADDRESS", payload: address });
  };

  const clearAddresses = () => {
    dispatch({ type: "CLEAR_ADDRESSES" });
  };

  const selectAddress = (id: number | null) => {
    dispatch({ type: "SELECT_ADDRESS", payload: id });
  };

  return (
    <AddressContext.Provider
      value={{
        addresses: state.addresses,
        addAddress,
        removeAddress,
        updateAddress,
        clearAddresses,
        selectedAddressId: state.selectedAddressId,
        selectAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export const useAddress = () => useContext(AddressContext);
