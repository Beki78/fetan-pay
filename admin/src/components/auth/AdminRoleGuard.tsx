"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

const ALLOWED_ADMIN_ROLES = new Set(["SUPERADMIN", "ADMIN"]);

type Props = {
  children: React.ReactNode;
};

export default function AdminRoleGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, signOut } = useSession();
  const [hasSignedOut, setHasSignedOut] = useState(false);

  const role = (user as any)?.role as string | undefined;

  const isAllowed = useMemo(() => {
    if (!role) return false;
    return ALLOWED_ADMIN_ROLES.has(role);
  }, [role]);

  useEffect(() => {
    if (isLoading) return;

    // Not signed in -> go to sign in
    if (!isAuthenticated) {
      router.replace(`/signin?next=${encodeURIComponent(pathname ?? "/")}`);
      return;
    }

    // Signed in but not admin -> force sign out, then go to sign in
    if (!isAllowed && !hasSignedOut) {
      setHasSignedOut(true);
      void (async () => {
        await signOut();
        router.replace(
          "/signin?error=" +
            encodeURIComponent("You don't have access to the admin dashboard.")
        );
      })();
    }
  }, [hasSignedOut, isAllowed, isAuthenticated, isLoading, pathname, router, signOut]);

  // While checking or while we are signing out, render nothing to avoid flicker
  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if (!isAllowed) return null;

  return <>{children}</>;
}
