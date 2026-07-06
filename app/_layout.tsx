import { AuthProvider } from "@/features/auth/hooks/auth-context";
import { AddressProvider } from "@/features/addresses/hooks/addressContext";
import { CartProvider } from "@/features/cart/hooks/cartContext";
import i18n, { initI18n } from "@/lib/i18n";
import { RTLProvider } from "@/lib/i18n/RTLContext";
import { ToastProvider } from "@/lib/toast/useToast";
import { ThemeProvider } from "@/lib/theme";
import { PortalHost } from "@rn-primitives/portal";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
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
        pathname: "/products/[id]",
        params: {
          id: productId,
          select_cheapest: "1",
        },
      });
    };

    Linking.getInitialURL()
      .then(openFromPayloadUrl)
      .catch(() => null);
    const sub = Linking.addEventListener("url", (event) =>
      openFromPayloadUrl(event.url),
    );
    return () => sub.remove();
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <RTLProvider>
        <ThemeProvider defaultTheme="light">
          <AddressProvider>
            <AuthProvider>
              <CartProvider>
              <ToastProvider>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="welcome"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="location-permission"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="location-picker"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="address-details-form"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="optimization"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="products"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="notifications"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="order-tracking"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="checkout"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="address-book"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile-orders"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="addresses"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="location-setup"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="shop" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="shop-product"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="driver"
                    options={{ headerShown: false }}
                  />
                </Stack>

                <StatusBar style="auto" />
                <PortalHost />
              </ToastProvider>
              </CartProvider>
            </AuthProvider>
          </AddressProvider>
        </ThemeProvider>
        </RTLProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
