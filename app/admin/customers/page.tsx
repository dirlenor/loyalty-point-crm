"use client";

import { useEffect, useState } from "react";
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
import { User, Search, Plus, MoreVertical, Edit, Trash2, Ban, X, UserCircle, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addPoints, updateCustomer, deleteCustomer, banCustomer } from "@/app/actions/profiles";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [addPointsDialogOpen, setAddPointsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchPhone.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        customer.phone.includes(searchPhone.trim())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchPhone, customers]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสมาชิกได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!selectedCustomer) return;

    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกแต้มที่ถูกต้อง (มากกว่า 0)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const result = await addPoints(selectedCustomer.id, points);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setAddPointsDialogOpen(false);
      setPointsToAdd("");
      setSelectedCustomer(null);
      await loadCustomers();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setEditName(customer.full_name || "");
    setEditPhone(customer.phone || "");
    setEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    if (!editName.trim()) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกชื่อ",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("full_name", editName);
    formData.append("phone", editPhone);

    const result = await updateCustomer(selectedCustomer.id, formData);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setEditDialogOpen(false);
      setSelectedCustomer(null);
      await loadCustomers();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleDelete = (customer: any) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    setIsProcessing(true);
    const result = await deleteCustomer(selectedCustomer.id);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
      await loadCustomers();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleBan = async (customer: any, banned: boolean) => {
    setIsProcessing(true);
    const result = await banCustomer(customer.id, banned);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      await loadCustomers();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#00D084]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6b7280] mb-1">สมาชิกทั้งหมด</p>
                <p className="text-3xl font-bold text-[#1c1d1d]">{customers.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#00D084]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6b7280] mb-1">แต้มรวมทั้งหมด</p>
                <p className="text-3xl font-bold text-[#00D084]">
                  {customers.reduce((sum, c) => sum + (c.total_points || 0), 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#00D084]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6b7280] mb-1">สมาชิกที่ใช้งาน</p>
                <p className="text-3xl font-bold text-[#1c1d1d]">
                  {customers.filter(c => (c.total_points || 0) > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[green-50] rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#00D084]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-[#1c1d1d]">สมาชิก</CardTitle>
                  <CardDescription className="text-[#6b7280]">รายการลูกค้าทั้งหมดในระบบ</CardDescription>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] w-4 h-4" />
                  <Input
                    type="tel"
                    placeholder="ค้นหาเบอร์โทรศัพท์"
                    value={searchPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setSearchPhone(value);
                      }
                    }}
                    className="pl-9 w-64 border-[#e5e7eb] focus:border-[#00D084]"
                    maxLength={10}
                  />
                </div>
                {searchPhone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchPhone("")}
                    className="text-[#6b7280] hover:text-[#1c1d1d]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-[#6b7280]">
                กำลังโหลด...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280]">
                {searchPhone ? "ไม่พบสมาชิกที่ค้นหา" : "ยังไม่มีสมาชิกในระบบ"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#e5e7eb]">
                      <TableHead className="text-[#6b7280] font-medium">ชื่อ-นามสกุล</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">เบอร์โทรศัพท์</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">แต้มสะสม</TableHead>
                      <TableHead className="text-[#6b7280] font-medium">วันที่สมัคร</TableHead>
                      <TableHead className="text-right text-[#6b7280] font-medium">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-b border-[#e5e7eb] hover:bg-[#f9fafb]">
                        <TableCell className="font-medium text-[#1c1d1d]">
                          {customer.full_name}
                        </TableCell>
                        <TableCell className="text-[#6b7280]">
                          <span className="font-mono">{customer.phone}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#00D084]">
                              {customer.total_points?.toLocaleString() || 0}
                            </span>
                            <span className="text-sm text-[#6b7280]">แต้ม</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#6b7280]">
                          {format(new Date(customer.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setPointsToAdd("");
                                setAddPointsDialogOpen(true);
                              }}
                              className="gap-1 bg-[#00D084] hover:bg-[#00D084]/90 text-white"
                            >
                              <Plus className="w-4 h-4" />
                              เพิ่มแต้ม
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="border-[#e5e7eb] hover:bg-[#f9fafb]">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-[#e5e7eb]">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(customer)}
                                  className="text-[#1c1d1d] hover:bg-[#f9fafb]"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  แก้ไข
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleBan(customer, !customer.banned)}
                                  className={customer.banned ? "text-green-600 hover:bg-[#f9fafb]" : "text-red-600 hover:bg-[#f9fafb]"}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  {customer.banned ? "ยกเลิกการระงับ" : "ระงับ"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(customer)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Add Points Dialog */}
        <Dialog open={addPointsDialogOpen} onOpenChange={setAddPointsDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>เพิ่มแต้มให้สมาชิก</DialogTitle>
              <DialogDescription>
                {selectedCustomer && (
                  <>
                    {selectedCustomer.full_name} ({selectedCustomer.phone})
                    <br />
                    แต้มปัจจุบัน: {selectedCustomer.total_points?.toLocaleString() || 0} แต้ม
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="points">จำนวนแต้ม</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder="กรุณากรอกจำนวนแต้ม"
                  value={pointsToAdd}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                      setPointsToAdd(value);
                    }
                  }}
                  min="1"
                  className="border-[#e5e7eb] focus:border-[#00D084]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddPointsDialogOpen(false);
                  setPointsToAdd("");
                  setSelectedCustomer(null);
                }}
                disabled={isProcessing}
                className="border-[#e5e7eb]"
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={handleAddPoints} 
                disabled={isProcessing || !pointsToAdd || parseInt(pointsToAdd) <= 0}
                className="bg-[#00D084] hover:bg-[#00D084]/90 text-white"
              >
                {isProcessing ? "กำลังเพิ่ม..." : "เพิ่มแต้ม"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลสมาชิก</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลสมาชิก {selectedCustomer?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">ชื่อ-นามสกุล *</Label>
                <Input
                  id="edit-name"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-[#e5e7eb] focus:border-[#00D084]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">เบอร์โทรศัพท์ *</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="0812345678"
                  value={editPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setEditPhone(value);
                    }
                  }}
                  maxLength={10}
                  className="border-[#e5e7eb] focus:border-[#00D084]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedCustomer(null);
                }}
                disabled={isProcessing}
                className="border-[#e5e7eb]"
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={handleUpdateCustomer} 
                disabled={isProcessing || !editName.trim()}
                className="bg-[#00D084] hover:bg-[#00D084]/90 text-white"
              >
                {isProcessing ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>ยืนยันการลบสมาชิก</DialogTitle>
              <DialogDescription>
                คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก &quot;{selectedCustomer?.full_name}&quot;?
                <br />
                การกระทำนี้ไม่สามารถยกเลิกได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedCustomer(null);
                }}
                disabled={isProcessing}
                className="border-[#e5e7eb]"
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? "กำลังลบ..." : "ลบ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
