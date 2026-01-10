import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | FetanPay",
  description: "Reset your FetanPay account password.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tokenParam =
    (typeof resolvedSearchParams.token === "string" && resolvedSearchParams.token) ||
    (typeof resolvedSearchParams.code === "string" && resolvedSearchParams.code) ||
    "";
  const emailParam =
    (typeof resolvedSearchParams.email === "string" && resolvedSearchParams.email) ||
    "";

  return <ResetPasswordForm initialToken={tokenParam} initialEmail={emailParam} />;
}
