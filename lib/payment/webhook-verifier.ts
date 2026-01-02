/**
 * Webhook Signature Verifier
 * Verifies webhook requests from PromptPay payment gateway
 */

import { DEMO_CONFIG } from "@/lib/utils/demo-config";
import crypto from "crypto";

export interface WebhookPayload {
  event: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: string;
  metadata?: {
    orderId?: string;
    [key: string]: any;
  };
  signature?: string;
}

export class WebhookVerifier {
  private webhookSecret: string;

  constructor() {
    const config = DEMO_CONFIG.getPromptPayConfig();
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Verify webhook signature using HMAC
   */
  verifySignature(payload: WebhookPayload, signature: string): boolean {
    // In demo mode, allow test signatures
    if (!this.webhookSecret || this.webhookSecret.startsWith("test_")) {
      console.log("Demo mode: Allowing webhook (test mode)");
      // Accept common test signatures
      if (signature === "test_signature" || !signature) {
        return true;
      }
    }

    try {
      // Create the signature string from payload
      const payloadString = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payloadString)
        .digest("hex");

      // Compare signatures using constant-time comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      // In demo mode, be more lenient
      if (!this.webhookSecret || this.webhookSecret.startsWith("test_")) {
        console.log("Demo mode: Allowing webhook despite signature error");
        return true;
      }
      return false;
    }
  }

  /**
   * Verify webhook timestamp to prevent replay attacks
   */
  verifyTimestamp(timestamp: string, maxAgeSeconds: number = 300): boolean {
    // In demo mode, be more lenient with timestamps
    const isDemoMode = !this.webhookSecret || this.webhookSecret.startsWith("test_");
    
    try {
      const webhookTime = new Date(timestamp).getTime();
      const now = Date.now();
      const ageSeconds = (now - webhookTime) / 1000;

      if (ageSeconds < 0) {
        // Future timestamp - in demo mode, allow small clock skew
        if (isDemoMode && Math.abs(ageSeconds) < 60) {
          console.log("Demo mode: Allowing small future timestamp");
          return true;
        }
        return false;
      }

      if (ageSeconds > maxAgeSeconds) {
        // Too old - in demo mode, allow longer age
        if (isDemoMode && ageSeconds < 3600) {
          console.log("Demo mode: Allowing older timestamp");
          return true;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying webhook timestamp:", error);
      // In demo mode, allow if timestamp parsing fails
      if (isDemoMode) {
        console.log("Demo mode: Allowing webhook despite timestamp error");
        return true;
      }
      return false;
    }
  }

  /**
   * Validate webhook payload structure
   */
  validatePayload(payload: any): payload is WebhookPayload {
    if (!payload || typeof payload !== "object") {
      return false;
    }

    // Required fields
    if (!payload.event || typeof payload.event !== "string") {
      return false;
    }

    if (!payload.transactionId || typeof payload.transactionId !== "string") {
      return false;
    }

    if (typeof payload.amount !== "number" || payload.amount <= 0) {
      return false;
    }

    if (!payload.currency || typeof payload.currency !== "string") {
      return false;
    }

    if (!payload.timestamp || typeof payload.timestamp !== "string") {
      return false;
    }

    // Validate event type
    const validEvents = ["payment.success", "payment.failed", "payment.refunded"];
    if (!validEvents.includes(payload.event)) {
      return false;
    }

    return true;
  }

  /**
   * Full webhook verification
   */
  verifyWebhook(
    payload: any,
    signature: string,
    options: { checkTimestamp?: boolean; maxAgeSeconds?: number } = {}
  ): { valid: boolean; error?: string } {
    // Validate payload structure
    if (!this.validatePayload(payload)) {
      return { valid: false, error: "Invalid payload structure" };
    }

    // Verify signature
    if (!this.verifySignature(payload, signature)) {
      return { valid: false, error: "Invalid signature" };
    }

    // Verify timestamp if enabled
    if (options.checkTimestamp !== false) {
      const maxAge = options.maxAgeSeconds || 300;
      if (!this.verifyTimestamp(payload.timestamp, maxAge)) {
        return { valid: false, error: "Invalid or expired timestamp" };
      }
    }

    return { valid: true };
  }
}

