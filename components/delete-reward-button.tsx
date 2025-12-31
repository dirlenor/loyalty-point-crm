"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteReward } from "@/app/actions/rewards";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteRewardButtonProps {
  rewardId: string;
  rewardTitle: string;
}

export function DeleteRewardButton({ rewardId, rewardTitle }: DeleteRewardButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteReward(rewardId);
    
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            คุณแน่ใจหรือไม่ว่าต้องการลบรางวัล "{rewardTitle}"? 
            การกระทำนี้ไม่สามารถยกเลิกได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "กำลังลบ..." : "ลบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

