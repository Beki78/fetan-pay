# Merchant App Environment Variables

This document describes the environment variables required for the Merchant application.

## Required Environment Variables

Create a `.env.local` file in the root of the `merchant` directory with the following variables:

```env
# Base API URL (without /api/v1 suffix) - used for Better Auth
# Production: https://api.fetanpay.et
# Development: http://localhost:3003
NEXT_PUBLIC_BASE_URL=https://api.fetanpay.et

# Full API base URL (with /api/v1 suffix) - used for RTK Query services
# Production: https://api.fetanpay.et/api/v1
# Development: http://localhost:3003/api/v1
NEXT_PUBLIC_API_BASE_URL=https://api.fetanpay.et/api/v1

# Frontend URL (for callbacks and redirects)
# Production: https://client.fetanpay.et
# Development: http://localhost:3002
NEXT_PUBLIC_FRONTEND_URL=https://client.fetanpay.et

# Node Environment
# Production: production
# Development: development
NODE_ENV=production
```

## Development Setup

For local development, use these values:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3003
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

## Production Setup

For production deployment, use these values:

```env
NEXT_PUBLIC_BASE_URL=https://api.fetanpay.et
NEXT_PUBLIC_API_BASE_URL=https://api.fetanpay.et/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://client.fetanpay.et
NODE_ENV=production
```

## Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser and should not contain sensitive information
- The `BASE_URL` is used for Better Auth authentication endpoints
- The `API_BASE_URL` is used for all API calls via RTK Query
- The `FRONTEND_URL` is used for OAuth callbacks and redirects

