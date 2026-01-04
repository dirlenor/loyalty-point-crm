"use client";

import { useEffect, useState, useRef } from "react";
import { getAdminNotifications } from "@/app/actions/notifications";

interface NotificationData {
  pendingSlips: number;
  pendingRedemptions: number;
  pendingTopups: number;
  total: number;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationData>({
    pendingSlips: 0,
    pendingRedemptions: 0,
    pendingTopups: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const previousCountsRef = useRef<NotificationData>({
    pendingSlips: 0,
    pendingRedemptions: 0,
    pendingTopups: 0,
    total: 0,
  });
  const [isMuted, setIsMuted] = useState(false);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Play notification sound using Web Audio API
  const playNotificationSound = () => {
    if (isMuted) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      // Second beep for notification effect
      setTimeout(() => {
        try {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();

          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);

          oscillator2.frequency.value = 1000;
          oscillator2.type = "sine";

          gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.2);
        } catch (error) {
          // Ignore second beep error
        }
      }, 150);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (data: NotificationData) => {
    if (notificationPermission !== "granted") return;

    const messages: string[] = [];
    if (data.pendingSlips > 0) {
      messages.push(`สลิปรอตรวจสอบ: ${data.pendingSlips} รายการ`);
    }
    if (data.pendingRedemptions > 0) {
      messages.push(`รายการแลกรออนุมัติ: ${data.pendingRedemptions} รายการ`);
    }
    if (data.pendingTopups > 0) {
      messages.push(`รายการเติมเงินรอตรวจสอบ: ${data.pendingTopups} รายการ`);
    }

    if (messages.length === 0) return;

    const title = "มีข้อมูลที่ต้องจัดการ";
    const body = messages.join("\n");
    
    // Determine which page to navigate to
    let tag = "admin-notification";
    let url = "/";
    if (data.pendingSlips > 0) {
      url = "/admin/slip-review";
      tag = "slip-review";
    } else if (data.pendingRedemptions > 0) {
      url = "/admin/redemptions";
      tag = "redemptions";
    } else if (data.pendingTopups > 0) {
      url = "/admin/demo-topup/orders";
      tag = "topup-orders";
    }

    const notification = new Notification(title, {
      body,
      icon: "/asset/Group 23.png",
      badge: "/asset/Group 23.png",
      tag,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = url;
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  };

  // Poll for notifications
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getAdminNotifications();
        if (!isMounted) return;

        setNotifications(data);
        setIsLoading(false);

        // Check if there's new data
        const previous = previousCountsRef.current;
        const hasNewData =
          data.pendingSlips > previous.pendingSlips ||
          data.pendingRedemptions > previous.pendingRedemptions ||
          data.pendingTopups > previous.pendingTopups;

        // Only notify if there's new data and we have previous counts (not first load)
        if (hasNewData && previous.total > 0) {
          // Check mute state and permission at the time of notification
          if (!isMuted) {
            playNotificationSound();
          }
          if (notificationPermission === "granted") {
            showBrowserNotification(data);
          }
        }

        previousCountsRef.current = data;
      } catch (error) {
        console.error("Error loading notifications:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Load immediately
    loadNotifications();

    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isMuted, notificationPermission]);

  return {
    notifications,
    isLoading,
    notificationPermission,
    isMuted,
    setIsMuted,
  };
}

