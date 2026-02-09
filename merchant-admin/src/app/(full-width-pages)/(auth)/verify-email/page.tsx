import { Suspense } from "react";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

export const metadata = {
  title: "Verify Email - FetanPay Merchant",
  description: "Verify your email address to continue",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          <EmailVerificationForm />
        </Suspense>
      </div>
    </div>
  );
}
