import { AuthProvider } from "@/lib/auth-context";
import i18n, { initI18n } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme-context";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import "./global.css";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n()
      .catch(() => null)
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="optimization"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="product-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen
              name="forgot-password"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="verification-code"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="reset-password"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="change-password"
              options={{ headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
          <PortalHost />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
