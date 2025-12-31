"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findProfileByPhone, addPoints, createProfile } from "@/app/actions/profiles";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function CollectPointsPage() {
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [points, setPoints] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    const result = await findProfileByPhone(phone);
    
    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setProfile(null);
      toast({
        title: "ไม่พบข้อมูล",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSearching(false);
  };

  const handleAddPoints = async () => {
    if (!profile) return;
    
    const pointsToAdd = parseInt(points);
    if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกแต้มที่ถูกต้อง (มากกว่า 0)",
        variant: "destructive",
      });
      return;
    }

    setIsAddingPoints(true);
    const result = await addPoints(profile.id, pointsToAdd);
    
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setPoints("");
      // Refresh profile data
      const refreshResult = await findProfileByPhone(phone);
      if (refreshResult.success && refreshResult.data) {
        setProfile(refreshResult.data);
      }
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsAddingPoints(false);
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกชื่อ",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProfile(true);
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("full_name", newProfileName);

    const result = await createProfile(formData);
    
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setCreateDialogOpen(false);
      setNewProfileName("");
      // Search again to load the new profile
      await handleSearch();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsCreatingProfile(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <Card>
        <CardHeader>
          <CardTitle>เพิ่มแต้มให้ลูกค้า</CardTitle>
          <CardDescription>ค้นหาลูกค้าด้วยเบอร์โทรศัพท์</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0812345678"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhone(value);
                    setProfile(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                maxLength={10}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching || !phone}>
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
              </Button>
            </div>
          </div>

          {profile && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">ข้อมูลลูกค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ชื่อ</Label>
                  <p className="text-lg font-semibold">{profile.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">เบอร์โทรศัพท์</Label>
                  <p className="text-lg font-semibold">{profile.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">แต้มปัจจุบัน</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {profile.total_points || 0} แต้ม
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Label htmlFor="points">เพิ่มแต้ม</Label>
                  <div className="flex gap-2">
                    <Input
                      id="points"
                      type="number"
                      placeholder="จำนวนแต้ม"
                      value={points}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                          setPoints(value);
                        }
                      }}
                      min="1"
                    />
                    <Button
                      onClick={handleAddPoints}
                      disabled={isAddingPoints || !points || parseInt(points) <= 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isAddingPoints ? "กำลังเพิ่ม..." : "เพิ่มแต้ม"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!profile && phone.length === 10 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    ไม่พบข้อมูลลูกค้าเบอร์ {phone}
                  </p>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" />
                        สร้างโปรไฟล์ใหม่
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>สร้างโปรไฟล์ใหม่</DialogTitle>
                        <DialogDescription>
                          สร้างโปรไฟล์ลูกค้าใหม่สำหรับเบอร์ {phone}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-name">ชื่อ-นามสกุล *</Label>
                          <Input
                            id="new-name"
                            placeholder="กรุณากรอกชื่อ-นามสกุล"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>เบอร์โทรศัพท์</Label>
                          <Input value={phone} disabled />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                          disabled={isCreatingProfile}
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          onClick={handleCreateProfile}
                          disabled={isCreatingProfile || !newProfileName.trim()}
                        >
                          {isCreatingProfile ? "กำลังสร้าง..." : "สร้าง"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}

