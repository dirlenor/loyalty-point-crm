import { getAllHistory } from "@/app/actions/history";
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
import { History, TrendingUp, TrendingDown, Wallet, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  const historyItems = await getAllHistory();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "redemption":
        return <Gift className="w-4 h-4" />;
      case "topup":
        return <Wallet className="w-4 h-4" />;
      case "slip_verification":
      case "point_add":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "redemption":
        return "แลกรางวัล";
      case "topup":
        return "เติมเงิน";
      case "slip_verification":
        return "ยืนยันสลิป";
      case "point_add":
        return "เพิ่มแต้ม";
      default:
        return "อื่นๆ";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "redemption":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "topup":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "slip_verification":
      case "point_add":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

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
                <CardDescription className="text-[#6b7280]">
                  รายการการทำรายการทั้งหมดในระบบ (แลกรางวัล, เพิ่มแต้ม, เติมเงิน)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {historyItems.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                ยังไม่มีประวัติการทำรายการ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#e5e7eb]">
                      <TableHead className="text-[#6b7280] font-medium">วันที่/เวลา</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">ประเภท</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">ลูกค้า</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">เบอร์โทรศัพท์</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">รายละเอียด</TableHead>
                      <TableHead className="text-[#6b7280] font-medium text-right">แต้ม</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyItems.map((item) => (
                      <TableRow key={item.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <TableCell className="text-[#6b7280]">
                          {format(new Date(item.date), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getTypeColor(item.type)} flex items-center gap-1 w-fit`}
                          >
                            {getTypeIcon(item.type)}
                            {getTypeLabel(item.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-[#1c1d1d]">
                          {item.customer.name}
                        </TableCell>
                        <TableCell className="text-[#6b7280] font-mono">
                          {item.customer.phone || "-"}
                        </TableCell>
                        <TableCell className="text-[#1c1d1d]">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              item.pointsChange > 0
                                ? "text-green-600"
                                : item.pointsChange < 0
                                ? "text-red-600"
                                : "text-[#6b7280]"
                            }`}
                          >
                            {item.pointsChange > 0 ? "+" : ""}
                            {item.pointsChange.toLocaleString()}
                          </span>
                          <span className="text-sm text-[#6b7280] ml-1">แต้ม</span>
                        </TableCell>
                        <TableCell>
                          {item.status ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.status === "completed" || item.status === "success"
                                  ? "bg-[#d1fae5] text-[#065f46]"
                                  : item.status === "approved"
                                  ? "bg-[#d1fae5] text-[#065f46]"
                                  : "bg-[#fef3c7] text-[#92400e]"
                              }`}
                            >
                              {item.status === "completed" || item.status === "success"
                                ? "เสร็จสิ้น"
                                : item.status === "approved"
                                ? "อนุมัติ"
                                : item.status === "pending"
                                ? "รอดำเนินการ"
                                : item.status}
                            </span>
                          ) : (
                            <span className="text-[#6b7280] text-sm">-</span>
                          )}
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
