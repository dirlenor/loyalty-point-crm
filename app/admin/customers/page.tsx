import { getCustomers } from "@/app/actions/customers";
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
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">สมาชิกทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1c1d1d]">{customers.length}</div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">แต้มรวมทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#ff4b00]">
                {customers.reduce((sum, c) => sum + (c.total_points || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">สมาชิกที่ใช้งาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1c1d1d]">
                {customers.filter(c => (c.total_points || 0) > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[#e2e8f0] shadow-[0px_3.389px_5.084px_0px_rgba(0,0,0,0.09)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgba(28,29,29,0.05)] rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#1c1d1d]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-[#1c1d1d]">สมาชิก</CardTitle>
                <CardDescription>รายการลูกค้าทั้งหมดในระบบ</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ยังไม่มีสมาชิกในระบบ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>เบอร์โทรศัพท์</TableHead>
                      <TableHead>แต้มสะสม</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.full_name}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{customer.phone}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#ff4b00]">
                              {customer.total_points?.toLocaleString() || 0}
                            </span>
                            <span className="text-sm text-muted-foreground">แต้ม</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(customer.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={customer.total_points && customer.total_points > 0 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {customer.total_points && customer.total_points > 0 ? "ใช้งาน" : "ใหม่"}
                          </Badge>
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

