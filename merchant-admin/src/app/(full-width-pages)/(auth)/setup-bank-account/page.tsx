import { Suspense } from "react";
import BankSetupForm from "@/components/auth/BankSetupForm";

export const metadata = {
  title: "Setup Bank Account - FetanPay Merchant",
  description: "Setup your bank account to receive payments",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );
}

export default function SetupBankAccountPage() {
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          <BankSetupForm />
        </Suspense>
      </div>
    </div>
  );
}
