import { Building, ArrowLeftRight } from "lucide-react";

interface TransferTypeSelectorProps {
  onSelectType: (type: "SAME_BANK" | "INTER_BANK") => void;
}

export function TransferTypeSelector({ onSelectType }: TransferTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">
        Transfer Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelectType("SAME_BANK")}
          className="flex flex-col items-center gap-3 p-5 border-2 rounded-lg transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md border-border bg-card"
        >
          <Building className="h-6 w-6 text-primary" />
          <div className="text-center">
            <span className="font-medium text-base block">Same Bank</span>
            <span className="text-xs text-muted-foreground">Direct Transfer</span>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onSelectType("INTER_BANK")}
          className="flex flex-col items-center gap-3 p-5 border-2 rounded-lg transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md border-border bg-card"
        >
          <ArrowLeftRight className="h-6 w-6 text-primary" />
          <div className="text-center">
            <span className="font-medium text-base block">Other Bank</span>
            <span className="text-xs text-muted-foreground">Inter-Bank Transfer</span>
          </div>
        </button>
      </div>
    </div>
  );
}
