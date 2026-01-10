"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";

export default function BrandingPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#5CFFCE");
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5");
  const [displayName, setDisplayName] = useState("ephrem debebe's Business");
  const [tagline, setTagline] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PNG, JPG, or SVG file");
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Reset file input
    const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSave = () => {
    // Handle save logic
    console.log("Saving branding settings:", {
      logo: logoFile?.name,
      primaryColor,
      secondaryColor,
      displayName,
      tagline,
      showPoweredBy,
    });
    // Show success toast or notification
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Custom Branding
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize the look of your payment pages
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-purple-500 hover:bg-purple-600 text-white border-0"
        >
          Save Changes
        </Button>
      </div>

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
                    <label htmlFor="logo-upload" className="cursor-pointer inline-block w-fit">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          document.getElementById("logo-upload")?.click();
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
                      className="hidden"
                    />
                    {logoPreview && (
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
                        className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer appearance-none"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#5CFFCE"
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
                        className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer appearance-none"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#4F46E5"
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
                    placeholder="ephrem debebe's Business"
                    className="w-full"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to use your business name.
                  </p>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tagline
                  </label>
                  <Input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your tagline here"
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
    </div>
  );
}

