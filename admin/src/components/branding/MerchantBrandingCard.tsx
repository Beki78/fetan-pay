"use client";
import React from "react";
import Image from "next/image";
import { STATIC_ASSETS_BASE_URL } from "@/lib/config";

export interface BrandingData {
  id: string | null;
  merchantId: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  displayName: string | null;
  tagline: string | null;
  showPoweredBy: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MerchantBrandingCardProps {
  branding: BrandingData;
  merchantName?: string;
}

export default function MerchantBrandingCard({ branding, merchantName }: MerchantBrandingCardProps) {
  const logoUrl = branding.logoUrl 
    ? `${STATIC_ASSETS_BASE_URL}${branding.logoUrl.startsWith('/') ? branding.logoUrl : `/${branding.logoUrl}`}`
    : null;

  const displayName = branding.displayName || merchantName || "Business Name";
  const hasCustomBranding = branding.id !== null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Merchant Branding
        </h3>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          hasCustomBranding 
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        }`}>
          {hasCustomBranding ? "Customized" : "Default"}
        </span>
      </div>

      {/* Brand Preview */}
      <div 
        className="rounded-lg p-6 mb-4 transition-colors"
        style={{ 
          background: `linear-gradient(135deg, ${branding.primaryColor}20 0%, ${branding.secondaryColor}20 100%)`,
          borderColor: branding.primaryColor + '30',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        <div className="flex items-center gap-4 mb-3">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
              <Image
                src={logoUrl}
                alt="Merchant Logo"
                width={64}
                height={64}
                className="object-contain max-w-full max-h-full"
                onError={(e) => {
                  // Hide image if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm"
              style={{ backgroundColor: branding.primaryColor }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {displayName}
            </h4>
            {branding.tagline && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {branding.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: branding.primaryColor }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {branding.primaryColor}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: branding.secondaryColor }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {branding.secondaryColor}
            </span>
          </div>
        </div>

        {/* Powered By Badge */}
        {branding.showPoweredBy && (
          <div className="mt-4 flex justify-end">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
              Powered by FetanPay
            </span>
          </div>
        )}
      </div>

      {/* Branding Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Primary Color
          </p>
          <p className="text-gray-900 dark:text-white font-mono">
            {branding.primaryColor}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Secondary Color
          </p>
          <p className="text-gray-900 dark:text-white font-mono">
            {branding.secondaryColor}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Display Name
          </p>
          <p className="text-gray-900 dark:text-white">
            {branding.displayName || "Not set"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Logo
          </p>
          <p className="text-gray-900 dark:text-white">
            {logoUrl ? "Uploaded" : "Not uploaded"}
          </p>
        </div>
        {branding.tagline && (
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Tagline
            </p>
            <p className="text-gray-900 dark:text-white">
              {branding.tagline}
            </p>
          </div>
        )}
      </div>

      {hasCustomBranding && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(branding.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
