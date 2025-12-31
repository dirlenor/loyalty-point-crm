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
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { RewardDialog } from "@/components/reward-dialog";
import { DeleteRewardButton } from "@/components/delete-reward-button";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function ManageRewardsPage() {
  const rewards = await getRewards();

  return (
    <DashboardLayout>
      <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>จัดการรางวัล</CardTitle>
              <CardDescription>เพิ่ม/แก้ไข/ลบ สินค้ารางวัล</CardDescription>
            </div>
            <RewardDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มรางวัล
              </Button>
            </RewardDialog>
          </div>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              ยังไม่มีรางวัล กรุณาเพิ่มรางวัลใหม่
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อรางวัล</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>แต้มที่ใช้</TableHead>
                    <TableHead>สต็อก</TableHead>
                    <TableHead>รูปภาพ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-medium">{reward.title}</TableCell>
                      <TableCell>{reward.description || "-"}</TableCell>
                      <TableCell>{reward.points_required} แต้ม</TableCell>
                      <TableCell>
                        <span className={reward.stock === 0 ? "text-red-500 font-semibold" : ""}>
                          {reward.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {reward.image_url ? (
                          <img 
                            src={reward.image_url} 
                            alt={reward.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <RewardDialog reward={reward}>
                            <Button variant="outline" size="sm">
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

