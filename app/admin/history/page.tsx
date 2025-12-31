import { getRedemptions } from "@/app/actions/redemptions";
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
import { DashboardLayout } from "@/components/dashboard-layout";
import { History } from "lucide-react";

export default async function HistoryPage() {
  const redemptions = await getRedemptions();

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fff5f0] rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-[#ff4b00]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-[#1c1d1d]">ประวัติทั้งหมด</CardTitle>
                <CardDescription className="text-[#6b7280]">รายการการทำรายการทั้งหมดในระบบ</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {redemptions.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                ยังไม่มีประวัติการทำรายการ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#e5e7eb]">
                      <TableHead className="text-[#6b7280] font-medium">วันที่/เวลา</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">ลูกค้า</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">เบอร์โทรศัพท์</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">รางวัล</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">แต้มที่ใช้</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption: any) => (
                      <TableRow key={redemption.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <TableCell className="text-[#6b7280]">
                          {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium text-[#1c1d1d]">
                          {redemption.profiles?.full_name || "ไม่ระบุ"}
                        </TableCell>
                        <TableCell className="text-[#6b7280] font-mono">
                          {redemption.profiles?.phone || "-"}
                        </TableCell>
                        <TableCell className="text-[#1c1d1d]">
                          {redemption.rewards?.title || "ไม่ระบุ"}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#ff4b00]">
                            {redemption.rewards?.points_required || 0}
                          </span>
                          <span className="text-sm text-[#6b7280] ml-1">แต้ม</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              redemption.status === "completed"
                                ? "bg-[#d1fae5] text-[#065f46]"
                                : "bg-[#fef3c7] text-[#92400e]"
                            }`}
                          >
                            {redemption.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                          </span>
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
