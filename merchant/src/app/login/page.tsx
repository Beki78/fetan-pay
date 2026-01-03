"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginSchema } from "@/lib/schemas";
import { useAppDispatch } from "@/lib/hooks";
import { setUser, setLoading } from "@/lib/slices/authSlice";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      // Simulate API call - Replace with actual authentication API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      dispatch(
        setUser({
          email: data.email,
          id: "user_" + Date.now(),
        })
      );

      toast.success("Login successful!", {
        description: `Welcome back, ${data.email}`,
      });

      // Redirect to scan page
      router.push("/scan");
    } catch (error) {
      toast.error("Login failed", {
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {APP_CONFIG.name}
          </h1>
          <ThemeToggle />
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

