 import { httpService } from "./httpService";
import AsyncStorage from "@react-native-async-storage/async-storage";
export interface NotificationItem {
  id: string | number;
  title?: string;
  message?: string;
  body?: string;
  description?: string;
  read?: boolean;
  is_read?: boolean;
  status?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
}

function normalizeNotifications(payload: any): NotificationItem[] {
  if (Array.isArray(payload)) {
    return payload;
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
        return candidate;
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