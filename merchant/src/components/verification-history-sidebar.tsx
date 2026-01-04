"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Clock, FileDigit, Scan, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { BANKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type TransactionProvider,
  useListVerificationHistoryQuery,
} from "@/lib/services/paymentsServiceApi";
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
  reference: string;
  provider: TransactionProvider;
  status: "PENDING" | "VERIFIED" | "UNVERIFIED";
  mismatchReason?: string | null;
  tipAmount?: string;
  timestamp: Date;
}

interface VerificationHistorySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificationHistorySidebar({
  open,
  onOpenChange,
}: VerificationHistorySidebarProps) {
  const [historyItems, setHistoryItems] = useState<VerificationHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    data,
    isFetching,
    isError,
    refetch,
  } = useListVerificationHistoryQuery(
    open ? { page, pageSize } : undefined,
    { skip: !open }
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setHistoryItems([]);
      setPage(1);
    }
  }, [open]);

  // Merge new page data
  useEffect(() => {
    if (!data) return;

    const mapped: VerificationHistoryItem[] = data.data.map((p) => {
      const providerToBankId: Record<string, string> = {
        CBE: "cbe",
        BOA: "boa",
        AWASH: "awash",
        TELEBIRR: "telebirr",
        DASHEN: "dashen",
      };

      const bankId = providerToBankId[p.provider] ?? "cbe";
      const amount = (p.claimedAmount ?? "")
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const tipAmount = p.tipAmount
        ? p.tipAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : undefined;

      const timestampStr = p.verifiedAt ?? p.updatedAt ?? p.createdAt;
      const timestamp = new Date(timestampStr);

      return {
        id: p.id,
        amount,
        reference: p.reference,
        provider: p.provider,
        status: p.status,
        mismatchReason: p.mismatchReason,
        tipAmount,
        timestamp,
        // keep for bank logo lookup
        bankId,
      } as any;
    });

    setHistoryItems((prev) => {
      const existing = new Set(prev.map((x) => x.id));
      const merged = [...prev];
      for (const item of mapped) {
        if (!existing.has(item.id)) merged.push(item);
      }
      // keep newest first
      merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return merged;
    });
  }, [data]);

  useEffect(() => {
    if (open && isError) {
      toast.error("Failed to load verification history");
    }
  }, [open, isError]);

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

  const hasMore = useMemo(() => {
    if (!data) return false;
    return historyItems.length < data.total;
  }, [data, historyItems.length]);

  const displayedHistory = historyItems;

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
          {isFetching && displayedHistory.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : displayedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No verification history yet
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {displayedHistory.map((item) => {
                const bank = BANKS.find((b) => (b as any).id === (item as any).bankId);

                const statusVariant =
                  item.status === "VERIFIED"
                    ? "secondary"
                    : item.status === "PENDING"
                      ? "outline"
                      : "destructive";
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
                            <Badge
                              variant={statusVariant as any}
                              className={cn(
                                "border",
                                item.status === "VERIFIED" &&
                                  "bg-accent/10 text-primary border-accent/20",
                              )}
                            >
                              {item.status}
                            </Badge>
                            {item.tipAmount && (
                              <Badge
                                variant="secondary"
                                className="bg-accent/10 text-primary border-accent/20"
                              >
                                Tip: {item.tipAmount} ETB
                              </Badge>
                            )}
                          </div>

                          {item.mismatchReason && item.status !== "VERIFIED" && (
                            <div className="text-xs text-muted-foreground">
                              Reason: {item.mismatchReason}
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleCopyTransactionId(item.reference, item.id)
                            }
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                          >
                            <FileDigit className="h-3.5 w-3.5" />
                            <span className="truncate font-mono">
                              {item.reference}
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
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? (
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
