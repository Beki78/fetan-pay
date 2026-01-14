"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSession();
  const hasRedirected = useRef(false);

  // Root route is just an auth gate.
  useEffect(() => {
    if (isLoading || hasRedirected.current) return;
    hasRedirected.current = true;

    // Use window.location for production to ensure cookies are set
    if (process.env.NODE_ENV === "production") {
      window.location.href = isAuthenticated ? "/scan" : "/login";
    } else {
      router.replace(isAuthenticated ? "/scan" : "/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <Image
            src="/images/logo/fetan-logo.png"
            alt={APP_CONFIG.name}
            fill
            sizes="80px"
            className="object-contain animate-pulse"
            priority
          />
        </div>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    </div>
  );
}
