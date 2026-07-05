import {
  getNotifications,
  markNotificationAsRead,
  type NotificationItem,
} from "@/shared/notification.service";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, CheckCircle2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { useAuth } from "@/lib/auth-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingIds, setMarkingIds] = useState<(string | number)[]>([]);

const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error: any) {
      console.error("Failed to load notifications", error);
      const status = error?.response?.status;
      if (status === 401) {
        Alert.alert("Session expired", "Please log in again.");
      } else {
        Alert.alert(
          "Notifications",
          error?.message || "Unable to load notifications.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notificationId: string | number) => {
    if (markingIds.includes(notificationId)) {
      return;
    }

    try {
      setMarkingIds((current) => [...current, notificationId]);
      await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? { ...item, read: true, is_read: true }
            : item,
        ),
      );
    } catch (error: any) {
      Alert.alert(
        "Notifications",
        error?.message || "Unable to mark notification as read.",
      );
    } finally {
      setMarkingIds((current) =>
        current.filter((item) => item !== notificationId),
      );
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isRead = item.read || item.is_read;
    const title = item.title || "Notification";
    const message = item.body || "";

    return (
      <View className="mb-3 rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {title}
            </Text>
            {!!message && (
              <Text className="mt-1 text-sm text-muted-foreground">
                {message}
              </Text>
            )}
          </View>
          {isRead ? (
            <CheckCircle2 size={18} className="text-primary" />
          ) : (
            <Bell size={18} className="text-primary" />
          )}
        </View>

        {!isRead && (
          <Pressable
            onPress={() => handleMarkRead(item.id)}
            className="mt-4 self-start rounded-full bg-primary px-3 py-2"
            disabled={markingIds.includes(item.id)}
          >
            {markingIds.includes(item.id) ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-sm font-semibold text-primary-foreground">
                Mark read
              </Text>
            )}
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <ProtectedScreen screenName="Notifications">
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 px-4 pb-6">
          <View className="mb-4 flex-row items-center justify-between py-4">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 rounded-full p-2"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <Text className="flex-1 text-xl font-semibold text-foreground">
              Notifications
            </Text>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6">
              <Bell size={28} className="text-muted-foreground" />
              <Text className="mt-3 text-center text-base font-semibold text-foreground">
                No notifications yet
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                You will see updates here when they arrive.
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
