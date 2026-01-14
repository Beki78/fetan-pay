"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useGetQRCodeQuery } from "@/lib/services/merchantUsersServiceApi";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  merchantId,
  userId,
  userName,
  userEmail,
}: QRCodeModalProps) {
  const { data, isLoading, error, refetch } = useGetQRCodeQuery(
    { merchantId, userId },
    { skip: !isOpen || !merchantId || !userId }
  );

  const handleDownload = () => {
    if (!data?.qrCodeImage) return;

    const link = document.createElement("a");
    link.href = data.qrCodeImage;
    link.download = `qr-code-${userEmail || userId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[500px] p-6 lg:p-8"
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 mb-2">
            QR Code Login
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Scan this QR code with the merchant app to auto-fill login credentials.
            {userName && (
              <span className="block mt-1">
                For: <strong>{userName}</strong> ({userEmail})
              </span>
            )}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to generate QR code. Please try again.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={data.qrCodeImage}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Security Note:</strong> This QR code can only be scanned from the authorized merchant application. 
                It will expire after 30 days or can be regenerated at any time.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                Download QR Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

