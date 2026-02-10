import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground text-lg">Profile Screen</Text>
        <Pressable
          onPress={() => router.push("/order-history")}
          className="mt-4 px-4 py-2 bg-card border border-border rounded-full"
        >
          <Text className="text-foreground">View Order History</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
