import { AuthProvider } from "@/lib/auth-context";
import i18n, { initI18n } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme-context";
import { PortalHost } from "@rn-primitives/portal";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initI18n()
      .catch(() => null)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const openFromPayloadUrl = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      const productId =
        typeof parsed.queryParams?.product_id === "string"
          ? parsed.queryParams.product_id
          : undefined;
      if (!productId) return;
      router.push({
        pathname: "/product-details",
        params: {
          id: productId,
          select_cheapest: "1",
        },
      });
    };

    Linking.getInitialURL().then(openFromPayloadUrl).catch(() => null);
    const sub = Linking.addEventListener("url", (event) => openFromPayloadUrl(event.url));
    return () => sub.remove();
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
