import { useGetPaymentProvidersQuery } from "@/lib/services/paymentProvidersServiceApi";

/**
 * Shared hook for accessing payment provider data
 * Provides helper functions to get logo URLs and bank names
 */
export function usePaymentProviders() {
  const { data, isLoading, error } = useGetPaymentProvidersQuery();

  const providers = data?.providers || [];

  /**
   * Get logo URL for a provider by code
   * Handles both old (filename) and new (full path) formats
   */
  const getLogoUrl = (code: string | null | undefined): string => {
    if (!code) return "/images/banks/CBE.png";
    
    const provider = providers.find(p => p.code === code.toUpperCase());
    if (!provider?.logoUrl) return "/images/banks/CBE.png";
    
    const logoUrl = provider.logoUrl.trim();
    if (!logoUrl) return "/images/banks/CBE.png";
    
    // If it's already a full path, return it
    if (logoUrl.startsWith('/')) {
      return logoUrl;
    }
    // If it's just a filename, construct the full path
    return `/images/banks/${logoUrl}`;
  };

  /**
   * Get bank name for a provider by code
   */
  const getBankName = (code: string | null | undefined): string => {
    if (!code) return "Unknown Bank";
    
    const provider = providers.find(p => p.code === code.toUpperCase());
    return provider?.name || code;
  };

  /**
   * Get active providers only
   */
  const activeProviders = providers.filter(p => p.status === 'ACTIVE');

  /**
   * Get provider by code
   */
  const getProvider = (code: string | null | undefined) => {
    if (!code) return null;
    return providers.find(p => p.code === code.toUpperCase()) || null;
  };

  return {
    providers,
    activeProviders,
    getLogoUrl,
    getBankName,
    getProvider,
    isLoading,
    error,
  };
}
