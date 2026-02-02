# FetanPay Database Seeding Guide

This document explains how to seed the FetanPay database with initial data, including users, merchants, payment providers, and email templates.

## Quick Start

To seed the entire database with all required data:

```bash
npm run seed
```

This will run all seed files in the correct order and provide a comprehensive summary.

## Available Seed Commands

### Master Seed (Recommended)

```bash
npm run seed
```

Runs all seed files in sequence:

1. Main database seed (users, merchants, payment providers)
2. Email templates seed (communication templates)
3. Notification templates seed (system notification templates)

### Individual Seed Commands

```bash
# Main database seed only
npm run seed:main

# Email templates only
npm run seed:email-templates

# Notification templates only
npm run seed:notification-templates
```

## What Gets Seeded

### 1. Main Database Seed (`prisma/seed.ts`)

- **Super Admin User**: Creates a superadmin account for system administration
- **Test Merchant**: Creates a test merchant account for development
- **Merchant Admin User**: Creates a merchant admin user linked to the test merchant
- **Waiter/Sales User**: Creates a waiter/sales user for the merchant mobile app
- **Payment Providers**: Seeds all supported payment providers (CBE, Telebirr, Awash, BOA, Dashen)
- **Merchant Receiver Accounts**: Creates test receiver accounts for payment processing
- **Wallet Deposit Receivers**: Creates system accounts for wallet deposits

### 2. Email Templates Seed (`seed-email-templates.ts`)

- **Welcome Template**: For new merchant onboarding
- **Account Approved Template**: For merchant approval notifications
- **Security Alert Template**: For security-related notifications

### 3. Notification Templates Seed (`seed-notification-templates.ts`)

- **Merchant Registration**: Admin notification for new merchant registrations
- **Merchant Approval/Rejection**: Merchant notifications for account status changes
- **Merchant Ban/Unban**: Account suspension/reactivation notifications
- **Wallet Deposit Verified**: Deposit confirmation notifications
- **Branding Updated**: Branding change notifications
- **IP Address Disabled/Enabled**: Security notifications for IP address changes

## Environment Variables

Make sure these environment variables are set in your `.env` file:

### Required

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SUPERADMIN_EMAIL=admin@fetanpay.com
SUPERADMIN_PASSWORD=your_secure_password
```

### Optional (with defaults)

```env
SUPERADMIN_NAME="Super Admin"
MERCHANT_ADMIN_EMAIL="superadmin@gmail.com"
MERCHANT_ADMIN_PASSWORD="12345678"
MERCHANT_ADMIN_NAME="Merchant Admin"
WAITER_EMAIL="waiter@test.com"
WAITER_PASSWORD="waiter123"
WAITER_NAME="Test Waiter"
WAITER_ROLE="WAITER"
```

## Default Login Credentials

After seeding, you can use these credentials for testing:

### Super Admin (Admin Dashboard)

- **Email**: Value from `SUPERADMIN_EMAIL`
- **Password**: Value from `SUPERADMIN_PASSWORD`
- **Role**: SUPERADMIN

### Merchant Admin (Merchant Admin Dashboard)

- **Email**: fetanpay@gmail.com (or `MERCHANT_ADMIN_EMAIL`)
- **Password**: 12345678 (or `MERCHANT_ADMIN_PASSWORD`)
- **Role**: MERCHANT_OWNER

### Waiter/Sales (Merchant Mobile App)

- **Email**: waiter@test.com (or `WAITER_EMAIL`)
- **Password**: waiter123 (or `WAITER_PASSWORD`)
- **Role**: WAITER

## Database Reset

To completely reset the database and re-seed:

```bash
npm run prisma:reset
```

This will:

1. Drop all data
2. Run all migrations
3. Run the complete seed process

## Troubleshooting

### Seed Fails with Connection Error

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify database exists and is accessible

### Duplicate Key Errors

- The seed scripts use upsert operations to handle existing data
- If you encounter unique constraint violations, try resetting the database

### Missing Environment Variables

- The seed will fail if required environment variables are missing
- Check the error message for which variables need to be set

### Template Seeding Issues

- Email templates are created with system-generated IDs
- If templates already exist, they will be updated with new content
- Check the console output for template creation/update status

## Seed File Structure

```
server/
├── seed-master.ts              # Master seed orchestrator
├── prisma/seed.ts             # Main database seed
├── seed-email-templates.ts    # Email templates seed
└── seed-notification-templates.ts  # Notification templates seed
```

## Adding New Seed Data

### To add new email templates:

1. Edit `seed-email-templates.ts`
2. Add your template to the `defaultTemplates` array
3. Run `npm run seed:email-templates`

### To add new notification templates:

1. Edit `seed-notification-templates.ts`
2. Add your template to the `templates` array
3. Run `npm run seed:notification-templates`

### To add new base data:

1. Edit `prisma/seed.ts`
2. Add your seeding logic to the `main()` function
3. Run `npm run seed:main`

## Production Considerations

- Never use default passwords in production
- Set strong, unique passwords for all seeded accounts
- Consider disabling or removing test accounts in production
- Review and customize email templates for your brand
- Ensure all environment variables are properly configured

## Support

If you encounter issues with seeding:

1. Check the console output for specific error messages
2. Verify your environment variables are set correctly
3. Ensure your database is accessible and migrations are up to date
4. Try running individual seed commands to isolate issues
