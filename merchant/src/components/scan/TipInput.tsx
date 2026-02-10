import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TipInputProps {
  showTip: boolean;
  tipAmount: string;
  canAccessTips: boolean;
  planName?: string;
  error?: string;
  onToggleTip: (checked: boolean) => void;
  onTipChange: (value: string) => void;
}

export function TipInput({
  showTip,
  tipAmount,
  canAccessTips,
  planName,
  error,
  onToggleTip,
  onTipChange,
}: TipInputProps) {
  const handleToggle = (checked: boolean) => {
    if (checked && !canAccessTips) {
      toast.error("Tips feature not available", {
        description: `Tips collection is not available in your ${planName || "current"} plan. Please upgrade your plan to enable tips collection.`,
        duration: 5000,
      });
      return;
    }
    onToggleTip(checked);
  };

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-foreground">
            Include Tip
          </label>
          <p className="text-xs text-muted-foreground">
            Add tip amount for this transaction
          </p>
        </div>
        <Switch
          checked={showTip}
          onCheckedChange={handleToggle}
        />
      </div>
      {showTip && (
        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-foreground">
            Tip Amount (ETB)
          </label>
          <Input
            type="text"
            placeholder="Enter tip amount"
            value={tipAmount}
            onChange={(e) => onTipChange(e.target.value)}
            className={cn(
              "h-12 focus-visible:ring-1",
              error && "border-destructive",
            )}
            inputMode="numeric"
          />
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
