import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getNotificationStats } from "../service/notificationService";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthProvider";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, authLoaded } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    totalCount: 0,
    unreadCount: 0,
    todayCount: 0,
  });
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch stats từ API
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getNotificationStats();
      setStats(response);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  }, [isAuthenticated]);

  // Load stats khi component mount
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStats();

    // Auto refresh mỗi 5 phút như fallback
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, [fetchStats, isAuthenticated]);

  // Hàm tăng/decrease/reset
  const incrementUnread = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
    setStats((prev) => ({
      ...prev,
      unreadCount: prev.unreadCount + 1,
      todayCount: prev.todayCount + 1,
      totalCount: prev.totalCount + 1,
    }));
  }, []);

  const decrementUnread = useCallback((count = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - count));
    setStats((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - count),
    }));
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
    setStats((prev) => ({ ...prev, unreadCount: 0 }));
  }, []);

  // WebSocket STOMP connection
  useEffect(() => {
    if (!authLoaded) {
      console.log("Waiting for auth to load...");
      return;
    }

    if (!isAuthenticated || !user) {
      console.log("User not authenticated, skipping WebSocket");
      return;
    }

    const token = localStorage.getItem("token");
    const userId = user.id || user.userId || localStorage.getItem("userId");

    if (!token || !userId) {
      console.warn("No token or userId found");
      return;
    }

    console.log("Initializing WebSocket for user:", userId);

    // Dùng native WebSocket (hiện đại, không cần SockJS)
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws-native",
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
    });

    stompClient.onConnect = (frame) => {
      console.log("STOMP Connected:", frame);
      setWsConnected(true);

      // 1. Subscribe to broadcast notifications
      const broadcastSub = stompClient.subscribe(
        "/topic/notifications",
        (message) => {
          console.log("Broadcast notification received:", message);
          try {
            const notification = JSON.parse(message.body);
            console.log("Parsed notification:", notification);
            incrementUnread();

            // Optional: Show toast notification
            // showToast(notification);
          } catch (error) {
            console.error("Error parsing notification:", error);
          }
        }
      );

      // 2. Subscribe to user-specific notifications
      const userSub = stompClient.subscribe(
        `/user/${userId}/queue/notifications`,
        (message) => {
          console.log("User notification received:", message.body);
          try {
            const notification = JSON.parse(message.body);
            console.log("Parsed user notification:", notification);
            incrementUnread();

            // Optional: Show toast notification
            // showToast(notification);
          } catch (error) {
            console.error("Error parsing user notification:", error);
          }
        }
      );

      console.log("Subscribed to notifications");
    };

    stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setWsConnected(false);
    };

    stompClient.onDisconnect = () => {
      console.log("STOMP Disconnected");
      setWsConnected(false);
    };

    stompClient.onWebSocketClose = () => {
      console.log("WebSocket Closed");
      setWsConnected(false);
    };

    stompClient.activate();

    return () => {
      console.log("🔌 Deactivating WebSocket");
      stompClient.deactivate();
      setWsConnected(false);
    };
  }, [authLoaded, isAuthenticated, user, incrementUnread]);

  const value = {
    unreadCount,
    stats,
    fetchStats,
    incrementUnread,
    decrementUnread,
    resetUnread,
    wsConnected, // Expose connection status
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
