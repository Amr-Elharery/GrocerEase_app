import { useCallback, useRef } from "react";
import { Animated, Easing, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastInstance: any = null;

export function useToast() {
  return useCallback(
    (message: string, type: ToastType = "success", duration: number = 2000) => {
      if (toastInstance) {
        toastInstance.show(message, type, duration);
      }
    },
    [],
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [currentToast, setCurrentToast] = React.useState<ToastMessage | null>(
    null,
  );
  const timeoutRef = useRef<NodeJS.Timeout>();

  const getToastColors = useCallback((type: ToastType) => {
    switch (type) {
      case "success":
        return { bg: "bg-green-500", text: "text-white" };
      case "error":
        return { bg: "bg-red-500", text: "text-white" };
      case "warning":
        return { bg: "bg-yellow-500", text: "text-white" };
      case "info":
      default:
        return { bg: "bg-blue-500", text: "text-white" };
    }
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "success", duration: number = 2000) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Show new toast
      setCurrentToast({ id: Math.random().toString(), message, type });

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      timeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentToast(null);
        });
      }, duration);
    },
    [fadeAnim, slideAnim],
  );

  React.useEffect(() => {
    toastInstance = { show };
    return () => {
      toastInstance = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show]);

  const colors = currentToast
    ? getToastColors(currentToast.type)
    : { bg: "", text: "" };

  return (
    <>
      {children}
      {currentToast && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className={`absolute left-4 right-4 top-0 mt-4 rounded-lg px-4 py-3 ${colors.bg} ${colors.text} flex-row items-center justify-center`}
          pointerEvents="none"
        >
          <Text className={`${colors.text} text-center font-medium`}>
            {currentToast.message}
          </Text>
        </Animated.View>
      )}
    </>
  );
}
