"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Coins, TrendingUp, DollarSign, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/lib/config";
import Image from "next/image";
import { formatNumberWithCommas } from "@/lib/validation";
import {
  useGetTipsSummaryQuery,
  useListTipsQuery,
} from "@/lib/services/paymentsServiceApi";

export default function TipPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();

  // Route protection
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionLoading, router]);

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

  // Calculate date ranges
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch tip summaries
  const { data: todayData, isLoading: todayLoading } = useGetTipsSummaryQuery({
    from: todayStart.toISOString(),
    to: now.toISOString(),
  });

  const { data: weekData, isLoading: weekLoading } = useGetTipsSummaryQuery({
    from: weekStart.toISOString(),
    to: now.toISOString(),
  });

  const { data: monthData, isLoading: monthLoading } = useGetTipsSummaryQuery({
    from: monthStart.toISOString(),
    to: now.toISOString(),
  });

  const { data: totalData, isLoading: totalLoading } = useGetTipsSummaryQuery(
    {}
  );

  // Fetch tip history
  const { data: tipsData, isLoading: tipsLoading } = useListTipsQuery({
    page: 1,
    pageSize: 20,
  });

  const tipStats = useMemo(() => {
    return {
      today: todayData?.totalTipAmount ? Number(todayData.totalTipAmount) : 0,
      thisWeek: weekData?.totalTipAmount ? Number(weekData.totalTipAmount) : 0,
      thisMonth: monthData?.totalTipAmount
        ? Number(monthData.totalTipAmount)
        : 0,
      total: totalData?.totalTipAmount ? Number(totalData.totalTipAmount) : 0,
    };
  }, [todayData, weekData, monthData, totalData]);

  const isLoading = todayLoading || weekLoading || monthLoading || totalLoading;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/images/logo/fetan-logo.png"
                alt={APP_CONFIG.name}
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-lg">Tips</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  {isLoading ? (
                    <Spinner className="size-6 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">
                      {formatNumberWithCommas(tipStats.today)} ETB
                    </p>
                  )}
                </div>
                <Coins className="size-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  {isLoading ? (
                    <Spinner className="size-6 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-secondary">
                      {formatNumberWithCommas(tipStats.thisWeek)} ETB
                    </p>
                  )}
                </div>
                <TrendingUp className="size-8 text-secondary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  {isLoading ? (
                    <Spinner className="size-6 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-accent">
                      {formatNumberWithCommas(tipStats.thisMonth)} ETB
                    </p>
                  )}
                </div>
                <Calendar className="size-8 text-accent/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  {isLoading ? (
                    <Spinner className="size-6 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {formatNumberWithCommas(tipStats.total)} ETB
                    </p>
                  )}
                </div>
                <DollarSign className="size-8 text-muted-foreground/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tips</CardTitle>
          </CardHeader>
          <CardContent>
            {tipsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-6" />
              </div>
            ) : !tipsData?.data || tipsData.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="size-12 mx-auto mb-2 opacity-50" />
                <p>No tips recorded yet</p>
                <p className="text-sm mt-1">
                  Tips will appear here after payment verifications
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tipsData.data.map((tip) => (
                  <div
                    key={tip.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Coins className="size-4 text-accent" />
                        <span className="font-semibold text-lg">
                          {formatNumberWithCommas(tip.tipAmount)} ETB
                        </span>
                        <Badge
                          variant={
                            tip.status === "VERIFIED" ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {tip.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Payment: {formatNumberWithCommas(tip.claimedAmount)}{" "}
                          ETB
                        </span>
                        <span className="font-mono text-xs">
                          {tip.reference}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>
                          {new Date(tip.createdAt).toLocaleDateString()} at{" "}
                          {new Date(tip.createdAt).toLocaleTimeString()}
                        </span>
                        {tip.verifiedBy && (
                          <>
                            <span>•</span>
                            <span>
                              By: {tip.verifiedBy.name || tip.verifiedBy.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
