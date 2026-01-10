"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import { useSession } from "@/hooks/useSession";
import { findMerchantByEmail, getMerchantProfile, MerchantProfile } from "@/lib/services/profileService";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import AlertBanner from "@/components/ui/alert/AlertBanner";

// TODO: Wire payment accounts when API is available
const mockPaymentAccounts: Array<{
  id: string;
  bankName: string;
  bankIcon: string;
  accountHolder: string;
  accountNumber: string;
  status: string;
}> = [];

export default function Settings() {
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();
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

  const userDisplayName = user?.name || user?.email || "";
  const userInitial = userDisplayName?.charAt(0).toUpperCase() || "?";
  const isGoogleLinked = Boolean((user as any)?.providers?.includes?.("google") || (user as any)?.metadata?.googleLinked);
  const passwordSet = Boolean((user as any)?.metadata?.passwordSet);

  // Track previous user email to detect user changes
  const [previousUserEmail, setPreviousUserEmail] = useState<string | null>(null);

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
      setPreviousUserEmail(user.email);
    }
  }, [user?.email, previousUserEmail]);

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
      } catch (err) {
        console.error("Failed to load merchant profile", err);
        setError((err as Error)?.message || "Unable to load profile");
      } finally {
        setIsProfileLoading(false);
      }
    };

    load();
  }, [merchantId, user, previousUserEmail]);

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
    // API endpoint for updating merchant details is not available yet.
    // Keep UI responsive and avoid silent failure.
    console.info("Save requested", formData);
  };

  const handleSetPassword = async () => {
    if (!passwordData.password || passwordData.password !== passwordData.confirmPassword) {
      return;
    }
    setIsSettingPassword(true);
    // TODO: add password set API once available
    setIsSettingPassword(false);
    setPasswordData({ password: "", confirmPassword: "" });
  };

  const handleUnlinkGoogle = () => {
    // Mock API call
    console.log("Google unlinked");
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
          {isProfileLoading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Loading profile…</span>
          )}
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
  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
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
        </div>

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
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Account Information
              </h4>
              <div className="space-y-4">
                <div>
                  <Label>
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={user?.name ?? user?.email ?? ""}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Business Name & Business Email */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Business Name & Business Email
              </h4>
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

            {/* Business Phone */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Business Phone
              </h4>
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
        </div>

        {/* Sign-in Methods Section */}
  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Sign-in Methods
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Manage how you sign in to your account
          </p>

          <div className="space-y-4">
            {/* Email & Password */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
            </div>

            {/* Google */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {userInitial}
                  </span>
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
                    Sign in quickly with your Google account.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUnlinkGoogle}
                disabled={!passwordSet || !isGoogleLinked}
              >
                {isGoogleLinked ? "Unlink" : "Link not available"}
              </Button>
            </div>

            {/* Warning */}
            {!passwordSet && (
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
        </div>

        {/* Payment Account Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Payment Account
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Your configured payment receiving accounts
          </p>

          <div className="space-y-4">
            {mockPaymentAccounts.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No payment accounts connected yet. Add accounts in your payouts/settings page once the API is available.
              </p>
            )}
            {mockPaymentAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {account.bankIcon ? (
                      <Image
                        src={account.bankIcon}
                        alt={account.bankName}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                        {account.bankName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {account.bankName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          account.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {account.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {account.accountHolder} • {account.accountNumber}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/payment-providers")}
                >
                  Edit
                </Button>
              </div>
            ))}
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
