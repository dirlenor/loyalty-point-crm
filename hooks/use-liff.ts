"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface UseLiffReturn {
  liff: typeof liff | null;
  profile: LiffProfile | null;
  isInitialized: boolean;
  isLoggedIn: boolean;
  error: string | null;
  initLiff: () => Promise<void>;
}

export function useLiff(): UseLiffReturn {
  const [liffInstance, setLiffInstance] = useState<typeof liff | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initLiff = async () => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      
      if (!liffId) {
        throw new Error("LIFF ID is not configured. Please set NEXT_PUBLIC_LIFF_ID in your environment variables.");
      }

      console.log("Initializing LIFF with ID:", liffId);

      // Initialize LIFF with error handling
      try {
        await liff.init({ liffId });
        console.log("LIFF initialized successfully");
      } catch (initError: any) {
        console.error("LIFF init error:", initError);
        // Check for specific error codes
        if (initError.code === "INVALID_LIFF_ID" || initError.message?.includes("400")) {
          throw new Error("LIFF App ID ไม่ถูกต้อง หรือ Endpoint URL ไม่ตรงกับที่ตั้งค่าใน LINE Developers Console. กรุณาตรวจสอบการตั้งค่า LIFF App");
        }
        throw initError;
      }

      setLiffInstance(liff);
      setIsInitialized(true);

      // Check if user is logged in
      const loggedIn = liff.isLoggedIn();
      console.log("LIFF logged in status:", loggedIn);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Get LINE profile
        try {
          console.log("Getting LINE profile...");
          const lineProfile = await liff.getProfile();
          console.log("LINE profile retrieved:", lineProfile);
          setProfile({
            userId: lineProfile.userId,
            displayName: lineProfile.displayName,
            pictureUrl: lineProfile.pictureUrl,
            statusMessage: lineProfile.statusMessage,
          });
        } catch (profileError: any) {
          console.error("Get profile error:", profileError);
          throw new Error("ไม่สามารถดึงข้อมูล LINE Profile ได้. กรุณาตรวจสอบ Scope ที่ตั้งค่าใน LIFF App");
        }
      } else {
        // If not logged in, login
        console.log("User not logged in, redirecting to login...");
        // Don't wait for login redirect, it will happen automatically
        liff.login();
      }
    } catch (err: any) {
      console.error("LIFF initialization error:", err);
      setError(err.message || "Failed to initialize LIFF");
      setIsInitialized(false);
    }
  };

  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window !== "undefined") {
      initLiff();
    }
  }, []);

  return {
    liff: liffInstance,
    profile,
    isInitialized,
    isLoggedIn,
    error,
    initLiff,
  };
}

