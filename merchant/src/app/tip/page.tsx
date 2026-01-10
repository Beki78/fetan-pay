"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Coins, TrendingUp, DollarSign, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
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

  // Calculate date ranges (must be before hooks)
  const now = useMemo(() => new Date(), []);
  const todayStart = useMemo(() => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setHours(0, 0, 0, 0);
    return date;
  }, [now]);
  const weekStart = useMemo(() => {
    const date = new Date(now);
    date.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    date.setHours(0, 0, 0, 0);
    return date;
  }, [now]);
  const monthStart = useMemo(() => {
    const date = new Date(now.getFullYear(), now.getMonth(), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [now]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Fetch tip summaries
  const {
    data: todayData,
    isLoading: todayLoading,
    error: todayError,
  } = useGetTipsSummaryQuery({
    from: todayStart.toISOString(),
    to: now.toISOString(),
  });

  const {
    data: weekData,
    isLoading: weekLoading,
    error: weekError,
  } = useGetTipsSummaryQuery({
    from: weekStart.toISOString(),
    to: now.toISOString(),
  });

  const {
    data: monthData,
    isLoading: monthLoading,
    error: monthError,
  } = useGetTipsSummaryQuery({
    from: monthStart.toISOString(),
    to: now.toISOString(),
  });

  const {
    data: totalData,
    isLoading: totalLoading,
    error: totalError,
  } = useGetTipsSummaryQuery({});

  // Fetch tip history
  const { data: tipsData, isLoading: tipsLoading } = useListTipsQuery({
    page: 1,
    pageSize: 20,
  });

  const tipStats = useMemo(() => {
    return {
      today:
        todayData?.totalTipAmount != null
          ? Number(todayData.totalTipAmount)
          : 0,
      thisWeek:
        weekData?.totalTipAmount != null
          ? Number(weekData.totalTipAmount)
          : 0,
      thisMonth:
        monthData?.totalTipAmount != null
          ? Number(monthData.totalTipAmount)
          : 0,
      total:
        totalData?.totalTipAmount != null
          ? Number(totalData.totalTipAmount)
          : 0,
    };
  }, [todayData, weekData, monthData, totalData]);

  // Individual loading states for each card

  // Early returns AFTER all hooks
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
                Your tips & earnings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  {todayLoading ? (
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
                  {weekLoading ? (
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
                  {monthLoading ? (
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
                  {totalLoading ? (
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
    </div>
  );
}
