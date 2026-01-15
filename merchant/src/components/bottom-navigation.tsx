"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Coins, History, User, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Home",
    icon: Home,
    path: "/scan",
  },
  {
    label: "Tip",
    icon: Coins,
    path: "/tip",
  },
  {
    label: "History",
    icon: History,
    path: "/history",
  },
  {
    label: "Profile",
    icon: User,
    path: "/profile",
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show bottom nav on login page, root page, or log-transaction page
  if (pathname === "/login" || pathname === "/" || pathname === "/log-transaction") {
    return null;
  }

  return (
    <>
      {/* Quick Scan FAB - above bottom nav */}
      <button
        onClick={() => router.push("/scan?quickscan=true")}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[101] w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
        aria-label="Quick Scan"
      >
        <ScanLine className="size-7 text-primary-foreground" strokeWidth={2.5} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-card border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto bg-card">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-all duration-200",
                  "hover:bg-accent/50 active:scale-95",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    "size-5 transition-all",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-xs font-medium transition-all",
                    isActive && "font-semibold"
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

