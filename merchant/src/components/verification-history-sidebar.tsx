"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Clock, FileDigit, Scan, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { BANKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface VerificationHistoryItem {
  id: string;
  amount: string;
  transactionId: string;
  bankId: string;
  method: "transaction" | "camera";
  tipAmount?: string;
  timestamp: Date;
}

interface VerificationHistorySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock history data - replace with actual API call
const mockHistory: VerificationHistoryItem[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `ver_${i + 1}`,
    amount: `${(Math.random() * 10000 + 100)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
    transactionId: `TXN${Date.now() - i * 3600000}`,
    bankId: ["cbe", "boa", "awash", "telebirr"][Math.floor(Math.random() * 4)],
    method: Math.random() > 0.5 ? "transaction" : "camera",
    tipAmount:
      Math.random() > 0.7
        ? `${(Math.random() * 500 + 50)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
        : undefined,
    timestamp: new Date(Date.now() - i * 3600000),
  })
);

export function VerificationHistorySidebar({
  open,
  onOpenChange,
}: VerificationHistorySidebarProps) {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(7);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (open) {
      // Reset display count when sidebar opens
      setDisplayCount(7);
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    // Simulate API call
    setTimeout(() => {
      setDisplayCount((prev) => prev + 5);
      setIsLoadingMore(false);
    }, 500);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleCopyTransactionId = async (
    transactionId: string,
    itemId: string
  ) => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopiedId(itemId);
      toast.success("Transaction ID copied!", {
        description: transactionId,
      });
      // Reset animation after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy transaction ID");
      console.error("Failed to copy:", err);
    }
  };

  const displayedHistory = history.slice(0, displayCount);
  const hasMore = history.length > displayCount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b border-border p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Verification History
          </SheetTitle>
          <SheetDescription className="text-left">
            View your payment verification history
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : displayedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No verification history yet
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {displayedHistory.map((item) => {
                const bank = BANKS.find((b) => b.id === item.bankId);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm",
                      "space-y-3"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Bank Logo */}
                        {bank && (
                          <div className="relative w-10 h-10 shrink-0 rounded-lg bg-muted p-1.5">
                            <Image
                              src={bank.icon}
                              alt={bank.name}
                              fill
                              className="object-contain"
                              sizes="40px"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">
                              {item.amount} ETB
                            </span>
                            {item.tipAmount && (
                              <Badge
                                variant="secondary"
                                className="bg-accent/10 text-primary border-accent/20"
                              >
                                Tip: {item.tipAmount} ETB
                              </Badge>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handleCopyTransactionId(
                                item.transactionId,
                                item.id
                              )
                            }
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                          >
                            {item.method === "transaction" ? (
                              <FileDigit className="h-3.5 w-3.5" />
                            ) : (
                              <Scan className="h-3.5 w-3.5" />
                            )}
                            <span className="truncate font-mono">
                              {item.transactionId}
                            </span>
                            <div
                              className={cn(
                                "transition-all duration-300",
                                copiedId === item.id
                                  ? "opacity-100 scale-100"
                                  : "opacity-0 scale-0"
                              )}
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-secondary animate-in fade-in zoom-in" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </button>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(item.timestamp)}</span>
                            {bank && (
                              <>
                                <span>•</span>
                                <span>{bank.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
