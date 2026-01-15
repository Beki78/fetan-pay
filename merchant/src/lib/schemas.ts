import { z } from "zod";
import { validateTransactionInput, type BankId } from "./validation";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const createScanSchema = (
  bankId: BankId | null,
  verificationMethod: "transaction" | "camera" | null,
  showTip: boolean
) => {
  return z.object({
    // Transaction reference is the only required field for verification
    transactionId: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        if (verificationMethod === "camera") {
          if (!val || !val.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please scan a QR code",
            });
          }
          return;
        }
        if (verificationMethod === "transaction") {
          if (!val || !val.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Transaction reference or URL is required",
            });
            return;
          }
          if (bankId) {
            const validation = validateTransactionInput(bankId, val);
            if (!validation.isValid) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  validation.error || "Invalid transaction ID or URL format",
              });
            }
          }
        }
      }),
    tipAmount: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        if (showTip) {
          if (!val || !val.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Tip amount is required when tip is enabled",
            });
            return;
          }
          const numbers = val.replace(/,/g, "");
          const num = parseInt(numbers, 10);
          if (isNaN(num) || num < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Tip amount must be a valid whole number",
            });
          }
        } else {
          // If tip is not enabled, any value is fine (or empty)
          if (val && val.trim()) {
            const numbers = val.replace(/,/g, "");
            const num = parseInt(numbers, 10);
            if (isNaN(num) || num < 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Tip amount must be a valid whole number",
              });
            }
          }
        }
      }),
    verificationMethod: z.enum(["transaction", "camera"]).nullable(),
  });
};
