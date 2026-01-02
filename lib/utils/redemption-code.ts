/**
 * Generate unique redemption code
 * Format: RD-XXXXXX (6 characters)
 */
export function generateRedemptionCode(): string {
  const prefix = "RD";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars (0, O, I, 1)
  const length = 6;
  
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${code}`;
}

/**
 * Validate redemption code format
 */
export function isValidRedemptionCode(code: string): boolean {
  const pattern = /^RD-[A-Z2-9]{6}$/;
  return pattern.test(code);
}

