"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/dashboard-layout";
import { updateTenantSettings, getTenantSettings } from "@/app/actions/tenant-settings";
import { useToast } from "@/hooks/use-toast";
import { useTenantBranding, triggerBrandingRefresh } from "@/lib/hooks/use-tenant-branding";
import { DEFAULT_BRANDING } from "@/lib/constants/default-branding";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const branding = useTenantBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: branding.shopName,
    logoText: branding.logoText,
    logoImageUrl: branding.logoImageUrl || "",
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor || "",
    lightColor: branding.lightColor || "",
  });

  const loadSettings = useCallback(async () => {
    const settings = await getTenantSettings();
    setFormData({
      shopName: settings.shopName,
      logoText: settings.logoText,
      logoImageUrl: settings.logoImageUrl || "",
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor || "",
      lightColor: settings.lightColor || "",
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData();
    form.append("shopName", formData.shopName);
    form.append("logoText", formData.logoText);
    form.append("logoImageUrl", formData.logoImageUrl || "");
    form.append("primaryColor", formData.primaryColor);
    form.append("secondaryColor", formData.secondaryColor || "");
    form.append("lightColor", formData.lightColor || "");

    const result = await updateTenantSettings(form);

    if (result.success) {
      toast({
        title: "บันทึกสำเร็จ",
        description: "ตั้งค่า branding ถูกอัปเดตแล้ว",
      });
      // Refresh router to update BrandingProvider (Server Component)
      // This will update CSS variables immediately
      router.refresh();
      // Reload settings form
      setTimeout(() => {
        loadSettings();
      }, 100);
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.error || "ไม่สามารถบันทึกได้",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData({
      shopName: DEFAULT_BRANDING.shopName,
      logoText: DEFAULT_BRANDING.logoText,
      logoImageUrl: "",
      primaryColor: DEFAULT_BRANDING.primaryColor,
      secondaryColor: "",
      lightColor: DEFAULT_BRANDING.lightColor || "",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle>ตั้งค่า Branding</CardTitle>
            <CardDescription>
              กำหนด Logo, ชื่อร้าน, และสีสำหรับระบบของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Name */}
              <div className="space-y-2">
                <Label htmlFor="shopName">ชื่อร้าน *</Label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) =>
                    setFormData({ ...formData, shopName: e.target.value })
                  }
                  placeholder="6CAT Point"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  ชื่อร้านที่จะแสดงในระบบ (สูงสุด 50 ตัวอักษร)
                </p>
              </div>

              {/* Logo Text */}
              <div className="space-y-2">
                <Label htmlFor="logoText">Logo Text</Label>
                <Input
                  id="logoText"
                  value={formData.logoText}
                  onChange={(e) =>
                    setFormData({ ...formData, logoText: e.target.value })
                  }
                  placeholder="6"
                  maxLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  ตัวอักษรหรือตัวเลขที่จะแสดงใน logo (สูงสุด 3 ตัวอักษร)
                </p>
              </div>

              {/* Logo Image URL */}
              <div className="space-y-2">
                <Label htmlFor="logoImageUrl">Logo Image URL (Optional)</Label>
                <Input
                  id="logoImageUrl"
                  type="url"
                  value={formData.logoImageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoImageUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  URL รูปภาพ logo (ถ้ามี)
                </p>
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">สีหลัก *</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    placeholder="#ff4b00"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  สีหลักที่ใช้ในปุ่ม, badges, และ highlights (รูปแบบ hex เช่น #ff4b00)
                </p>
              </div>

              {/* Light Color */}
              <div className="space-y-2">
                <Label htmlFor="lightColor">สีอ่อน (Background)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="lightColor"
                    type="color"
                    value={formData.lightColor || "#fff5f0"}
                    onChange={(e) =>
                      setFormData({ ...formData, lightColor: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.lightColor}
                    onChange={(e) =>
                      setFormData({ ...formData, lightColor: e.target.value })
                    }
                    placeholder="#fff5f0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  สีอ่อนสำหรับ background (รูปแบบ hex เช่น #fff5f0, ถ้าไม่กรอกจะใช้ค่าเริ่มต้น)
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">สีรอง (Optional)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor || "#000000"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryColor: e.target.value,
                      })
                    }
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  สีรอง (ถ้ามี, ถ้าไม่กรอกจะไม่ใช้)
                </p>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>ตัวอย่าง Branding</Label>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      <span className="text-white font-bold text-lg">
                        {formData.logoText || "?"}
                      </span>
                    </div>
                    <span className="font-bold text-xl">{formData.shopName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      style={{ backgroundColor: formData.primaryColor }}
                      className="text-white"
                    >
                      ปุ่มตัวอย่าง
                    </Button>
                    <div
                      className="px-4 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: formData.lightColor || "#fff5f0",
                        color: formData.primaryColor,
                      }}
                    >
                      Background ตัวอย่าง
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  รีเซ็ตเป็นค่าเริ่มต้น
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

