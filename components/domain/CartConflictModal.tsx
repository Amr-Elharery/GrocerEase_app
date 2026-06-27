import { Button } from "@/components/ui/button";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { Modal, Text, View } from "react-native";

interface CartConflictModalProps {
  visible: boolean;
  currentShopName: string;
  cartShopName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CartConflictModal({
  visible,
  currentShopName,
  cartShopName,
  onConfirm,
  onCancel,
}: CartConflictModalProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View
          className="rounded-2xl p-6 w-full max-w-sm"
          style={{ backgroundColor: tokens.card }}
        >
          <Text className="text-foreground text-2xl font-bold mb-3">
            Different Shop Detected
          </Text>

          <Text className="text-muted-foreground mb-5">
            Your cart already contains items from {cartShopName}. Adding items from{" "}
            {currentShopName} will clear your current cart.
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button variant="outline" onPress={onCancel}>
                <Text className="text-foreground font-medium">Cancel</Text>
              </Button>
            </View>

            <View className="flex-1">
              <Button onPress={onConfirm}>
                <Text className="text-primary-foreground font-medium">
                  Continue
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}