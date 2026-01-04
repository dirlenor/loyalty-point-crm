"use client";

import { useState, useEffect, useCallback } from "react";
import { getTenantSettings } from "@/app/actions/tenant-settings";
import { DEFAULT_BRANDING } from "@/lib/constants/default-branding";
import type { BrandingConfig } from "@/lib/constants/default-branding";

// Global event to trigger refetch
const BRANDING_UPDATE_EVENT = "tenant-branding-updated";

/**
 * Hook to get tenant branding with caching and default fallback
 * Listens for update events to refetch when settings change
 */
export function useTenantBranding(): BrandingConfig {
  const [branding, setBranding] = useState<BrandingConfig>({
    shopName: DEFAULT_BRANDING.shopName,
    logoText: DEFAULT_BRANDING.logoText,
    logoImageUrl: null,
    primaryColor: DEFAULT_BRANDING.primaryColor,
    secondaryColor: DEFAULT_BRANDING.secondaryColor,
    lightColor: DEFAULT_BRANDING.lightColor,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBranding = useCallback(async () => {
    try {
      const settings = await getTenantSettings();
      setBranding(settings);
    } catch (error) {
      console.error("Error loading tenant branding:", error);
      // Keep default values on error
      setBranding({
        shopName: DEFAULT_BRANDING.shopName,
        logoText: DEFAULT_BRANDING.logoText,
        logoImageUrl: null,
        primaryColor: DEFAULT_BRANDING.primaryColor,
        secondaryColor: DEFAULT_BRANDING.secondaryColor,
        lightColor: DEFAULT_BRANDING.lightColor,
      });
    }
  }, []);

  useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  useEffect(() => {
    // Listen for branding update events
    const handleUpdate = () => {
      loadBranding();
    };

    window.addEventListener(BRANDING_UPDATE_EVENT, handleUpdate);

    return () => {
      window.removeEventListener(BRANDING_UPDATE_EVENT, handleUpdate);
    };
  }, [loadBranding]);

  return branding;
}

/**
 * Trigger branding refetch across all components
 */
export function triggerBrandingRefresh() {
  window.dispatchEvent(new CustomEvent(BRANDING_UPDATE_EVENT));
}

