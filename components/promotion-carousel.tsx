"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromotionCarouselProps {
  promotions: Array<{
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
  }>;
  onPromotionClick?: (promotion: any) => void;
}

export function PromotionCarousel({ promotions, onPromotionClick }: PromotionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions.length]);

  if (promotions.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="min-w-full flex-shrink-0"
              onClick={() => onPromotionClick?.(promotion)}
            >
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                {promotion.image_url ? (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={promotion.image_url}
                      alt={promotion.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <p className="text-muted-foreground">ไม่มีรูปภาพ</p>
                  </div>
                )}
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-lg mb-1">{promotion.title}</h3>
                  {promotion.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {promotion.description}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {promotions.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {promotions.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-[#00D084] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

