"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Image from "next/image";

// Mock data
const mockBrandingData = {
  primaryColor: "#465fff",
  secondaryColor: "#0ba5ec",
  logo: "/images/logo/logo.svg",
  qrCodeStyle: "standard",
  qrCodeColor: "#000000",
  qrCodeLogo: false,
};

export default function BrandingSettings() {
  const [branding, setBranding] = useState(mockBrandingData);
  const [logoPreview, setLogoPreview] = useState(mockBrandingData.logo);
  const [isSaving, setIsSaving] = useState(false);

  const handleColorChange = (field: "primaryColor" | "secondaryColor" | "qrCodeColor", value: string) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Mock API call
    setTimeout(() => {
      setIsSaving(false);
      console.log("Branding settings saved", branding);
    }, 1000);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
          Branding & Customization
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customize your business branding for receipts, invoices, and QR codes
        </p>
      </div>

      <div className="space-y-8">
        {/* Logo Section */}
        <div>
          <h5 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
            Business Logo
          </h5>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Business Logo"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                ) : (
                  <svg
                    className="w-16 h-16 text-gray-400"
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
            </div>
            <div className="flex-1">
              <Label>Upload Logo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Logo will appear on receipts and invoices. Recommended: 200x200px, PNG with transparent background
              </p>
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div>
          <h5 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
            Theme Colors
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                  className="h-11 w-20 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                />
                <Input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Used for buttons, links, and primary actions
              </p>
            </div>

            <div>
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                  className="h-11 w-20 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                />
                <Input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Used for accents and secondary elements
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Customization */}
        <div>
          <h5 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
            QR Code Styling
          </h5>
          <div className="space-y-4">
            <div>
              <Label>QR Code Style</Label>
              <select
                value={branding.qrCodeStyle}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, qrCodeStyle: e.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="standard">Standard</option>
                <option value="rounded">Rounded</option>
                <option value="dots">Dots</option>
              </select>
            </div>

            <div>
              <Label>QR Code Color</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={branding.qrCodeColor}
                  onChange={(e) => handleColorChange("qrCodeColor", e.target.value)}
                  className="h-11 w-20 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
                />
                <Input
                  type="text"
                  value={branding.qrCodeColor}
                  onChange={(e) => handleColorChange("qrCodeColor", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="qrLogo"
                checked={branding.qrCodeLogo}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, qrCodeLogo: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <Label htmlFor="qrLogo" className="mb-0 cursor-pointer">
                Add logo overlay to QR codes
              </Label>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <h5 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
            Preview
          </h5>
          <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-4 mb-4">
              {logoPreview && (
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Receipt Preview
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This is how your branding will appear
                </p>
              </div>
            </div>
            <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center">
              <div
                className="h-24 w-24 rounded border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: branding.primaryColor }}
              >
                <span className="text-xs text-gray-400">QR Code</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Branding Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

