/**
 * Demo Mode Configuration
 * Validates that demo mode is enabled and prevents production operations
 */

export const DEMO_CONFIG = {
  isEnabled: () => {
    return process.env.DEMO_MODE === "true" && process.env.DEMO_ENABLED === "true";
  },

  getPointRate: () => {
    return parseInt(process.env.DEMO_POINT_RATE || "1", 10);
  },

  getQrExpiryMinutes: () => {
    return parseInt(process.env.DEMO_QR_EXPIRY_MINUTES || "15", 10);
  },

  getPromptPayConfig: () => {
    const apiKey = process.env.PROMPTPAY_API_KEY;
    const apiSecret = process.env.PROMPTPAY_API_SECRET;
    const baseUrl = process.env.PROMPTPAY_SANDBOX_URL || process.env.PROMPTPAY_PRODUCTION_URL;
    const webhookSecret = process.env.PROMPTPAY_WEBHOOK_SECRET;

    // Safety check: reject if production keys detected in demo mode
    if (DEMO_CONFIG.isEnabled()) {
      if (apiKey && !apiKey.startsWith("test_") && !apiKey.startsWith("sandbox_")) {
        throw new Error("Production API key detected in demo mode. Use sandbox/test keys only.");
      }
      if (!baseUrl?.includes("sandbox") && !baseUrl?.includes("test")) {
        console.warn("Warning: Production URL detected in demo mode");
      }
    }

    return {
      apiKey: apiKey || "",
      apiSecret: apiSecret || "",
      baseUrl: baseUrl || "",
      webhookSecret: webhookSecret || "",
    };
  },

  validateDemoMode: () => {
    if (!DEMO_CONFIG.isEnabled()) {
      throw new Error("Demo mode is not enabled. Set DEMO_MODE=true and DEMO_ENABLED=true");
    }
    return true;
  },
};

