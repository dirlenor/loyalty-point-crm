import { getRedemptions, updateRedemptionStatus } from "@/app/actions/redemptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { UpdateStatusButton } from "@/components/update-status-button";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function RedemptionsPage() {
  const redemptions = await getRedemptions();

  return (
    <DashboardLayout>
      <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>รายการแลกรางวัล</CardTitle>
          <CardDescription>ดูและจัดการรายการแลกรางวัลทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              ยังไม่มีรายการแลกรางวัล
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>เบอร์โทรศัพท์</TableHead>
                    <TableHead>รางวัล</TableHead>
                    <TableHead>แต้มที่ใช้</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((redemption: any) => {
                    const customer = redemption.profiles;
                    const reward = redemption.rewards;
                    return (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          {format(
                            new Date(redemption.created_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer?.full_name || "-"}
                        </TableCell>
                        <TableCell>{customer?.phone || "-"}</TableCell>
                        <TableCell>{reward?.title || "-"}</TableCell>
                        <TableCell>
                          {reward?.points_required || 0} แต้ม
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              redemption.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {redemption.status === "completed"
                              ? "เสร็จสิ้น"
                              : "รอดำเนินการ"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {redemption.status === "pending" && (
                            <UpdateStatusButton
                              redemptionId={redemption.id}
                              currentStatus={redemption.status}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

