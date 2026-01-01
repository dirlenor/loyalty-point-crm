/**
 * LINE Notify utility for sending messages to LINE users
 * Uses LINE Messaging API to send push messages
 */

interface SendLineMessageParams {
  lineUserId: string;
  message: string;
}

/**
 * Send message to LINE user via LINE Messaging API
 * @param lineUserId - LINE User ID
 * @param message - Message to send
 */
export async function sendLineMessage({
  lineUserId,
  message,
}: SendLineMessageParams): Promise<{ success: boolean; error?: string }> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
    return { success: false, error: "LINE Channel Access Token not configured" };
  }

  if (!lineUserId) {
    console.error("LINE User ID is required");
    return { success: false, error: "LINE User ID is required" };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("LINE API error:", errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to send LINE message:", error);
    return {
      success: false,
      error: error.message || "Failed to send LINE message",
    };
  }
}

/**
 * Format message for points added notification
 */
export function formatPointsAddedMessage(
  points: number,
  totalPoints: number,
  reason?: string
): string {
  let message = `🎉 คุณได้รับแต้มเพิ่ม!\n\n`;
  message += `➕ แต้มที่ได้รับ: ${points.toLocaleString()} แต้ม\n`;
  message += `💰 แต้มรวมทั้งหมด: ${totalPoints.toLocaleString()} แต้ม\n`;
  if (reason) {
    message += `\n📝 ${reason}`;
  }
  message += `\n\nขอบคุณที่ใช้บริการ 6CAT Point!`;
  return message;
}

/**
 * Format message for redemption notification
 */
export function formatRedemptionMessage(
  rewardTitle: string,
  pointsUsed: number,
  remainingPoints: number
): string {
  let message = `🎁 คุณแลกรางวัลสำเร็จ!\n\n`;
  message += `📦 รางวัล: ${rewardTitle}\n`;
  message += `➖ ใช้แต้ม: ${pointsUsed.toLocaleString()} แต้ม\n`;
  message += `💰 แต้มคงเหลือ: ${remainingPoints.toLocaleString()} แต้ม\n`;
  message += `\nขอบคุณที่ใช้บริการ 6CAT Point!`;
  return message;
}

