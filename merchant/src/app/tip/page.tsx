"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Coins, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/lib/config";
import Image from "next/image";
import { formatNumberWithCommas } from "@/lib/validation";

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

  // TODO: Fetch actual tip data from API
  const tipStats = {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                  <p className="text-2xl font-bold text-primary">
                    {formatNumberWithCommas(tipStats.today)} ETB
                  </p>
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
                  <p className="text-2xl font-bold text-secondary">
                    {formatNumberWithCommas(tipStats.thisWeek)} ETB
                  </p>
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
                  <p className="text-2xl font-bold text-accent">
                    {formatNumberWithCommas(tipStats.thisMonth)} ETB
                  </p>
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
                  <p className="text-2xl font-bold">
                    {formatNumberWithCommas(tipStats.total)} ETB
                  </p>
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
            <div className="space-y-4">
              {/* TODO: Map through actual tip transactions */}
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="size-12 mx-auto mb-2 opacity-50" />
                <p>No tips recorded yet</p>
                <p className="text-sm mt-1">
                  Tips will appear here after payment verifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

