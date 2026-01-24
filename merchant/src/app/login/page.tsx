"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, LogIn, QrCode } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginSchema } from "@/lib/schemas";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import { QRLoginScanner } from "@/components/qr-login-scanner";
import { useValidateQRCodeMutation } from "@/lib/services/qrLoginApi";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { isAuthenticated, isLoading: isSessionLoading } = useSession();
  const { signInWithEmailAndPassword } = useAuth();
  const [validateQRCode, { isLoading: isQRValidating }] =
    useValidateQRCodeMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "waiter@test.com",
      password: "waiter123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(data.email, data.password);

      if (!result.success) {
        throw new Error(result.error || "Invalid email or password");
      }

      toast.success("Login successful!", {
        description: `Welcome back, ${data.email}`,
      });

      // Redirect to scan page - use window.location for production to ensure cookies are set
      if (process.env.NODE_ENV === "production") {
        window.location.href = "/scan";
      } else {
        router.push("/scan");
      }
    } catch (error) {
      const errorMessage = (error as Error)?.message || "Invalid email or password. Please try again.";
      toast.error("Login failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      setShowQRScanner(false);

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const result = await validateQRCode({
        qrData,
        origin,
      }).unwrap();

      // Auto-fill email and password
      setValue("email", result.email);
      setValue("password", result.password);

      toast.success("QR code scanned successfully!", {
        description: "Logging you in...",
      });

      // Automatically submit the form after a short delay to ensure form state is updated
      setTimeout(async () => {
        setIsLoading(true);
        try {
          const loginResult = await signInWithEmailAndPassword(
            result.email,
            result.password
          );

          if (!loginResult.success) {
            throw new Error(loginResult.error || "Invalid email or password");
          }

          toast.success("Login successful!", {
            description: `Welcome back, ${result.email}`,
          });

          // Redirect to scan page - use window.location for production to ensure cookies are set
          if (process.env.NODE_ENV === "production") {
            window.location.href = "/scan";
          } else {
            router.push("/scan");
          }
        } catch (error) {
          toast.error("Login failed", {
            description:
              (error as Error)?.message ||
              "Invalid email or password. Please try again.",
          });
          setIsLoading(false);
        }
      }, 100);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (error as { message?: string })?.message ||
        "Invalid or expired QR code. Please try again.";
      toast.error("QR code validation failed", {
        description: errorMessage,
      });
    }
  };

  // If already authenticated, don't show the login form.
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Use window.location for production to ensure cookies are set
    if (process.env.NODE_ENV === "production") {
      window.location.href = "/scan";
      return null;
    } else {
      router.replace("/scan");
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Theme Toggle */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-background/60 dark:bg-background/30 border border-border/60 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo/fetan-logo.png"
                alt={APP_CONFIG.name}
                width={28}
                height={28}
                priority
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-poppins tracking-tight text-foreground">
              {APP_CONFIG.name}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground dark:text-white/70">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={cn(
                      "pl-10 h-12 focus-visible:ring-1",
                      errors.email && "border-destructive"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className={cn(
                      "pl-10 h-12 focus-visible:ring-1",
                      errors.password && "border-destructive"
                    )}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow mt-6"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in
                  </>
                )}
              </Button>

              {/* QR Code Login Button */}
              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQRScanner(true)}
                disabled={isLoading || isQRValidating}
                className="w-full h-12 text-base font-semibold mt-4"
                size="lg"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Scan QR Code to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Scanner Modal */}
      {showQRScanner && (
        <QRLoginScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
