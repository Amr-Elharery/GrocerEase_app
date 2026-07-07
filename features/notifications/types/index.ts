export interface NotificationItem {
  id: string | number;
  title?: string;
  body?: string;
  read?: boolean;
  is_read?: boolean;
  created_at?: string;
  notification_id?:string;
  
}
