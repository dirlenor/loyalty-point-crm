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
  debugLogs: string[];
  initLiff: () => Promise<void>;
}

export function useLiff(): UseLiffReturn {
  const [liffInstance, setLiffInstance] = useState<typeof liff | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs((prev) => [...prev, logMessage].slice(-20)); // Keep last 20 logs
  };

  const initLiff = async () => {
    try {
      addLog("เริ่มต้น LIFF initialization");
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      
      if (!liffId) {
        addLog("ERROR: LIFF ID ไม่พบ");
        throw new Error("LIFF ID is not configured. Please set NEXT_PUBLIC_LIFF_ID in your environment variables.");
      }

      addLog(`LIFF ID: ${liffId.substring(0, 10)}...`);

      // Initialize LIFF with error handling
      try {
        addLog("กำลังเรียก liff.init()...");
        await liff.init({ liffId });
        addLog("✓ LIFF initialized สำเร็จ");
      } catch (initError: any) {
        addLog(`ERROR: LIFF init failed - ${initError.message || initError.code || 'Unknown error'}`);
        // Check for specific error codes
        if (initError.code === "INVALID_LIFF_ID" || initError.message?.includes("400")) {
          throw new Error("LIFF App ID ไม่ถูกต้อง หรือ Endpoint URL ไม่ตรงกับที่ตั้งค่าใน LINE Developers Console. กรุณาตรวจสอบการตั้งค่า LIFF App");
        }
        throw initError;
      }

      setLiffInstance(liff);
      setIsInitialized(true);
      addLog("✓ isInitialized = true");

      // Check if user is logged in
      const loggedIn = liff.isLoggedIn();
      addLog(`ตรวจสอบ login status: ${loggedIn ? 'Logged in' : 'Not logged in'}`);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Get LINE profile
        try {
          addLog("กำลังดึง LINE profile...");
          const lineProfile = await liff.getProfile();
          addLog(`✓ ได้ profile: ${lineProfile.displayName} (${lineProfile.userId.substring(0, 8)}...)`);
          setProfile({
            userId: lineProfile.userId,
            displayName: lineProfile.displayName,
            pictureUrl: lineProfile.pictureUrl,
            statusMessage: lineProfile.statusMessage,
          });
        } catch (profileError: any) {
          addLog(`ERROR: ไม่สามารถดึง profile - ${profileError.message || 'Unknown error'}`);
          throw new Error("ไม่สามารถดึงข้อมูล LINE Profile ได้. กรุณาตรวจสอบ Scope ที่ตั้งค่าใน LIFF App");
        }
      } else {
        // If not logged in, login
        addLog("User ยังไม่ login, เรียก liff.login()...");
        // Don't wait for login redirect, it will happen automatically
        liff.login();
        addLog("✓ liff.login() ถูกเรียกแล้ว (รอ redirect)");
      }
    } catch (err: any) {
      addLog(`ERROR: ${err.message || 'Failed to initialize LIFF'}`);
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
    debugLogs,
    initLiff,
  };
}

