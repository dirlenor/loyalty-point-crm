"use client";

/**
 * Hook to get branding values from CSS variables
 * This reads from CSS variables set by BrandingProvider (Server Component)
 * No cache issues - CSS variables update immediately
 */
export function useTenantBrandingCSS() {
  if (typeof window === "undefined") {
    // Server-side: return defaults
    return {
      shopName: "6CAT Point",
      logoText: "6",
      primaryColor: "#ff4b00",
      lightColor: "#fff5f0",
      secondaryColor: undefined,
    };
  }

  // Client-side: read from CSS variables
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    shopName: computedStyle.getPropertyValue("--brand-shop-name").trim() || "6CAT Point",
    logoText: computedStyle.getPropertyValue("--brand-logo-text").trim() || "6",
    primaryColor: computedStyle.getPropertyValue("--brand-primary").trim() || "#ff4b00",
    lightColor: computedStyle.getPropertyValue("--brand-light").trim() || "#fff5f0",
    secondaryColor: computedStyle.getPropertyValue("--brand-secondary").trim() || undefined,
  };
}

