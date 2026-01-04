"use client";

import { useEffect, useState } from "react";
import { getAllHistory, HistoryItem } from "@/app/actions/history";
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
import { History, TrendingUp, Wallet, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

type FilterType = "all" | "redemption" | "topup" | "slip_verification" | "point_add";

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Apply filter
    let filtered = historyItems;
    if (filter !== "all") {
      filtered = historyItems.filter((item) => item.type === filter);
    }
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter, historyItems]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHistory();
      setHistoryItems(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "ทั้งหมด", count: historyItems.length },
    {
      value: "redemption",
      label: "แลกรางวัล",
      count: historyItems.filter((item) => item.type === "redemption").length,
    },
    {
      value: "topup",
      label: "เติมเงิน",
      count: historyItems.filter((item) => item.type === "topup").length,
    },
    {
      value: "slip_verification",
      label: "ยืนยันสลิป",
      count: historyItems.filter((item) => item.type === "slip_verification").length,
    },
    {
      value: "point_add",
      label: "เพิ่มแต้ม",
      count: historyItems.filter((item) => item.type === "point_add").length,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[green-50] rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-[#00D084]" />
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
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#e5e7eb]">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                  className={`${
                    filter === option.value
                      ? "bg-[#00D084] text-white hover:bg-[#00D084]/90"
                      : "bg-white text-[#6b7280] hover:bg-[#f9fafb]"
                  }`}
                >
                  {option.label}
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${
                      filter === option.value
                        ? "bg-white/20 text-white"
                        : "bg-[#f3f4f6] text-[#6b7280]"
                    }`}
                  >
                    {option.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#00D084]" />
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                ยังไม่มีประวัติการทำรายการ{filter !== "all" ? `ในประเภท "${filterOptions.find((o) => o.value === filter)?.label}"` : ""}
              </div>
            ) : (
              <>
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
                      {paginatedItems.map((item) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e7eb]">
                    <div className="text-sm text-[#6b7280]">
                      แสดง {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} จาก{" "}
                      {filteredItems.length} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        ก่อนหน้า
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={
                                  currentPage === page
                                    ? "bg-[#00D084] text-white hover:bg-[#00D084]/90"
                                    : "bg-white"
                                }
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 text-[#6b7280]">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white"
                      >
                        ถัดไป
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
