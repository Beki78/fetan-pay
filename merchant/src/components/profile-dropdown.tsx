"use client";

import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";

export function ProfileDropdown() {
  const router = useRouter();
  const { user, membership, isAuthenticated, isLoading, signOut } = useSession();

  const businessName = (membership as any)?.membership?.merchant?.name ?? null;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } finally {
      router.push("/login");
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className=""
          aria-label="User profile"
          onClick={handleProfileClick}
          disabled={isLoading}
        >
          <User />
        </Button>
      </DropdownMenuTrigger>
      {isAuthenticated ? (
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {businessName ? businessName : "Signed in as"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Sign in</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
