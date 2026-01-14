"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import BreathingLogoLoader from "@/components/ui/loading/BreathingLogoLoader";

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
      <BreathingLogoLoader size={120} />
    </div>
  );
}
