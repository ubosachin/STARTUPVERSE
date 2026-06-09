"use client";

import { useEffect, useState, useCallback } from "react";
import { getNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const notifs = await getNotificationsAction() as NotificationItem[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationReadAction(id);
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    refetch: loadNotifications
  };
}
