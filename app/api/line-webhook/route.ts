import { NextRequest, NextResponse } from "next/server";
import { createSlipSubmission } from "@/app/actions/slip-submissions";
import { findOrCreateProfileByLineUserId } from "@/app/actions/profiles";

/**
 * LINE Bot Webhook endpoint
 * POST /api/line-webhook
 * Handles LINE Bot messages and image uploads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = body.events || [];

    for (const event of events) {
      // Handle image message
      if (event.type === "message" && event.message.type === "image") {
        // Get image content from LINE
        const imageId = event.message.id;
        const userId = event.source.userId;

        if (!userId) {
          continue;
        }

        // Get LINE Channel Access Token from environment
        const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        if (!channelAccessToken) {
          console.error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
          continue;
        }

        // Download image from LINE
        const imageResponse = await fetch(
          `https://api-data.line.me/v2/bot/message/${imageId}/content`,
          {
            headers: {
              Authorization: `Bearer ${channelAccessToken}`,
            },
          }
        );

        if (!imageResponse.ok) {
          console.error("Failed to download image from LINE");
          continue;
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBlob = new Blob([imageBuffer]);

        // Find or create customer profile
        const profileResult = await findOrCreateProfileByLineUserId(
          userId,
          "LINE User" // Default name, can be updated later
        );

        if (!profileResult.success || !profileResult.data) {
          console.error("Failed to find or create profile");
          continue;
        }

        // Convert blob to File for upload
        const file = new File([imageBlob], "line-image.jpg", {
          type: "image/jpeg",
        });

        // Upload and process image
        const formData = new FormData();
        formData.append("file", file);
        formData.append("customerId", profileResult.data.id);

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upload-slip`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          // Create slip submission
          await createSlipSubmission({
            customerId: profileResult.data.id,
            imageUrl: uploadResult.data.imageUrl,
            amount: uploadResult.data.ocr.parsed.amount,
            referenceNumber: uploadResult.data.ocr.parsed.referenceNumber,
            transferDate: uploadResult.data.ocr.parsed.date,
            ocrResult: uploadResult.data.ocr,
            ocrConfidence: uploadResult.data.ocr.confidence,
          });

          // Reply to user
          await replyToLineUser(
            userId,
            "ได้รับสลิปของคุณแล้ว กำลังส่งให้ Admin ตรวจสอบ กรุณารอการอนุมัติ"
          );
        } else {
          await replyToLineUser(
            userId,
            "เกิดข้อผิดพลาดในการประมวลผลสลิป กรุณาลองใหม่อีกครั้ง"
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LINE webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process webhook",
      },
      { status: 500 }
    );
  }
}

/**
 * Reply message to LINE user
 */
async function replyToLineUser(userId: string, message: string) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return;
  }

  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Failed to send LINE message:", error);
  }
}

