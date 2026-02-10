// "use client";
// import React, { useEffect } from "react";
// import { CheckCircleIcon, AlertIcon, InfoIcon } from "@/icons";

// export type ToastType = "success" | "error" | "info" | "warning";

// interface ToastProps {
//   message: string;
//   type: ToastType;
//   isVisible: boolean;
//   onClose: () => void;
//   duration?: number;
// }

// export default function Toast({
//   message,
//   type,
//   isVisible,
//   onClose,
//   duration = 3000,
// }: ToastProps) {
//   useEffect(() => {
//     if (isVisible) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, duration);

//       return () => clearTimeout(timer);
//     }
//   }, [isVisible, duration, onClose]);

//   if (!isVisible) return null;

//   const getToastStyles = () => {
//     switch (type) {
//       case "success":
//         return "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400";
//       case "error":
//         return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
//       case "info":
//         return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
//       case "warning":
//         return "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400";
//     }
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "success":
//         return <CheckCircleIcon className="w-5 h-5" />;
//       case "error":
//         return <AlertIcon className="w-5 h-5" />;
//       case "info":
//         return <InfoIcon className="w-5 h-5" />;
//       case "warning":
//         return <AlertIcon className="w-5 h-5" />;
//     }
//   };

//   return (
//     <div className="w-full">
//       <div
//         className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${getToastStyles()}`}
//       >
//         {getIcon()}
//         <p className="text-sm font-medium flex-1">{message}</p>
//         <button
//           onClick={onClose}
//           className="text-current opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// }

