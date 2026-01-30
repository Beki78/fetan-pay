# Subscription Protection System - Usage Guide

## Overview

This system provides centralized subscription-based protection for API endpoints. It automatically checks merchant subscription limits before allowing actions and provides clear upgrade prompts when limits are exceeded.

## How It Works

### 1. Database Schema

- **Plan.limits**: JSON field storing flexible limit configurations
- **SubscriptionUsage**: Tracks monthly usage per merchant
- **Subscription**: Links merchants to plans

### 2. Protection Flow

```
API Request → SubscriptionGuard → Check Limits → Allow/Deny → Track Usage
```

## Usage Examples

### Protecting API Endpoints

#### Simple Protection (Most Common)

```typescript
@Post()
@UseGuards(SubscriptionGuard)
@ProtectApiKeys()  // Protects API key creation
async createApiKey() { ... }

@Post()
@UseGuards(SubscriptionGuard)
@ProtectWebhooks()  // Protects webhook creation
async createWebhook() { ... }

@Post()
@UseGuards(SubscriptionGuard)
@ProtectTeamMembers()  // Protects team member creation
async createUser() { ... }
```

#### Custom Protection Logic

```typescript
@Post('/verify')
@UseGuards(SubscriptionGuard)
@SubscriptionProtection(
  'verifications_monthly',
  'create',
  async (merchantId, usage, limits) => {
    const monthlyLimit = limits.verifications_monthly;
    if (monthlyLimit === -1) return true; // Unlimited
    return (usage.verifications_monthly || 0) < monthlyLimit;
  }
)
async verifyPayment() { ... }
```

### Plan Configuration Examples

#### Admin Creates Plans with Flexible Limits

```typescript
// Free Plan
{
  name: "Free",
  price: 0,
  limits: {
    verifications_monthly: 100,
    api_keys: 2,
    team_members: 2,
    webhooks: 1,
    bank_accounts: 2,
    custom_branding: false,
    advanced_analytics: false
  }
}

// Business Plan
{
  name: "Business",
  price: 11940,
  limits: {
    verifications_monthly: 10000,
    api_keys: 5,
    team_members: 15,
    webhooks: 10,
    bank_accounts: -1, // Unlimited
    custom_branding: true,
    advanced_analytics: true,
    export_functionality: true
  }
}
```

### Error Responses

When limits are exceeded, the system returns:

```json
{
  "statusCode": 403,
  "message": "This feature is not available in your Free plan",
  "feature": "api_keys",
  "currentPlan": "Free",
  "upgradeRequired": true
}
```

### Usage Tracking

The system automatically tracks usage after successful operations:

```typescript
// In your service after successful operation
await this.usageTracker.trackVerification(merchantId);
await this.usageTracker.trackApiCall(merchantId);
await this.usageTracker.trackWebhookDelivery(merchantId);
```

### Getting Usage Statistics

```typescript
// Get merchant usage statistics
GET /pricing/merchants/:merchantId/usage

Response:
{
  "planName": "Starter",
  "limits": {
    "verifications_monthly": 1000,
    "api_keys": 2,
    "team_members": 5
  },
  "usage": {
    "verifications_monthly": 450,
    "api_keys": 1,
    "team_members": 3
  },
  "percentages": {
    "verifications_monthly": 45,
    "api_keys": 50,
    "team_members": 60
  }
}
```

## Available Protection Decorators

### Pre-built Decorators

- `@ProtectApiKeys()` - Limits API key creation
- `@ProtectWebhooks()` - Limits webhook creation
- `@ProtectTeamMembers()` - Limits team member creation
- `@ProtectBankAccounts()` - Limits bank account creation
- `@ProtectCustomBranding()` - Feature toggle for branding
- `@ProtectAdvancedAnalytics()` - Feature toggle for analytics
- `@ProtectExportFunctionality()` - Feature toggle for exports
- `@ProtectVerifications()` - Limits monthly verifications

### Custom Protection

```typescript
@SubscriptionProtection('feature_name', 'create', customCheckFunction)
```

## Limit Types

### Numerical Limits

```typescript
{
  verifications_monthly: 1000,  // Allow up to 1000 per month
  api_keys: 5,                  // Allow up to 5 API keys
  team_members: 10              // Allow up to 10 team members
}
```

### Unlimited

```typescript
{
  verifications_monthly: -1,    // Unlimited verifications
  api_keys: null               // Unlimited API keys
}
```

### Feature Toggles

```typescript
{
  custom_branding: true,        // Feature enabled
  advanced_analytics: false,   // Feature disabled
  export_functionality: true   // Feature enabled
}
```

## Database Migration

Run this to update your database:

```bash
npx prisma db push
```

Then seed the new plan structure:

```bash
npm run seed:pricing-plans
```

## Benefits

1. **Centralized**: One system protects all endpoints
2. **Flexible**: Admin can create any combination of limits
3. **Automatic**: No manual checking needed
4. **Clear Errors**: Users get clear upgrade prompts
5. **Usage Tracking**: Real-time usage monitoring
6. **Scalable**: Easy to add new protection types

## Adding New Protection Types

1. Add the limit to plan configuration:

```typescript
{
  new_feature: 5; // New limit
}
```

2. Create protection decorator:

```typescript
export const ProtectNewFeature = () => SubscriptionProtection('new_feature');
```

3. Use in controller:

```typescript
@Post()
@UseGuards(SubscriptionGuard)
@ProtectNewFeature()
async createNewFeature() { ... }
```

4. Track usage:

```typescript
await this.usageTracker.trackCustomUsage(merchantId, 'new_feature', 1);
```

That's it! The system handles everything else automatically.
