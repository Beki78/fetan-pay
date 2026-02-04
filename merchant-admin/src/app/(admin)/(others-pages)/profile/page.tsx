"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import { useSession } from "@/hooks/useSession";
import { findMerchantByEmail, getMerchantProfile, MerchantProfile, updateMerchantProfile } from "@/lib/services/profileService";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import AlertBanner from "@/components/ui/alert/AlertBanner";
import { toast } from "sonner";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import {
  type TransactionProvider,
  type MerchantReceiverAccount,
  useGetActiveReceiverAccountsQuery,
  useDisableActiveReceiverAccountMutation,
  useEnableLastReceiverAccountMutation,
} from "@/lib/services/paymentsServiceApi";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateMerchantUserMutation } from "@/lib/services/merchantUsersServiceApi";
import { API_BASE_URL } from "@/lib/config";

export default function Settings() {
  const router = useRouter();
  const { user, isLoading: isSessionLoading, refreshSession } = useSession();
  const { status: accountStatus } = useAccountStatus();

  const deriveMerchantId = (u: any): string | null => {
    const meta = u?.metadata;
    return (
      meta?.merchantId ||
      meta?.merchant?.id ||
      u?.merchantId ||
      u?.merchant?.id ||
      null
    );
  };

  const [merchantId, setMerchantId] = useState<string | null>(() => deriveMerchantId(user));

  const [formData, setFormData] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
  });
  const [userName, setUserName] = useState<string>("");
  const [currentMerchantUserId, setCurrentMerchantUserId] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Receiver accounts
  const { data: receiverAccountsData, refetch: refetchReceiverAccounts } = useGetActiveReceiverAccountsQuery();
  const [disableActiveReceiverAccount] = useDisableActiveReceiverAccountMutation();
  const [enableLastReceiverAccount] = useEnableLastReceiverAccountMutation();

  const receiverAccounts = receiverAccountsData?.data ?? [];

  const { signInWithGoogle, isLoading: isLinkingGoogle } = useAuth();
  const [updateMerchantUser] = useUpdateMerchantUserMutation();
  const userDisplayName = user?.name || user?.email || "";
  const userInitial = userDisplayName?.charAt(0).toUpperCase() || "?";
  
  // Check if Google is linked by checking if user has a Google account
  // Better Auth stores accounts in the Account table with providerId='google'
  const isGoogleLinked = Boolean(
    (user as any)?.accounts?.some?.((acc: any) => acc.providerId === "google") ||
    (user as any)?.providers?.includes?.("google") ||
    (user as any)?.metadata?.googleLinked
  );
  
  // Check if password is set - Better Auth stores credential accounts with providerId='credential'
  // The presence of a credential account means password is set (even if password field is not exposed)
  const passwordSet = Boolean(
    (user as any)?.accounts?.some?.((acc: any) => acc.providerId === "credential") ||
    (user as any)?.metadata?.passwordSet ||
    // Fallback: if user can sign in with email/password, they have a password
    (user?.email && !isGoogleLinked) // If they have email but no Google, likely have password
  );

  // Track previous user email to detect user changes
  const [previousUserEmail, setPreviousUserEmail] = useState<string | null>(null);

  // Initialize user name from session
  useEffect(() => {
    if (user?.name && !userName) {
      setUserName(user.name);
    }
  }, [user?.name, userName]);

  // Clear cached data when user changes
  useEffect(() => {
    if (user?.email && user.email !== previousUserEmail) {
      // User has changed - clear all cached data
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("merchantId");
        window.localStorage.removeItem("merchantStatus");
      }
      setMerchantId(null);
      setMerchantProfile(null);
      setFormData({
        businessName: "",
        businessEmail: "",
        businessPhone: "",
      });
      setUserName(user?.name || "");
      setCurrentMerchantUserId(null);
      setPreviousUserEmail(user.email);
    }
  }, [user?.email, previousUserEmail, user?.name]);

  // keep merchantId in sync with user updates
  useEffect(() => {
    const nextIdFromUser = deriveMerchantId(user);
    if (nextIdFromUser && nextIdFromUser !== merchantId) {
      setMerchantId(nextIdFromUser);
      return;
    }

    // Only use localStorage if we don't have merchantId from user AND we're still on the same user
    if (!merchantId && !nextIdFromUser && user?.email === previousUserEmail && typeof window !== "undefined") {
      const stored = window.localStorage.getItem("merchantId");
      if (stored) {
        setMerchantId(stored);
      }
    }
  }, [user, merchantId, previousUserEmail]);

  useEffect(() => {
    const load = async () => {
      // Don't load if user email doesn't match (user has changed)
      if (!user?.email || (previousUserEmail && user.email !== previousUserEmail)) {
        return;
      }

      if (!merchantId && !user?.email) return;

      setIsProfileLoading(true);
      setError(null);
      try {
        let effectiveMerchantId = merchantId;

        // Always prioritize lookup by current user email to ensure we get the right merchant
        if (user?.email) {
          const found = await findMerchantByEmail(user.email);
          if (found) {
            // Verify this merchant belongs to the current user
            effectiveMerchantId = found.id;
            setMerchantId(found.id);
          }
        }

        // If still no merchantId, use the one from state (but only if user matches)
        if (!effectiveMerchantId && merchantId && user?.email === previousUserEmail) {
          effectiveMerchantId = merchantId;
        }

        if (!effectiveMerchantId) {
          setError("Merchant ID not available in session or via lookup.");
          return;
        }

        const profile = await getMerchantProfile(effectiveMerchantId);
        
        // Verify the profile belongs to the current user before caching
        if (user?.email && (profile.contactEmail === user.email || !profile.contactEmail)) {
        // cache for later visits if session payload lacks merchantId
        if (typeof window !== "undefined") {
          window.localStorage.setItem("merchantId", profile.id);
          if (profile.status) {
            window.localStorage.setItem("merchantStatus", profile.status.toLowerCase());
          }
        }
        }
        
        setMerchantProfile(profile);
        setFormData({
          businessName: profile.name || "",
          businessEmail: profile.contactEmail || "",
          businessPhone: profile.contactPhone || "",
        });
        
        // Fetch current merchant user membership to get merchant user ID
        try {
          const meResponse = await fetch(`${API_BASE_URL}/merchant-users/me`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (meResponse.ok) {
            const meData = await meResponse.json();
            const membership = meData.membership;
            if (membership) {
              setCurrentMerchantUserId(membership.id);
              // Use merchant user name if available, otherwise use Better Auth user name
              setUserName(membership.name || user?.name || "");
            } else {
              // Fallback to profile.users if /me endpoint doesn't return membership
              if (profile.users && profile.users.length > 0) {
                const currentUserRecord = profile.users.find(
                  (u: any) => u.email === user?.email || u.userId === user?.id
                );
                if (currentUserRecord) {
                  setUserName(currentUserRecord.name || user?.name || "");
                  setCurrentMerchantUserId(currentUserRecord.id);
                } else {
                  setUserName(user?.name || "");
                }
              } else {
                setUserName(user?.name || "");
              }
            }
          } else {
            // Fallback to profile.users if /me endpoint fails
            if (profile.users && profile.users.length > 0) {
              const currentUserRecord = profile.users.find(
                (u: any) => u.email === user?.email || u.userId === user?.id
              );
              if (currentUserRecord) {
                setUserName(currentUserRecord.name || user?.name || "");
                setCurrentMerchantUserId(currentUserRecord.id);
              } else {
                setUserName(user?.name || "");
              }
            } else {
              setUserName(user?.name || "");
            }
          }
        } catch (err) {
          console.warn("Failed to fetch merchant user membership:", err);
          // Fallback to user name from session
          setUserName(user?.name || "");
          // Try to find from profile.users as last resort
          if (profile.users && profile.users.length > 0) {
            const currentUserRecord = profile.users.find(
              (u: any) => u.email === user?.email || u.userId === user?.id
            );
            if (currentUserRecord) {
              setCurrentMerchantUserId(currentUserRecord.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load merchant profile", err);
        setError((err as Error)?.message || "Unable to load profile");
      } finally {
        setIsProfileLoading(false);
      }
    };

    load();
  }, [merchantId, user, previousUserEmail]);

  // Sync userName with user.name when user updates (after refreshSession)
  useEffect(() => {
    if (user?.name) {
      setUserName((prev) => (prev !== user.name ? user.name : prev));
    }
  }, [user?.name]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!merchantId) {
      toast.error("Merchant ID not available");
      return;
    }

    setIsSaving(true);
    try {
      // Update merchant profile (business info)
      await updateMerchantProfile(merchantId, {
        name: formData.businessName,
        contactEmail: formData.businessEmail,
        contactPhone: formData.businessPhone,
      });

      // Update user name if changed
      if (userName.trim() && userName !== (user?.name || "")) {
        // Get merchant user ID if not already set
        let merchantUserId = currentMerchantUserId;
        
        if (!merchantUserId) {
          try {
            const meResponse = await fetch(`${API_BASE_URL}/merchant-users/me`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (meResponse.ok) {
              const meData = await meResponse.json();
              merchantUserId = meData.membership?.id;
              if (merchantUserId) {
                setCurrentMerchantUserId(merchantUserId);
              }
            }
          } catch (err) {
            console.warn("Failed to fetch merchant user ID:", err);
          }
        }

        // If still no merchantUserId, try from profile
        if (!merchantUserId && merchantProfile?.users) {
          const currentUserRecord = merchantProfile.users.find(
            (u: any) => u.email === user?.email || u.userId === user?.id
          );
          if (currentUserRecord) {
            merchantUserId = currentUserRecord.id;
            setCurrentMerchantUserId(merchantUserId);
          }
        }

        if (merchantUserId) {
          // Update merchant user name
          await updateMerchantUser({
            merchantId,
            id: merchantUserId,
            name: userName.trim(),
          }).unwrap();

          // Update Better Auth user name
          try {
            const result = await authClient.updateUser({
              name: userName.trim(),
            });
            if (result.error) {
              console.warn("Failed to update Better Auth user name:", result.error);
            }
          } catch (authError) {
            console.warn("Failed to update Better Auth user name:", authError);
          }
        }
      }

      // Reload profile to get updated data
      const profile = await getMerchantProfile(merchantId);
      setMerchantProfile(profile);
      setFormData({
        businessName: profile.name || "",
        businessEmail: profile.contactEmail || "",
        businessPhone: profile.contactPhone || "",
      });

      // Refresh session to get updated user data (without page reload)
      await refreshSession();

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error?.data?.message || error?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleSetPassword = () => {
    // For users without password (Google users), they can set password via Change Password form
    // Better Auth's changePassword might work without currentPassword if no password exists
    // Direct user to the Change Password form
    toast.info("Please use the 'Change Password' section below to set your password. If you don't have a password yet, leave the current password field empty.");
    setIsSettingPassword(false);
  };

  const handleLinkGoogle = async () => {
    try {
      const success = await signInWithGoogle();
      if (success) {
        toast.success("Google account linked successfully");
        // Refresh session to get updated user data
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        toast.error("Failed to link Google account. Please try again.");
      }
    } catch (error: any) {
      console.error("Error linking Google:", error);
      toast.error(error?.message || "Failed to link Google account");
    }
  };

  const handleUnlinkGoogle = async () => {
    // Note: Better Auth doesn't have a direct "unlink" method
    // Users would need to contact support or we'd need a custom endpoint
    toast.info("To unlink Google, please contact support or set a password first and then you can disable Google sign-in");
  };

  // Helper function to get bank logo path
  const getBankLogo = (provider: TransactionProvider): string => {
    const logos: Record<TransactionProvider, string> = {
      CBE: "/images/banks/CBE.png",
      TELEBIRR: "/images/banks/Telebirr.png",
      AWASH: "/images/banks/Awash.png",
      BOA: "/images/banks/BOA.png",
      DASHEN: "/images/banks/CBE.png", // Fallback to CBE until Dashen logo is added
    };
    return logos[provider] || "/images/banks/CBE.png";
  };

  // Helper function to get bank name
  const getBankName = (provider: TransactionProvider): string => {
    const names: Record<TransactionProvider, string> = {
      CBE: "Commercial Bank of Ethiopia",
      TELEBIRR: "Telebirr",
      AWASH: "Awash Bank",
      BOA: "Bank of Abyssinia",
      DASHEN: "Dashen Bank",
    };
    return names[provider] || provider;
  };

  const handleDisableAccount = async (provider: TransactionProvider) => {
    try {
      await disableActiveReceiverAccount({ provider }).unwrap();
      toast.success(`${getBankName(provider)} account disabled successfully`);
      refetchReceiverAccounts();
    } catch (error: any) {
      console.error("Failed to disable account:", error);
      toast.error(error?.data?.message || `Failed to disable ${getBankName(provider)} account`);
    }
  };

  const handleEnableAccount = async (provider: TransactionProvider) => {
    try {
      await enableLastReceiverAccount({ provider }).unwrap();
      toast.success(`${getBankName(provider)} account enabled successfully`);
      refetchReceiverAccounts();
    } catch (error: any) {
      console.error("Failed to enable account:", error);
      toast.error(error?.data?.message || `Failed to enable ${getBankName(provider)} account`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your merchant account settings
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge color={accountStatus === "active" ? "success" : "warning"} size="sm">
            {accountStatus === "active" ? "Active" : "Pending approval"}
          </Badge>
          
          {!merchantId && !isSessionLoading && (
            <span className="text-xs text-red-500">Merchant ID missing from session</span>
          )}
        </div>
      </div>

      {error && (
        <AlertBanner
          variant="error"
          title="Unable to load profile"
          message={error}
        />
      )}

      <div className="space-y-6">
        {/* Profile Photo Section */}
  {/* <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Profile Photo
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Your profile photo is visible to other users
          </p>

          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-green-500 dark:bg-green-600 flex items-center justify-center">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-white">
                    {userInitial}
                  </span>
                )}
              </div>
              {isGoogleLinked && !profilePhoto && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
          viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                id="photo-upload"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <label htmlFor="photo-upload">
                <Button
                  size="sm"
                  className="mb-2 bg-purple-500 hover:bg-purple-600 text-white border-0"
                >
                  Change Photo
                </Button>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                PNG, JPG or WebP. Max 2MB.
              </p>
              {isGoogleLinked && !profilePhoto && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Using your Google profile photo. Upload a new one to override.
                </p>
              )}
            </div>
          </div>
        </div> */}

        {/* Business Information Section */}
  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                Business Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your business details
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={isSaving || isProfileLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              {isProfileLoading ? "Loading..." : isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="space-y-6">
            {/* Account Information */}
            <div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label>Business Phone</Label>
                  <Input
                    type="tel"
                    value={formData.businessPhone}
                    onChange={(e) => handleInputChange("businessPhone", e.target.value)}
                    placeholder="Enter business phone number"
                  />
                </div>
              </div>
            </div>

            {/* Business Name & Business Email */}
            <div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Business Email</Label>
                  <Input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange("businessEmail", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password & Security Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <ChangePasswordForm />
        </div>

        {/* Sign-in Methods Section */}
  {/* <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Sign-in Methods
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Manage how you sign in to your account
          </p>

          <div className="space-y-4"> */}
            {/* Email & Password */}
            {/* <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Email & Password
                    </span>
                    <Badge color={passwordSet ? "success" : "light"} size="sm">
                      {passwordSet ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {user?.email || "Email not available"}
                  </p>
                </div>
              </div>
              {!passwordSet && (
                <Button
                  size="sm"
                  onClick={() => setIsSettingPassword(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0"
                >
                  Set Password
                </Button>
              )}
            </div> */}

            {/* Google */}
            {/* <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {isGoogleLinked ? (
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ) : (
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {userInitial}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Google
                    </span>
                    <Badge color={isGoogleLinked ? "success" : "light"} size="sm">
                      {isGoogleLinked ? "Linked" : "Not Linked"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {isGoogleLinked 
                      ? "Sign in quickly with your Google account."
                      : "Link your Google account for quick sign-in."
                    }
                  </p>
                </div>
              </div>
              {isGoogleLinked ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnlinkGoogle}
                  disabled={!passwordSet}
                  className={!passwordSet ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Unlink
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleLinkGoogle}
                  disabled={isLinkingGoogle}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0"
                >
                  {isLinkingGoogle ? "Linking..." : "Link Google"}
                </Button>
              )}
            </div> */}

            {/* Warning */}
            {/* {!passwordSet && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  Set a password to enable email/password sign-in and to unlink Google.
        </p>
      </div>
            )}
          </div>
        </div> */}

        {/* Payment Account Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                Payment Account
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your configured payment receiving accounts
              </p>
            </div>
            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/payment-providers")}
              className="bg-purple-500 hover:bg-purple-600 text-white border-0"
            >
              Configure Accounts
            </Button> */}
          </div>

          <div className="space-y-4">
            {receiverAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No payment accounts configured yet.
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push("/payment-providers")}
                  className="bg-purple-500 hover:bg-purple-600 text-white border-0"
                >
                  Configure Your First Account
                </Button>
              </div>
            ) : (
              receiverAccounts.map((account: MerchantReceiverAccount) => {
                const bankName = getBankName(account.provider);
                const bankLogo = getBankLogo(account.provider);
                const isActive = account.status === "ACTIVE";
                const maskedAccount = account.receiverAccount.length > 4
                  ? `****${account.receiverAccount.slice(-4)}`
                  : account.receiverAccount;

                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 shrink-0">
                        <Image
                          src={bankLogo}
                          alt={bankName}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            {account.receiverLabel || bankName}
                          </span>
                          <Badge
                            color={isActive ? "success" : "warning"}
                            size="sm"
                          >
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.receiverName && `${account.receiverName} • `}
                          {maskedAccount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <Button
                          size="sm"
                          onClick={() => handleDisableAccount(account.provider)}
                          className="bg-red-500 hover:bg-red-600 text-white border-0"
                        >
                          Disable
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEnableAccount(account.provider)}
                          className="bg-green-500 hover:bg-green-600 text-white border-0"
                        >
                          Enable
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/payment-providers")}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Set Password Modal */}
      {isSettingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Set Password
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create a password to enable email/password sign-in
            </p>

            <div className="space-y-4">
              <div>
                <Label>
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label>
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                />
              </div>
          </div>

            <div className="flex items-center gap-3 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsSettingPassword(false);
                  setPasswordData({ password: "", confirmPassword: "" });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSetPassword}
                disabled={isSettingPassword || !passwordData.password || passwordData.password !== passwordData.confirmPassword}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white border-0"
              >
                {isSettingPassword ? "Setting..." : "Set Password"}
              </Button>
          </div>
          </div>
      </div>
      )}
    </div>
  );
}
