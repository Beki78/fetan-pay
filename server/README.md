## FetanPay Server (Better Auth)

Backend for FetanPay admin, powered by NestJS + Better Auth. This service exposes auth at `/api/auth` and is used by the merchant-admin frontend for sign-in, social login, and password reset flows.

### Quick start

```bash
npm install
npm run start:dev
```

The server listens on `PORT` (defaults to `3003`). CORS is enabled for the local apps on ports 3000–3003.

### Required environment

Create a `.env` in `server/` with at least:

```env
PORT=3003
DATABASE_URL=postgres://user:pass@localhost:5432/fetanpay
BETTER_AUTH_SECRET=change-me
BETTER_AUTH_BASE_URL=http://localhost:3003
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="FetanPay" <no-reply@example.com>
APP_NAME=FetanPay
OTP_EXPIRES_MINUTES=5
FRONTEND_URL=http://localhost:3000
```

- `BETTER_AUTH_SECRET` clears the default-secret warning and is required for production.
- `BETTER_AUTH_BASE_URL` must point to the public URL that serves `/api/auth` (e.g., your deployed host).
- Google credentials are required for social login to work.
- Email OTP now uses Nodemailer via `EmailService`; set your SMTP values above for delivery.

### Password reset endpoints

Better Auth exposes password reset routes that the frontend calls:
- `POST /api/auth/password/forgot` with `{ email }` to send a reset code/link.
- `POST /api/auth/password/reset` with `{ token, password }` to finalize the reset.

Ensure your mailer is configured in Better Auth if you want real emails delivered; otherwise the request will fail upstream. Tokens returned in logs can be used for local testing.

### Swagger

Swagger UI is available at `/api` after the server starts.

### Scripts

- `npm run start:dev` — start in watch mode
- `npm run build && npm run start:prod` — production build and run
- `npm test` — unit tests
