import { getTenantSettings } from "@/app/actions/tenant-settings";
import { DEFAULT_BRANDING } from "@/lib/constants/default-branding";

/**
 * Server Component that injects branding CSS variables
 * This ensures branding is applied immediately without client-side cache issues
 */
export async function BrandingProvider({ children }: { children: React.ReactNode }) {
  const branding = await getTenantSettings();

  const cssVars = `
    :root {
      --brand-primary: ${branding.primaryColor};
      --brand-light: ${branding.lightColor || DEFAULT_BRANDING.lightColor};
      --brand-secondary: ${branding.secondaryColor || "transparent"};
      --brand-shop-name: "${branding.shopName}";
      --brand-logo-text: "${branding.logoText}";
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {children}
    </>
  );
}

