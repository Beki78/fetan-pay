# Branding System Implementation Guide

## Overview
This document outlines the branding customization system that allows merchants to customize their payment pages with:
- Custom logo
- Primary and secondary brand colors
- Display name
- Tagline
- "Powered by" badge toggle

## Database Schema

### MerchantBranding Model
```prisma
model MerchantBranding {
  id            String   @id @default(uuid())
  merchantId    String   @unique
  merchant      Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  
  // Logo
  logoUrl       String?
  
  // Colors
  primaryColor  String   @default("#5CFFCE")
  secondaryColor String  @default("#4F46E5")
  
  // Text
  displayName   String?
  tagline       String?
  
  // Options
  showPoweredBy Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("merchant_branding")
}
```

## API Endpoints

### GET /api/v1/merchants/:merchantId/branding
Get branding settings for a merchant.

**Response:**
```json
{
  "id": "uuid",
  "merchantId": "uuid",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#5CFFCE",
  "secondaryColor": "#4F46E5",
  "displayName": "My Business",
  "tagline": "Fast & Reliable",
  "showPoweredBy": true,
  "createdAt": "2026-01-11T...",
  "updatedAt": "2026-01-11T..."
}
```

### PUT /api/v1/merchants/:merchantId/branding
Update branding settings. Accepts multipart/form-data for logo upload.

**Request Body:**
- `logo` (file, optional): Logo image file
- `primaryColor` (string, optional): Hex color code
- `secondaryColor` (string, optional): Hex color code
- `displayName` (string, optional): Custom display name
- `tagline` (string, optional): Business tagline
- `showPoweredBy` (boolean, optional): Show powered by badge

**Response:** Same as GET endpoint

## File Storage

Logos are stored in: `public/uploads/branding/{merchantId}/logo.{ext}`

The URL format: `/uploads/branding/{merchantId}/logo.{ext}`

## Frontend Integration

### Merchant Admin (Settings)
- Location: `/branding` page
- Features:
  - Logo upload with preview
  - Color pickers
  - Text inputs
  - Live preview
  - Save button

### Merchant Frontend (Customer-facing)
- Pages to apply branding:
  1. **Scan Page** (`/scan`): Payment verification page
  2. **Tip Page** (`/tip`): Tip management page
  3. **History Page** (`/history`): Transaction history
  4. **Profile Page** (`/profile`): User profile

- Implementation:
  - Fetch branding on app load
  - Store in context/state
  - Apply CSS variables for colors
  - Replace default logo with custom logo
  - Show/hide "Powered by" badge

## CSS Variables

Branding colors are applied via CSS variables:
```css
:root {
  --brand-primary: #5CFFCE;
  --brand-secondary: #4F46E5;
}
```

These can be used throughout the merchant frontend:
```css
.button-primary {
  background-color: var(--brand-primary);
}

.gradient-bg {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
}
```

## Implementation Steps

1. ✅ Add MerchantBranding model to Prisma schema
2. ✅ Create branding migration
3. ✅ Create branding module (service, controller, DTOs)
4. ✅ Add file upload handling for logos
5. ✅ Update merchant admin UI to connect to API
6. ✅ Create branding context/hook for merchant frontend
7. ✅ Apply branding to merchant frontend pages
8. ✅ Test end-to-end flow

