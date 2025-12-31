"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerLayout } from "@/components/customer-layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Gift } from "lucide-react";
import { findProfileByPhone } from "@/app/actions/profiles";
import { getCustomerRedemptions } from "@/app/actions/customer-redemptions";

export default function CustomerHistoryPage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const phone = localStorage.getItem("customer_phone");
    if (!phone) {
      router.push("/customer/login");
      return;
    }

    const loadData = async () => {
      try {
        // Load customer data
        const customerResult = await findProfileByPhone(phone);
        if (customerResult.success && customerResult.data) {
          setCustomer(customerResult.data);
          
          // Load redemptions for this customer
          const redemptionsData = await getCustomerRedemptions(customerResult.data.id);
          setRedemptions(redemptionsData);
        } else {
          router.push("/customer/login");
        }
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

  return (
    <CustomerLayout>
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            ประวัติการแลกรางวัล
          </h1>
          <p className="text-[#85878d]">
            ดูประวัติการแลกรางวัลทั้งหมดของคุณ
          </p>
        </div>

        {redemptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              ยังไม่มีประวัติการแลกรางวัล
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {redemptions.map((redemption: any) => (
              <div
                key={redemption.id}
                className="bg-white border border-[#e4e4e4] rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {redemption.rewards?.image_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={redemption.rewards.image_url}
                        alt={redemption.rewards.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-base text-[#1c1d1d] truncate">
                        {redemption.rewards?.title || "ไม่ระบุ"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          redemption.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200 text-xs"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                        }
                      >
                        {redemption.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                      <span>•</span>
                      <span className="text-[#ff4b00] font-semibold">
                        {redemption.rewards?.points_required || 0} แต้ม
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

