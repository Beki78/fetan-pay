import React from 'react';
import { formatCurrency } from '../lib/fetanpay';
import { PaymentResponse } from '../lib/types';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    success: boolean;
    title: string;
    message: string;
    details: PaymentResponse | null;
  } | null;
}

export default function PaymentVerificationModal({ 
  isOpen, 
  onClose, 
  result 
}: PaymentVerificationModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <ModalHeader 
            title={result.title}
            success={result.success}
            onClose={onClose}
          />

          {/* Message */}
          <ModalMessage 
            message={result.message}
            success={result.success}
          />

          {/* Verification Details */}
          {result.details && (
            <VerificationDetails details={result.details} />
          )}

          {/* Footer */}
          <ModalFooter 
            success={result.success}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// Header Component
function ModalHeader({ 
  title, 
  success, 
  onClose 
}: { 
  title: string; 
  success: boolean; 
  onClose: () => void; 
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-lg font-semibold ${success ? 'text-green-800' : 'text-red-800'}`}>
        {title}
      </h3>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Message Component
function ModalMessage({ 
  message, 
  success 
}: { 
  message: string; 
  success: boolean; 
}) {
  return (
    <div className={`p-4 rounded-lg mb-4 ${success ? 'bg-green-50' : 'bg-red-50'}`}>
      <p className={`text-sm ${success ? 'text-green-700' : 'text-red-700'}`}>
        {message}
      </p>
    </div>
  );
}

// Verification Details Component
function VerificationDetails({ details }: { details: PaymentResponse }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800">Verification Details:</h4>
      
      {/* Status */}
      <StatusSection status={details.status} />
      
      {/* Verification Checks */}
      {details.checks && (
        <VerificationChecks checks={details.checks} />
      )}

      {/* Payment Details */}
      {details.payment && (
        <PaymentDetails payment={details.payment} />
      )}
    </div>
  );
}

// Status Section Component
function StatusSection({ status }: { status: string }) {
  const isVerified = status === 'VERIFIED';
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Status:</span>
      <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
        isVerified 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    </div>
  );
}

// Verification Checks Component
function VerificationChecks({ 
  checks 
}: { 
  checks: {
    referenceFound: boolean;
    receiverMatches: boolean;
    amountMatches: boolean;
  } 
}) {
  const checkItems = [
    { label: 'Reference Found', value: checks.referenceFound },
    { label: 'Receiver Matches', value: checks.receiverMatches },
    { label: 'Amount Matches', value: checks.amountMatches }
  ];

  return (
    <div className="space-y-2">
      <h5 className="font-medium text-gray-700">Verification Checks:</h5>
      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
        {checkItems.map((item, index) => (
          <CheckItem 
            key={index}
            label={item.label}
            passed={item.value}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Check Item Component
function CheckItem({ 
  label, 
  passed 
}: { 
  label: string; 
  passed: boolean; 
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`text-sm font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
        {passed ? '✅ Yes' : '❌ No'}
      </span>
    </div>
  );
}

// Payment Details Component
function PaymentDetails({ 
  payment 
}: { 
  payment: {
    amount?: number | string;
    claimedAmount?: number | string;
    reference?: string;
    sender?: string;
    verifiedAt?: string;
  } 
}) {
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-gray-700">Payment Details:</h5>
      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
        
        {/* Amount */}
        {(payment.amount !== undefined || payment.claimedAmount !== undefined) && (
          <DetailItem 
            label="Amount"
            value={formatCurrency(
              typeof payment.claimedAmount === 'string' 
                ? parseFloat(payment.claimedAmount) 
                : typeof payment.claimedAmount === 'number'
                ? payment.claimedAmount
                : typeof payment.amount === 'string' 
                ? parseFloat(payment.amount) 
                : payment.amount || 0
            )}
            highlight
          />
        )}

        {/* Reference */}
        {payment.reference && (
          <DetailItem 
            label="Reference"
            value={payment.reference}
            mono
          />
        )}

        {/* Sender */}
        {payment.sender && (
          <DetailItem 
            label="Sender"
            value={payment.sender}
          />
        )}

        {/* Verified At */}
        {payment.verifiedAt && (
          <DetailItem 
            label="Verified At"
            value={new Date(payment.verifiedAt).toLocaleString()}
          />
        )}
      </div>
    </div>
  );
}

// Detail Item Component
function DetailItem({ 
  label, 
  value, 
  highlight = false, 
  mono = false 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean; 
  mono?: boolean; 
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`text-sm ${
        highlight ? 'font-bold text-green-600' : 
        mono ? 'font-mono text-gray-800' : 
        'text-gray-800'
      }`}>
        {value}
      </span>
    </div>
  );
}

// Footer Component
function ModalFooter({ 
  success, 
  onClose 
}: { 
  success: boolean; 
  onClose: () => void; 
}) {
  return (
    <div className="flex justify-end mt-6">
      <button
        onClick={onClose}
        className={`btn ${success ? 'btn-success' : 'btn-primary'} px-6`}
      >
        {success ? 'Great!' : 'Try Again'}
      </button>
    </div>
  );
}