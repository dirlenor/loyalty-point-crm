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
  const { toast } = useToast();
  const router = useRouter();
  const { liff, profile, isInitialized, isLoggedIn, error: liffError } = useLiff();

  useEffect(() => {
    const handleLiffLogin = async () => {
      // Wait for LIFF to initialize
      if (!isInitialized) {
        return;
      }

      // If there's an error, show it
      if (liffError) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: liffError,
          variant: "destructive",
        });
        return;
      }

      // If not logged in, LIFF will handle login automatically
      if (!isLoggedIn) {
        return;
      }

      // If we have a profile, process login
      if (profile && !isProcessing) {
        setIsProcessing(true);
        try {
          const result = await findOrCreateProfileByLineUserId(
            profile.userId,
            profile.displayName
          );

          if (result.success && result.data) {
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

            router.push("/customer/dashboard");
          } else {
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

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff4b00]" />
              <p className="text-sm text-muted-foreground">กำลังเชื่อมต่อกับ LINE...</p>
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
            <p className="text-sm text-muted-foreground text-center">
              กรุณาตรวจสอบการตั้งค่า LIFF App ID หรือลองใหม่อีกครั้ง
            </p>
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

  // Show processing state
  if (isProcessing || (isLoggedIn && profile)) {
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
