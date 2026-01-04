import { getRewards, deleteReward } from "@/app/actions/rewards";
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
import { Plus, Edit, Trash2, Gift } from "lucide-react";
import { RewardDialog } from "@/components/reward-dialog";
import { DeleteRewardButton } from "@/components/delete-reward-button";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function ManageRewardsPage() {
  const rewards = await getRewards();

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[green-50] rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#00D084]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-[#1c1d1d]">จัดการรางวัล</CardTitle>
                  <CardDescription className="text-[#6b7280]">เพิ่ม/แก้ไข/ลบ สินค้ารางวัล</CardDescription>
                </div>
              </div>
              <RewardDialog>
                <Button className="bg-[#00D084] hover:bg-[#00D084]/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  เพิ่มรางวัล
                </Button>
              </RewardDialog>
            </div>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                ยังไม่มีรางวัล กรุณาเพิ่มรางวัลใหม่
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#e5e7eb]">
                      <TableHead className="text-[#6b7280] font-medium">ชื่อรางวัล</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">คำอธิบาย</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">แต้มที่ใช้</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">สต็อก</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">รูปภาพ</TableHead>
                      <TableHead className="text-right text-[#6b7280] font-medium">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.map((reward) => (
                      <TableRow key={reward.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <TableCell className="font-medium text-[#1c1d1d]">{reward.title}</TableCell>
                        <TableCell className="text-[#6b7280]">{reward.description || "-"}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#00D084]">{reward.points_required} แต้ม</span>
                        </TableCell>
                        <TableCell>
                          <span className={reward.stock === 0 ? "text-red-500 font-semibold" : "text-[#6b7280]"}>
                            {reward.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {reward.image_url ? (
                            <img 
                              src={reward.image_url} 
                              alt={reward.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-[#9ca3af]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <RewardDialog reward={reward}>
                              <Button variant="outline" size="sm" className="border-[#e5e7eb] hover:bg-[#f9fafb]">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </RewardDialog>
                            <DeleteRewardButton rewardId={reward.id} rewardTitle={reward.title} />
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
