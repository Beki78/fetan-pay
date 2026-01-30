import { SetMetadata } from '@nestjs/common';
import {
  SUBSCRIPTION_PROTECTION_KEY,
  SubscriptionProtectionConfig,
} from '../guards/subscription.guard';

/**
 * Decorator to protect endpoints with subscription limits
 *
 * @param feature - The feature name to check (e.g., 'api_keys', 'webhooks', 'team_members')
 * @param action - The action type (default: 'create')
 * @param customCheck - Optional custom check function
 *
 * @example
 * // Protect API key creation
 * @SubscriptionProtection('api_keys')
 * @Post()
 * async createApiKey() { ... }
 *
 * @example
 * // Protect with custom logic
 * @SubscriptionProtection('verifications_monthly', 'create', async (merchantId, usage, limits) => {
 *   return usage.verifications_monthly < limits.verifications_monthly;
 * })
 * @Post('/verify')
 * async verifyPayment() { ... }
 */
export const SubscriptionProtection = (
  feature: string,
  action: 'create' | 'read' | 'update' | 'delete' = 'create',
  customCheck?: (
    merchantId: string,
    currentUsage: any,
    limits: any,
  ) => Promise<boolean>,
) => {
  const config: SubscriptionProtectionConfig = {
    feature,
    action,
    customCheck,
  };

  return SetMetadata(SUBSCRIPTION_PROTECTION_KEY, config);
};

/**
 * Common subscription protection decorators for frequently used features
 */
export const ProtectApiKeys = () => SubscriptionProtection('api_keys');
export const ProtectWebhooks = () => SubscriptionProtection('webhooks');
export const ProtectTeamMembers = () => SubscriptionProtection('team_members');
export const ProtectBankAccounts = () =>
  SubscriptionProtection('bank_accounts');
export const ProtectPaymentProviders = () =>
  SubscriptionProtection('payment_providers');
export const ProtectCustomBranding = () =>
  SubscriptionProtection('custom_branding');
export const ProtectAdvancedAnalytics = () =>
  SubscriptionProtection('advanced_analytics');
export const ProtectExportFunctionality = () =>
  SubscriptionProtection('export_functionality');

/**
 * Protect monthly verification limits
 */
export const ProtectVerifications = () =>
  SubscriptionProtection(
    'verifications_monthly',
    'create',
    async (merchantId, usage, limits) => {
      const monthlyLimit = limits.verifications_monthly;
      if (monthlyLimit === -1 || monthlyLimit === null) return true; // Unlimited
      return (usage.verifications_monthly || 0) < monthlyLimit;
    },
  );
