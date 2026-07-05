import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { THEME, useTheme } from "@/lib/theme";
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
  const { t } = useTranslation();

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
            {t("cart.conflictModal.title")}
          </Text>

          <Text className="text-muted-foreground mb-5">
            {t("cart.conflictModal.message", { cartShopName, currentShopName })}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button variant="outline" onPress={onCancel}>
                <Text className="text-foreground font-medium">{t("common.cancel")}</Text>
              </Button>
            </View>

            <View className="flex-1">
              <Button onPress={onConfirm}>
                <Text className="text-primary-foreground font-medium">
                  {t("common.continue")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
