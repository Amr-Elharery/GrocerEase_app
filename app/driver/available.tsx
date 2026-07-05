import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { MapPin, Store } from "lucide-react-native";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useToast } from "@/lib/toast/useToast";
import { fetchAvailableJobs } from "@/features/driver/services/delivery.service";
import { AvailableJob } from "@/features/driver/types";

const PAGE_SIZE = 10;

export default function AvailableJobsScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const showToast = useToast();

  const [jobs, setJobs] = useState<AvailableJob[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadJobs = useCallback(
    async (nextOffset: number, replace: boolean) => {
      try {
        const data = await fetchAvailableJobs(PAGE_SIZE, nextOffset);
        setHasMore(data.length === PAGE_SIZE);
        setJobs((prev) => (replace ? data : [...prev, ...data]));
        setOffset(nextOffset);
      } catch {
        showToast(t("driver.available.couldNotLoadJobs"), "error");
      }
    },
    [showToast, t],
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadJobs(0, true).finally(() => setLoading(false));
    }, [loadJobs]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs(0, true);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    await loadJobs(offset + PAGE_SIZE, false);
    setLoadingMore(false);
  };

  const openJob = (job: AvailableJob) => {
    router.push({
      pathname: "/driver/job/[id]",
      params: {
        id:
          job.type === "group"
            ? String(job.order_group_id)
            : String(job.order.id),
        job: JSON.stringify(job),
      },
    });
  };

  const renderItem = ({ item }: { item: AvailableJob }) => {
    if (item.type === "group") {
      const shopNames = item.orders.map((o) => o.shop_name).filter(Boolean);
      const total = item.orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
      return (
        <TouchableOpacity
          onPress={() => openJob(item)}
          className="rounded-2xl border p-4 mb-3"
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <View className="flex-row items-center mb-2">
            <Store size={18} color={tokens.primary} />
            <Text
              className={isRTL ? "mr-2 font-bold text-base" : "ml-2 font-bold text-base"}
              style={{ color: tokens.foreground }}
            >
              {t("driver.available.multiStopDelivery", { count: item.orders.length })}
            </Text>
          </View>
          <Text style={{ color: tokens.mutedForeground }}>
            {shopNames.join(", ")}
          </Text>
          <View className="flex-row items-center mt-2">
            <MapPin size={14} color={tokens.mutedForeground} />
            <Text
              className={isRTL ? "mr-1" : "ml-1"}
              style={{ color: tokens.mutedForeground }}
              numberOfLines={1}
            >
              {item.orders[0]?.customer_address ?? t("driver.available.customerAddress")}
            </Text>
          </View>
          <Text
            className="mt-2 font-semibold"
            style={{ color: tokens.foreground }}
          >
            {t("driver.available.total", { total })}
          </Text>
        </TouchableOpacity>
      );
    }

    const order = item.order;
    return (
      <TouchableOpacity
        onPress={() => openJob(item)}
        className="rounded-2xl border p-4 mb-3"
        style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
      >
        <View className="flex-row items-center mb-2">
          <Store size={18} color={tokens.primary} />
          <Text
            className={isRTL ? "mr-2 font-bold text-base" : "ml-2 font-bold text-base"}
            style={{ color: tokens.foreground }}
          >
            {order.shop_name ?? t("driver.available.shop")}
          </Text>
        </View>
        <Text style={{ color: tokens.mutedForeground }} numberOfLines={1}>
          {order.shop_address}
        </Text>
        <View className="flex-row items-center mt-2">
          <MapPin size={14} color={tokens.mutedForeground} />
          <Text
            className={isRTL ? "mr-1" : "ml-1"}
            style={{ color: tokens.mutedForeground }}
            numberOfLines={1}
          >
            {order.customer_address}
          </Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text style={{ color: tokens.mutedForeground }}>
            {t("driver.available.itemsCount", { count: order.item_count ?? order.items?.length ?? 0 })}
          </Text>
          <Text
            className="font-semibold"
            style={{ color: tokens.foreground }}
          >
            {t("driver.available.subtotalFee", { subtotal: order.subtotal ?? 0, fee: order.delivery_fee ?? 0 })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View
        className="flex-row items-center px-4 py-4 border-b"
        style={{ borderColor: tokens.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className={isRTL ? "ml-3" : "mr-3"}>
          <BackIcon variant="chevron" size={24} color={tokens.foreground} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ color: tokens.foreground }}
        >
          {t("driver.available.title")}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={tokens.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) =>
            item.type === "group"
              ? `group-${item.order_group_id}`
              : `single-${item.order.id}-${index}`
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 12 }}
                color={tokens.primary}
              />
            ) : null
          }
          ListEmptyComponent={
            <Text
              className="text-center mt-8"
              style={{ color: tokens.mutedForeground }}
            >
              {t("driver.available.noJobsFound")}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
