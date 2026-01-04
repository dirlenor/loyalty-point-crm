/**
 * Default branding constants
 * These values match the current hardcoded values in the application
 * Used as fallback when tenant_settings table has no data
 */
export const DEFAULT_BRANDING = {
  shopName: "6CAT Point",
  logoText: "6",
  primaryColor: "#ff4b00",
  lightColor: "#fff5f0",
  secondaryColor: undefined,
} as const;

export type BrandingConfig = {
  shopName: string;
  logoText: string;
  logoImageUrl?: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  lightColor?: string | null;
};

