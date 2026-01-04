"use client";

import { useState, useEffect } from "react";
import { getPromotions, togglePromotionStatus } from "@/app/actions/promotions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Megaphone, Loader2 } from "lucide-react";
import { PromotionDialog } from "@/components/promotion-dialog";
import { DeletePromotionButton } from "@/components/delete-promotion-button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ManagePromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPromotions = async () => {
    try {
      const data = await getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโปรโมชั่นได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await togglePromotionStatus(id, !currentStatus);
      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: result.message,
        });
        loadPromotions();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเปลี่ยนสถานะได้",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#00D084]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[green-50] rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-[#00D084]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-[#1c1d1d]">จัดการโปรโมชั่น</CardTitle>
                  <CardDescription className="text-[#6b7280]">เพิ่ม/แก้ไข/ลบ โปรโมชั่น</CardDescription>
                </div>
              </div>
              <PromotionDialog onSuccess={loadPromotions}>
                <Button className="bg-[#00D084] hover:bg-[#00D084]/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  เพิ่มโปรโมชั่น
                </Button>
              </PromotionDialog>
            </div>
          </CardHeader>
          <CardContent>
            {promotions.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                ยังไม่มีโปรโมชั่น กรุณาเพิ่มโปรโมชั่นใหม่
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#e5e7eb]">
                      <TableHead className="text-[#6b7280] font-medium">ชื่อโปรโมชั่น</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">คำอธิบาย</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">สถานะ</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">รูปภาพ</TableHead>
                      <TableHead className="text-right text-[#6b7280] font-medium">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promotion) => (
                      <TableRow key={promotion.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <TableCell className="font-medium text-[#1c1d1d]">{promotion.title}</TableCell>
                        <TableCell className="text-[#6b7280] max-w-md truncate">
                          {promotion.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={promotion.is_active ? "default" : "secondary"}
                            className={promotion.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {promotion.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {promotion.image_url ? (
                            <img 
                              src={promotion.image_url} 
                              alt={promotion.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-[#9ca3af]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(promotion.id, promotion.is_active)}
                              className="border-[#e5e7eb] hover:bg-[#f9fafb]"
                            >
                              {promotion.is_active ? "ปิด" : "เปิด"}
                            </Button>
                            <PromotionDialog promotion={promotion} onSuccess={loadPromotions}>
                              <Button variant="outline" size="sm" className="border-[#e5e7eb] hover:bg-[#f9fafb]">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PromotionDialog>
                            <DeletePromotionButton 
                              promotionId={promotion.id} 
                              promotionTitle={promotion.title}
                              onSuccess={loadPromotions}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

