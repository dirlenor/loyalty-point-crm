"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { findOrCreateProfileByLineUserId } from "@/app/actions/profiles";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/hooks/use-liff";
import { User, Loader2, AlertCircle } from "lucide-react";

export default function CustomerLoginPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { liff, profile, isInitialized, isLoggedIn, error: liffError, debugLogs } = useLiff();

  useEffect(() => {
    const handleLiffLogin = async () => {
      console.log("handleLiffLogin called", { isInitialized, isLoggedIn, hasProfile: !!profile, liffError, isProcessing });
      
      // Wait for LIFF to initialize
      if (!isInitialized) {
        console.log("Waiting for LIFF initialization...");
        return;
      }

      // If there's an error, show it
      if (liffError) {
        console.error("LIFF error:", liffError);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: liffError,
          variant: "destructive",
        });
        return;
      }

      // If not logged in, LIFF will handle login automatically (redirect happens)
      // Just show loading state
      if (!isLoggedIn) {
        console.log("Not logged in, waiting for redirect...");
        return;
      }

      // If we have a profile, process login
      if (profile && !isProcessing) {
        console.log("Processing login with profile:", profile);
        setIsProcessing(true);
        try {
          const result = await findOrCreateProfileByLineUserId(
            profile.userId,
            profile.displayName
          );

          if (result.success && result.data) {
            console.log("Login successful, saving to localStorage");
            // Save to localStorage for session
            localStorage.setItem("line_user_id", profile.userId);
            localStorage.setItem("customer_id", result.data.id);
            localStorage.setItem("customer_name", result.data.full_name || profile.displayName);
            localStorage.setItem("customer_points", result.data.total_points?.toString() || "0");
            if (profile.pictureUrl) {
              localStorage.setItem("customer_picture", profile.pictureUrl);
            }

            toast({
              title: "เข้าสู่ระบบสำเร็จ",
              description: `ยินดีต้อนรับ ${result.data.full_name || profile.displayName}`,
            });

            // Use window.location for immediate redirect in LIFF
            window.location.href = "/customer/dashboard";
            return; // Exit early to prevent further execution
          } else {
            console.error("Login failed:", result.message);
            toast({
              title: "เกิดข้อผิดพลาด",
              description: result.message || "ไม่สามารถเข้าสู่ระบบได้",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error("Login error:", error);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: error.message || "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleLiffLogin();
  }, [isInitialized, isLoggedIn, profile, liffError, router, toast, isProcessing]);

  // Show loading state while initializing or waiting for login
  if (!isInitialized || (isInitialized && !isLoggedIn && !liffError)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff4b00]" />
              <p className="text-sm text-muted-foreground">
                {!isInitialized 
                  ? "กำลังเชื่อมต่อกับ LINE..." 
                  : "กำลังเข้าสู่ระบบ LINE..."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                กรุณารอสักครู่...
              </p>
              
              {/* Debug Panel */}
              <div className="w-full mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="w-full text-xs"
                >
                  {showDebug ? "ซ่อน" : "แสดง"} Debug Logs
                </Button>
                
                {showDebug && (
                  <div className="mt-3 bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-48 overflow-y-auto">
                    <div className="mb-2 text-yellow-400 font-semibold">Debug Logs:</div>
                    {debugLogs.length === 0 ? (
                      <div className="text-gray-500">ยังไม่มี logs...</div>
                    ) : (
                      debugLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log.includes("ERROR") ? (
                            <span className="text-red-400">{log}</span>
                          ) : log.includes("✓") ? (
                            <span className="text-green-400">{log}</span>
                          ) : (
                            <span>{log}</span>
                          )}
                        </div>
                      ))
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-700 text-gray-500">
                      <div>State: initialized={String(isInitialized)}, loggedIn={String(isLoggedIn)}</div>
                      <div>LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID ? `${process.env.NEXT_PUBLIC_LIFF_ID.substring(0, 10)}...` : 'Not set'}</div>
                      <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if LIFF initialization failed
  if (liffError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>{liffError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-center font-semibold">สาเหตุที่เป็นไปได้:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>เปิดใน browser ธรรมดา (ต้องเปิดผ่าน LINE App)</li>
                <li>LIFF Endpoint URL ไม่ตรงกับที่ตั้งค่า</li>
                <li>LIFF App ID ไม่ถูกต้อง</li>
                <li>Scope ที่ตั้งค่าไม่ถูกต้อง</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">ตรวจสอบการตั้งค่า:</p>
              <p>LIFF Endpoint URL ต้องเป็น:</p>
              <p className="font-mono bg-white p-1 rounded mt-1">
                https://loyalty-point-crm.vercel.app/customer/login
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              size="lg"
            >
              ลองใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show processing state (only while processing, not after success)
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff4b00]" />
              <p className="text-sm text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default state (shouldn't reach here normally, but just in case)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-[#ff4b00] rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรุณาเข้าสู่ระบบผ่าน LINE
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>ระบบจะเชื่อมต่อกับ LINE อัตโนมัติ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
