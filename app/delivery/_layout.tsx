import { ThemeProvider } from "@/lib/theme-context";
import { Stack } from "expo-router";

export default function DeliveryLayout() {
  return (
    <ThemeProvider defaultTheme="light">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
