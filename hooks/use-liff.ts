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

      // Initialize LIFF
      await liff.init({ liffId });
      setLiffInstance(liff);
      setIsInitialized(true);

      // Check if user is logged in
      const loggedIn = liff.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Get LINE profile
        const lineProfile = await liff.getProfile();
        setProfile({
          userId: lineProfile.userId,
          displayName: lineProfile.displayName,
          pictureUrl: lineProfile.pictureUrl,
          statusMessage: lineProfile.statusMessage,
        });
      } else {
        // If not logged in, login
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

