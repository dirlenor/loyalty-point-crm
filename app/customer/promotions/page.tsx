"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPromotions } from "@/app/actions/promotions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerLayout } from "@/components/customer-layout";
import { Megaphone } from "lucide-react";
import { findProfileByLineUserId } from "@/app/actions/profiles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const lineUserId = localStorage.getItem("line_user_id");
    if (!lineUserId) {
      router.push("/customer/login");
      return;
    }

    const loadData = async () => {
      try {
        // Load customer data
        const customerResult = await findProfileByLineUserId(lineUserId);
        if (customerResult.success && customerResult.data) {
          setCustomer(customerResult.data);
        } else {
          router.push("/customer/login");
          return;
        }

        // Load active promotions only
        const promotionsData = await getPromotions(true);
        setPromotions(promotionsData);
        
        // Mark promotions as viewed when user visits the page
        localStorage.setItem("has_viewed_promotions", "true");
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>กำลังโหลด...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (!customer) {
    return null;
  }

  const PromotionCard = ({ promotion }: { promotion: any }) => (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedPromotion(promotion);
        setIsDialogOpen(true);
      }}
    >
      {promotion.image_url && (
        <div className="aspect-square w-full overflow-hidden bg-muted">
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-semibold line-clamp-2">{promotion.title}</CardTitle>
        {promotion.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {promotion.description}
          </p>
        )}
      </CardHeader>
    </Card>
  );

  return (
    <CustomerLayout>
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            โปรโมชั่น
          </h1>
          <p className="text-[#85878d]">
            ดูโปรโมชั่นพิเศษและข้อเสนอสุดคุ้ม
          </p>
        </div>

        {/* Promotions Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#00D084] rounded-full"></div>
            <h2 className="text-xl font-bold text-[#211c37]">
              โปรโมชั่นทั้งหมด ({promotions.length})
            </h2>
          </div>

          {promotions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>ยังไม่มีโปรโมชั่น</p>
                <p className="text-sm mt-2">โปรดกลับมาดูใหม่ภายหลัง</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {promotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promotion Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedPromotion && (
            <>
              {selectedPromotion.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted rounded-lg mb-4">
                  <img
                    src={selectedPromotion.image_url}
                    alt={selectedPromotion.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPromotion.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedPromotion.description && (
                    <p className="text-muted-foreground mt-2 whitespace-pre-line">
                      {selectedPromotion.description}
                    </p>
                  )}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}

