import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Animated, Easing, Text, View } from "react-native";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible || !message) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible, message]);

  const showToast = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <View
          pointerEvents="none"
          className="absolute bottom-24 left-4 right-4 z-50 items-center"
        >
          <View className="bg-foreground/90 rounded-xl px-5 py-3 shadow-lg">
            <Text className="text-background font-medium text-sm text-center">
              {message}
            </Text>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
