import httpService from "@/shared/httpService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NotificationItem } from "@/features/notifications/types";

export type { NotificationItem } from "@/features/notifications/types";

// The real backend nests the actual title/body under `notification`:
// {id, user_id, notification_id, is_read, read_at, created_at,
//  notification: {id, title, body, data, created_at}}
function normalizeNotification(raw: any): NotificationItem {
  return {
    id: raw?.notification_id,
    title: raw?.notification?.title ?? raw?.title,
    body: raw?.notification?.body ?? raw?.body,
    is_read: raw?.is_read ?? raw?.read,
    read: raw?.is_read ?? raw?.read,
    created_at: raw?.created_at ?? raw?.notification?.created_at,
  };
}

function normalizeNotifications(payload: any): NotificationItem[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeNotification);
  }

  if (payload && typeof payload === "object") {
    const candidates = [
      payload.data,
      payload.notifications,
      payload.items,
      payload.results,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.map(normalizeNotification);
      }
    }
  }

  return [];
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await httpService.get("/notifications", {
  headers: {
    Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
  },
});

  console.log("Notifications Response:", response.data);

  return normalizeNotifications(response.data);
}

export async function markNotificationAsRead(
  id: string | number,
): Promise<any> {
  const response = await httpService.patch(
    `/notifications/${id}/read`,
    {}
  );

  return response.data;
}
