"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { User, Mail, Building, LogOut, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/lib/config";
import Image from "next/image";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, membership, isAuthenticated, isLoading: isSessionLoading, signOut } = useSession();

  // Route protection
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isSessionLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center pb-20">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Will redirect in useEffect, but show loading to avoid 404
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center pb-20">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  const businessName = (membership as any)?.membership?.merchant?.name ?? null;
  const userRole = (membership as any)?.membership?.role ?? null;

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
            <span className="font-semibold text-lg">Profile</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="size-10 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.name || "User"}
                </h2>
                {userRole && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {userRole.replace("_", " ")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {businessName && (
              <div className="flex items-center gap-3">
                <Building className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Business</p>
                  <p className="font-medium">{businessName}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                // TODO: Navigate to settings page
                toast.info("Settings coming soon");
              }}
            >
              <Settings className="size-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

