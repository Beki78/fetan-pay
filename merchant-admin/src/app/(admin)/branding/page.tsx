"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import MerchantApprovalStatus from "@/components/common/MerchantApprovalStatus";
import { useSession } from "@/hooks/useSession";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { useSubscription } from "@/hooks/useSubscription";
import {
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useDeleteBrandingMutation,
} from "@/lib/services/brandingServiceApi";
import { useToast } from "@/components/ui/toast/useToast";
import { Modal } from "@/components/ui/modal";
import { Trash2, Plus, Edit2, Lock } from "lucide-react";
import { STATIC_ASSETS_BASE_URL } from "@/lib/config";

export default function BrandingPage() {
  // All hooks must be called at the top level, before any early returns
  const { status: accountStatus, isLoading: isStatusLoading } = useAccountStatus();
  const { user } = useSession();
  const { showToast, ToastComponent } = useToast();
  const { canAccessFeature, plan, subscription } = useSubscription();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#5CFFCE");
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Check if user has access to custom branding
  const hasCustomBrandingAccess = canAccessFeature('customBranding');

  // Get merchantId from session or localStorage
  const merchantId = (() => {
    const meta = (user as any)?.metadata;
    if (meta?.merchantId) return meta.merchantId as string;
    if (meta?.merchant?.id) return meta.merchant.id as string;
    if ((user as any)?.merchantId) return (user as any).merchantId as string;
    if ((user as any)?.merchant?.id) return (user as any).merchant.id as string;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("merchantId");
      if (stored) return stored;
    }
    return null;
  })();

  // Fetch existing branding - must be called before early returns
  const {
    data: brandingData,
    isLoading: isLoadingBranding,
    refetch: refetchBranding,
  } = useGetBrandingQuery(merchantId ?? "", {
    skip: !merchantId,
  });

  // Update mutation - must be called before early returns
  const [updateBranding, { isLoading: isSaving }] = useUpdateBrandingMutation();
  const [deleteBranding, { isLoading: isDeleting }] = useDeleteBrandingMutation();

  // Check if branding exists (has an ID)
  const hasBranding = brandingData?.id !== null && brandingData?.id !== undefined;

  // Load branding data into form - must be called before early returns
  useEffect(() => {
    if (brandingData && hasBranding) {
      setPrimaryColor(brandingData.primaryColor || "#5CFFCE");
      setSecondaryColor(brandingData.secondaryColor || "#4F46E5");
      setDisplayName(brandingData.displayName || "");
      setTagline(brandingData.tagline || "");
      setShowPoweredBy(brandingData.showPoweredBy ?? true);

      // Load logo preview if exists
      if (brandingData.logoUrl) {
        // Ensure logoUrl starts with / for proper path construction
        const logoPath = brandingData.logoUrl.startsWith('/')
          ? brandingData.logoUrl
          : `/${brandingData.logoUrl}`;
        setLogoPreview(`${STATIC_ASSETS_BASE_URL}${logoPath}`);
      } else {
        setLogoPreview(null);
      }
    } else {
      // Reset to defaults for create mode
      setPrimaryColor("#5CFFCE");
      setSecondaryColor("#4F46E5");
      setDisplayName("");
      setTagline("");
      setShowPoweredBy(true);
      setLogoPreview(null);
      setLogoFile(null);
    }
  }, [brandingData, hasBranding]);

  // Show loading spinner while checking account status
  if (isStatusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show approval status if merchant is not approved
  if (accountStatus === "pending") {
    return <MerchantApprovalStatus />;
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        showToast("File size must be less than 2MB", "error");
        setIsUploadingLogo(false);
        return;
      }

      // Validate file type
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        showToast("Please upload a PNG, JPG, or SVG file", "error");
        setIsUploadingLogo(false);
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setIsUploadingLogo(false);
        showToast("Logo loaded successfully", "success");
      };
      reader.onerror = () => {
        showToast("Error reading file. Please try again.", "error");
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Reset file input
    const fileInput = document.getElementById(
      "logo-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSave = async () => {
    if (!merchantId) {
      showToast("Merchant ID not found. Please refresh the page.", "error");
      return;
    }

    try {
      setIsUploadingLogo(true);
      await updateBranding({
        merchantId,
        primaryColor,
        secondaryColor,
        displayName: displayName || undefined,
        tagline: tagline || undefined,
        showPoweredBy,
        logo: logoFile || undefined,
      }).unwrap();

      showToast(
        hasBranding
          ? "Branding settings updated successfully!"
          : "Branding settings created successfully!",
        "success",
      );
      setLogoFile(null); // Clear file after successful save
      await refetchBranding(); // Refresh to get the new branding data
    } catch (error: any) {
      showToast(
        error?.data?.message ||
          error?.message ||
          "Failed to save branding settings",
        "error",
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!merchantId) {
      showToast("Merchant ID not found. Please refresh the page.", "error");
      return;
    }

    try {
      await deleteBranding(merchantId).unwrap();
      showToast("Branding deleted successfully!", "success");
      setIsDeleteModalOpen(false);
      // Reset form to defaults
      setPrimaryColor("#5CFFCE");
      setSecondaryColor("#4F46E5");
      setDisplayName("");
      setTagline("");
      setShowPoweredBy(true);
      setLogoPreview(null);
      setLogoFile(null);
      await refetchBranding();
    } catch (error: any) {
      showToast(
        error?.data?.message ||
          error?.message ||
          "Failed to delete branding settings",
        "error",
      );
    }
  };

  if (isLoadingBranding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading branding settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastComponent />
      
      {/* Subscription Protection Banner */}
      {!hasCustomBrandingAccess && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Custom Branding Not Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Custom branding is not included in your current <strong>{plan?.name || 'Free'}</strong> plan. 
                Upgrade to unlock logo customization, color themes, and remove the "Powered by FetanPay" branding.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/billing'}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Upgrade Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/billing'}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Custom Branding
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasBranding
              ? "Manage your payment page branding"
              : "Create branding for your payment pages"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasBranding && hasCustomBrandingAccess && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            size="sm"
            onClick={hasCustomBrandingAccess ? handleSave : () => showToast({
              type: 'warning',
              message: 'Please upgrade your plan to access custom branding',
              duration: 4000,
            })}
            disabled={isSaving || !hasCustomBrandingAccess}
            className="bg-purple-500 hover:bg-purple-600 text-white border-0 disabled:opacity-50"
          >
            {hasBranding ? (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                {isSaving ? "Updating..." : "Update"}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {isSaving ? "Creating..." : "Create Branding"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Show existing branding info if it exists */}
      {hasBranding && brandingData && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Branding Active
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your branding is currently active. You can edit the settings
                below or delete to start fresh.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show empty state if no branding */}
      {!hasBranding && !isLoadingBranding && (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No Branding Configured
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create custom branding for your payment pages. Add your logo,
              choose colors, and customize the appearance to match your brand.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Branding Settings */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Branding Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your payment page appearance
              </p>
            </div>

            {/* Logo Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-3">
                Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-block w-fit"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        disabled={!hasCustomBrandingAccess}
                        onClick={() => {
                          if (hasCustomBrandingAccess) {
                            document.getElementById("logo-upload")?.click();
                          } else {
                            showToast({
                              type: 'warning',
                              message: 'Please upgrade your plan to access custom branding',
                              duration: 4000,
                            });
                          }
                        }}
                      >
                        Upload Logo
                      </Button>
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={!hasCustomBrandingAccess}
                      className="hidden"
                    />
                    {isUploadingLogo && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
                    {logoPreview && !isUploadingLogo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveLogo}
                        className="w-fit text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    PNG, JPG or SVG. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Colors Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-3">
                Brand Colors
              </label>
              <div className="space-y-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        disabled={!hasCustomBrandingAccess}
                        className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#5CFFCE"
                      disabled={!hasCustomBrandingAccess}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        disabled={!hasCustomBrandingAccess}
                        className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#4F46E5"
                      disabled={!hasCustomBrandingAccess}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Display Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-3">
                Business Display
              </label>
              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Business Name"
                    disabled={!hasCustomBrandingAccess}
                    className="w-full"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to use your business name.
                  </p>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tagline <span className="text-gray-400">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your tagline here"
                    disabled={!hasCustomBrandingAccess}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-white mb-3">
                Options
              </label>
              <Checkbox
                checked={showPoweredBy}
                onChange={setShowPoweredBy}
                disabled={!hasCustomBrandingAccess}
                label="Show 'Powered by FetanPay' badge"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Live Preview
              </h2>
            </div>

            {/* Preview Card */}
            <div
              className="rounded-xl overflow-hidden shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {/* Card Content */}
              <div className="p-8 text-white">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  {logoPreview ? (
                    <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30 shadow-lg">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-black/30 flex items-center justify-center border border-white/30 shadow-lg">
                      <span className="text-2xl font-bold text-white">R</span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className="text-sm text-white/90 mb-2">Amount to Pay</p>
                  <h3 className="text-4xl font-bold mb-6">1,000 ETB</h3>
                </div>
              </div>

              {/* Footer */}
              {showPoweredBy && (
                <div className="bg-gray-900/40 backdrop-blur-sm px-6 py-4 border-t border-white/20">
                  <p className="text-xs text-white/90 text-center font-medium">
                    Powered by FetanPay
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Delete Branding
              </h4>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete your branding settings? This will
            remove your custom logo, colors, and display settings. This action
            cannot be undone.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
