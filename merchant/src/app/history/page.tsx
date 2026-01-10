"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { History as HistoryIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_CONFIG } from "@/lib/config";
import Image from "next/image";
import { formatNumberWithCommas } from "@/lib/validation";
import { useListVerificationHistoryQuery } from "@/lib/services/paymentsServiceApi";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Route protection
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionLoading, router]);

  const { data, isLoading, error } = useListVerificationHistoryQuery(
    {
      page,
      pageSize,
    }
  );

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center pb-20">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Will redirect in useEffect, but show loading to avoid 404
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center pb-20">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  const transactions = data?.data || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background pb-20">
      <div className="container mx-auto px-3 py-8 max-w-2xl">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl border border-blue-100 bg-white shadow-sm dark:border-slate-800 dark:bg-background">
              <Image
                src="/images/logo/fetan-logo.png"
                alt={APP_CONFIG.name}
                fill
                sizes="56px"
                className="object-contain p-2"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-poppins tracking-tight text-blue-700 dark:text-white">
                {APP_CONFIG.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Verification history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="size-5" />
              Verification History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-6" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Failed to load history</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try again later
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HistoryIcon className="size-12 mx-auto mb-2 opacity-50" />
                <p>No verification history yet</p>
                <p className="text-sm mt-1">
                  Your payment verifications will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {transaction.status === "VERIFIED" ? (
                          <CheckCircle2 className="size-4 text-secondary" />
                        ) : (
                          <XCircle className="size-4 text-destructive" />
                        )}
                        <span className="font-medium">
                          {formatNumberWithCommas(String(transaction.claimedAmount || "0"))} ETB
                        </span>
                        <Badge
                          variant={
                            transaction.status === "VERIFIED"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">
                          {transaction.reference}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {transaction.provider && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {transaction.provider}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

