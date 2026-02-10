import { FileDigit, Scan } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationMethodSelectorProps {
  onSelectMethod: (method: "transaction" | "camera") => void;
  selectedMethod?: "transaction" | "camera" | null;
}

export function VerificationMethodSelector({
  onSelectMethod,
  selectedMethod,
}: VerificationMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">
        Verification Method
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelectMethod("transaction")}
          className={cn(
            "flex items-center justify-center gap-3 p-5 border-2 rounded-lg transition-all",
            "hover:border-primary hover:bg-primary/5 hover:shadow-md",
            selectedMethod === "transaction"
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border bg-card",
          )}
        >
          <FileDigit className="h-5 w-5 text-primary" />
          <span className="font-medium text-base">
            Transaction Reference
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectMethod("camera")}
          className={cn(
            "flex items-center justify-center gap-3 p-5 border-2 rounded-lg transition-all",
            "hover:border-primary hover:bg-primary/5 hover:shadow-md",
            selectedMethod === "camera"
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border bg-card",
          )}
        >
          <Scan className="h-5 w-5 text-primary" />
          <span className="font-medium text-base">
            Scan QR Code
          </span>
        </button>
      </div>
    </div>
  );
}
