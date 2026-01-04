"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDemoTopupOrders } from "@/app/actions/demo-wallet";
import { format } from "date-fns";
import { ShoppingBag, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminDemoTopupOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const result = await getDemoTopupOrders(
        statusFilter === "all" ? undefined : statusFilter
      );
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      expired: "bg-gray-50 text-gray-700 border-gray-200",
    };

    const labels: Record<string, string> = {
      success: "สำเร็จ",
      pending: "รอดำเนินการ",
      failed: "ล้มเหลว",
      expired: "หมดอายุ",
    };

    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1d1d] mb-2">
            รายการ Topup Orders (Demo)
          </h1>
          <p className="text-sm text-[#6b7280]">
            ดูรายการ Topup Orders ทั้งหมดในระบบ Demo
          </p>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[green-50] rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#00D084]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-[#1c1d1d]">
                    รายการ Orders
                  </CardTitle>
                  <CardDescription className="text-[#6b7280]">
                    ทั้งหมด {orders.length} รายการ
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  ทั้งหมด
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  รอดำเนินการ
                </Button>
                <Button
                  variant={statusFilter === "success" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("success")}
                >
                  สำเร็จ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                ยังไม่มีรายการ Orders
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#e5e7eb]">
                      <TableHead className="text-[#6b7280] font-medium">
                        Order ID
                      </TableHead>
                      <TableHead className="text-[#6b7280] font-medium">
                        ลูกค้า
                      </TableHead>
                      <TableHead className="text-[#6b7280] font-medium">
                        จำนวนเงิน
                      </TableHead>
                      <TableHead className="text-[#6b7280] font-medium">
                        แต้ม
                      </TableHead>
                      <TableHead className="text-[#6b7280] font-medium">
                        สถานะ
                      </TableHead>
                      <TableHead className="text-[#6b7280] font-medium">
                        วันที่สร้าง
                      </TableHead>
                      <TableHead className="text-[#6b7280] font-medium">
                        จัดการ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow
                        key={order.id}
                        className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]"
                      >
                        <TableCell className="font-mono text-sm">
                          {order.order_id}
                        </TableCell>
                        <TableCell>
                          {order.demo_users?.full_name || "-"}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {order.demo_users?.phone || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#00D084]">
                            {parseFloat(order.amount.toString()).toLocaleString()} บาท
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {order.points_to_add.toLocaleString()} แต้ม
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {order.status === "pending" && order.promptpay_transaction_id ? (
                            <Link
                              href={`/admin/demo-topup/test-webhook?orderId=${order.order_id}&transactionId=${order.promptpay_transaction_id}&amount=${order.amount}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                ส่ง Webhook
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
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

