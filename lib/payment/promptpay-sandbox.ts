/**
 * PromptPay Sandbox API Client
 * Handles QR code generation and payment verification
 */

import { DEMO_CONFIG } from "@/lib/utils/demo-config";

interface CreateQrRequest {
  amount: number;
  orderId: string;
  description?: string;
  expiryMinutes?: number;
}

interface CreateQrResponse {
  transactionId: string;
  qrCodeUrl: string;
  qrCodeData: string; // Base64 encoded QR image
  expiresAt: string;
}

interface PaymentStatus {
  transactionId: string;
  status: "pending" | "success" | "failed" | "expired";
  amount: number;
  paidAt?: string;
}

export class PromptPaySandboxClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    DEMO_CONFIG.validateDemoMode();
    const config = DEMO_CONFIG.getPromptPayConfig();
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Create PromptPay Dynamic QR Code
   */
  async createQrCode(request: CreateQrRequest): Promise<CreateQrResponse> {
    DEMO_CONFIG.validateDemoMode();

    const expiryMinutes = request.expiryMinutes || DEMO_CONFIG.getQrExpiryMinutes();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    try {
      // In sandbox mode, we'll simulate the API call
      // Replace this with actual PromptPay API integration
      const response = await fetch(`${this.baseUrl}/api/v1/qr/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "X-API-Secret": this.apiSecret,
        },
        body: JSON.stringify({
          amount: request.amount,
          orderId: request.orderId,
          description: request.description || `Topup ${request.amount} THB`,
          expiryMinutes,
        }),
      });

      if (!response.ok) {
        // Fallback to mock response for development
        if (this.baseUrl.includes("sandbox") || this.baseUrl.includes("test")) {
          return this.createMockQrResponse(request, expiresAt);
        }
        throw new Error(`PromptPay API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        transactionId: data.transactionId || `txn_${Date.now()}`,
        qrCodeUrl: data.qrCodeUrl || "",
        qrCodeData: data.qrCodeData || "",
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error: any) {
      // Fallback to mock for development/testing
      console.warn("PromptPay API call failed, using mock response:", error.message);
      return this.createMockQrResponse(request, expiresAt);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    DEMO_CONFIG.validateDemoMode();

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/${transactionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "X-API-Secret": this.apiSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        transactionId: data.transactionId,
        status: data.status,
        amount: data.amount,
        paidAt: data.paidAt,
      };
    } catch (error: any) {
      console.error("Error getting payment status:", error);
      throw error;
    }
  }

  /**
   * Mock QR response for development/testing
   */
  private createMockQrResponse(
    request: CreateQrRequest,
    expiresAt: Date
  ): CreateQrResponse {
    // Generate a mock transaction ID
    const transactionId = `txn_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a mock QR code data (in production, this would be from the API)
    // For now, we'll create a simple data URL that can be used to generate QR
    const qrData = `00020101021229370016A00000067701011101130066${request.amount.toFixed(2)}5303764540${request.amount.toFixed(2)}5802TH6304`;

    // Generate a simple base64 QR code placeholder
    // In production, use a QR code library like 'qrcode' to generate actual QR image
    const qrCodeData = `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="300" height="300" fill="white"/>
        <text x="150" y="150" text-anchor="middle" font-size="14">DEMO QR</text>
        <text x="150" y="170" text-anchor="middle" font-size="12">${request.amount} THB</text>
        <text x="150" y="190" text-anchor="middle" font-size="10">${request.orderId}</text>
      </svg>`
    ).toString("base64")}`;

    return {
      transactionId,
      qrCodeUrl: `https://promptpay-demo.example.com/qr/${transactionId}`,
      qrCodeData,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

