"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findProfileByPhone } from "@/app/actions/profiles";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, User } from "lucide-react";

export default function CustomerLoginPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await findProfileByPhone(phone);
      
      if (result.success && result.data) {
        // Save to localStorage for session
        localStorage.setItem("customer_phone", phone);
        localStorage.setItem("customer_id", result.data.id);
        localStorage.setItem("customer_name", result.data.full_name || "");
        localStorage.setItem("customer_points", result.data.total_points?.toString() || "0");
        
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: `ยินดีต้อนรับ ${result.data.full_name || "ลูกค้า"}`,
        });
        
        router.push("/customer/dashboard");
      } else {
        toast({
          title: "ไม่พบข้อมูล",
          description: result.message || "ไม่พบข้อมูลลูกค้าในระบบ",
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-[#ff4b00] rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรุณากรอกเบอร์โทรศัพท์เพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="phone"
                type="tel"
                placeholder="0812345678"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="pl-10"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              หมายเหตุ: ระบบนี้เป็นระบบทดสอบ ยังไม่เชื่อมต่อกับ Line LIFF
            </p>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isLoading || !phone || phone.length !== 10}
            className="w-full"
            size="lg"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>ยังไม่มีบัญชี?</p>
            <p className="text-xs mt-1">
              กรุณาติดต่อแอดมินเพื่อสร้างบัญชี
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

