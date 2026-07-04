import React, { createContext, useContext, useEffect, useReducer } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Address } from "@/lib/types/address";
import { addressService } from "@/shared/address.service";

interface AddressContextValue {
  addresses: Address[];
  isLoading: boolean;
  addAddress: (address: Address) => void;
  removeAddress: (id: number) => void;
  updateAddress: (address: Address) => void;
  clearAddresses: () => void;
  selectedAddressId: number | null;
  selectAddress: (id: number | null) => void;
  setDefaultAddress: (id: number) => Promise<void>;
  refreshAddresses: () => Promise<Address[]>;
}

const AddressContext = createContext<AddressContextValue>({
  addresses: [],
  isLoading: true,
  addAddress: () => {},
  removeAddress: () => {},
  updateAddress: () => {},
  clearAddresses: () => {},
  selectedAddressId: null,
  selectAddress: () => {},
  setDefaultAddress: async () => {},
  refreshAddresses: async () => [],
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

const pickDefaultAddress = (addresses: Address[]): Address | null =>
  addresses.find((a) => a.is_default) ?? addresses[0] ?? null;

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(addressReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadAddresses().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    saveAddresses();
  }, [state.addresses, state.selectedAddressId]);

  async function loadAddresses() {
    try {
      const selectedId = await AsyncStorage.getItem("selected_address_id");
      let hasStoredSelection = false;
      if (selectedId) {
        hasStoredSelection = true;
        dispatch({ type: "SELECT_ADDRESS", payload: JSON.parse(selectedId) });
      }

      const remote = await addressService.getAddresses();
      if (remote.length > 0) {
        dispatch({ type: "SET_ADDRESSES", payload: remote });
        if (!hasStoredSelection) {
          const preferred = pickDefaultAddress(remote);
          if (preferred?.id) {
            dispatch({ type: "SELECT_ADDRESS", payload: preferred.id });
          }
        }
        return;
      }

      const data = await AsyncStorage.getItem("addresses");
      if (data) {
        const parsed = JSON.parse(data);
        dispatch({ type: "SET_ADDRESSES", payload: parsed });
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

  const setDefaultAddress = async (id: number) => {
    await addressService.setDefaultAddress(id);
    dispatch({
      type: "SET_ADDRESSES",
      payload: state.addresses.map((a) => ({ ...a, is_default: a.id === id })),
    });
    selectAddress(id);
  };

  const refreshAddresses = async (): Promise<Address[]> => {
    const remote = await addressService.getAddresses();
    dispatch({ type: "SET_ADDRESSES", payload: remote });
    return remote;
  };

  return (
    <AddressContext.Provider
      value={{
        addresses: state.addresses,
        isLoading,
        addAddress,
        removeAddress,
        updateAddress,
        clearAddresses,
        selectedAddressId: state.selectedAddressId,
        selectAddress,
        setDefaultAddress,
        refreshAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export const useAddress = () => useContext(AddressContext);
