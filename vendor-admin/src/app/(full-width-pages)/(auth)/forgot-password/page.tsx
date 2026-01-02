import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | FetanPay",
  description: "Request a password reset for your FetanPay account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
