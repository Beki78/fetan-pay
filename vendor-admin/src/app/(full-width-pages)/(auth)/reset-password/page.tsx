import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | FetanPay",
  description: "Reset your FetanPay account password.",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tokenParam =
    (typeof searchParams.token === "string" && searchParams.token) ||
    (typeof searchParams.code === "string" && searchParams.code) ||
    "";
  const emailParam =
    (typeof searchParams.email === "string" && searchParams.email) ||
    "";

  return <ResetPasswordForm initialToken={tokenParam} initialEmail={emailParam} />;
}
