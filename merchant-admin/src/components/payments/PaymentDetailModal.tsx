"use client";
import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { CheckCircleIcon, AlertIcon, InfoIcon } from "@/icons";

interface Payment {
  id: string;
  transactionId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  paymentMethod: string;
  status: "Submitted" | "Confirmed" | "Unconfirmed";
  submittedAt: string;
  confirmedAt?: string;
  bank: string;
  receiverAccount: string;
  senderAccount: string;
  confirmationDetails?: {
    transactionExists: boolean;
    paymentSuccess: boolean;
    amountMatched: boolean;
    receiverMatched: boolean;
    source: string;
    failureReason?: string;
  };
}

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatAmount = (amount: number) => {
  return `ETB ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
}: PaymentDetailModalProps) {
  if (!payment) return null;

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge size="sm" color="success">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "Unconfirmed":
        return (
          <Badge size="sm" color="error">
            <AlertIcon className="w-3 h-3 mr-1" />
            Unconfirmed
          </Badge>
        );
      case "Submitted":
        return (
          <Badge size="sm" color="warning">
            Submitted
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] m-4">
      <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Payment Details
            </h4>
            {getStatusBadge(payment.status)}
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Transaction ID: {payment.transactionId}
          </p>
        </div>

        <div className="px-2 pb-3 space-y-6">
          {/* Basic Information */}
          <div>
            <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              Transaction Information
            </h5>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Transaction ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.transactionId}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Amount
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatAmount(payment.amount)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Payment Method
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.paymentMethod}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Bank
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.bank}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Submitted At
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatDate(payment.submittedAt)}
                </p>
              </div>
              {payment.confirmedAt && (
                <div>
                  <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                    Confirmed At
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDate(payment.confirmedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information */}
          <div>
            <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              Vendor Information
            </h5>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Vendor Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.vendor.name}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Vendor Email
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.vendor.email}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              Account Information
            </h5>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Receiver Account
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.receiverAccount}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Sender Account
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {payment.senderAccount}
                </p>
              </div>
            </div>
          </div>

          {/* System Confirmation Details */}
          {payment.confirmationDetails && (
            <div>
              <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                System Confirmation Details
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {payment.confirmationDetails.transactionExists ? (
                      <CheckCircleIcon className="w-5 h-5 text-success-500" />
                    ) : (
                      <AlertIcon className="w-5 h-5 text-error-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Transaction Exists
                    </span>
                  </div>
                  <Badge
                    size="sm"
                    color={
                      payment.confirmationDetails.transactionExists
                        ? "success"
                        : "error"
                    }
                  >
                    {payment.confirmationDetails.transactionExists
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {payment.confirmationDetails.paymentSuccess ? (
                      <CheckCircleIcon className="w-5 h-5 text-success-500" />
                    ) : (
                      <AlertIcon className="w-5 h-5 text-error-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Payment Success
                    </span>
                  </div>
                  <Badge
                    size="sm"
                    color={
                      payment.confirmationDetails.paymentSuccess
                        ? "success"
                        : "error"
                    }
                  >
                    {payment.confirmationDetails.paymentSuccess ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {payment.confirmationDetails.amountMatched ? (
                      <CheckCircleIcon className="w-5 h-5 text-success-500" />
                    ) : (
                      <AlertIcon className="w-5 h-5 text-error-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Amount Matched
                    </span>
                  </div>
                  <Badge
                    size="sm"
                    color={
                      payment.confirmationDetails.amountMatched
                        ? "success"
                        : "error"
                    }
                  >
                    {payment.confirmationDetails.amountMatched ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {payment.confirmationDetails.receiverMatched ? (
                      <CheckCircleIcon className="w-5 h-5 text-success-500" />
                    ) : (
                      <AlertIcon className="w-5 h-5 text-error-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Receiver Matched
                    </span>
                  </div>
                  <Badge
                    size="sm"
                    color={
                      payment.confirmationDetails.receiverMatched
                        ? "success"
                        : "error"
                    }
                  >
                    {payment.confirmationDetails.receiverMatched ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <InfoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmation Source
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.confirmationDetails.source}
                  </p>
                </div>

                {payment.confirmationDetails.failureReason && (
                  <div className="p-3 rounded-lg border border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertIcon className="w-5 h-5 text-error-500" />
                      <span className="text-sm font-medium text-error-700 dark:text-error-400">
                        Failure Reason
                      </span>
                    </div>
                    <p className="text-sm text-error-600 dark:text-error-400">
                      {payment.confirmationDetails.failureReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {payment.status === "Submitted" && (
            <div className="p-4 rounded-lg border border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20">
              <div className="flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                <p className="text-sm text-warning-700 dark:text-warning-400">
                  This payment is pending system confirmation. The system will
                  automatically verify the transaction against bank records.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

