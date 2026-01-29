"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { useSidebar } from "../context/SidebarContext";
import { PendingApprovalBanner } from "@/components/common/AccountStatus";
import { useGetUnreadCountQuery } from "@/lib/services/notificationsServiceApi";
import {
  BoltIcon,
  ChevronDownIcon,
  DollarLineIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PaperPlaneIcon,
  PieChartIcon,
  PlugInIcon,
  ShootingStarIcon,
  TaskIcon,
  DocsIcon,
  BellIcon,
  NotificationBellIcon,
} from "../icons/index";

// Custom icon components for better representation
const NotificationMenuItem = ({ isExpanded, isHovered, isMobileOpen, pathname }: { 
  isExpanded: boolean; 
  isHovered: boolean; 
  isMobileOpen: boolean; 
  pathname: string; 
}) => {
  const { data: unreadCountData } = useGetUnreadCountQuery();
  const unreadCount = unreadCountData?.count || 0;
  const isActive = pathname === '/notifications';

  return (
    <Link
      href="/notifications"
      className={`menu-item group ${
        isActive ? "menu-item-active" : "menu-item-inactive"
      }`}
    >
      <span
        className={`relative ${
          isActive
            ? "menu-item-icon-active"
            : "menu-item-icon-inactive"
        }`}
      >
        <NotificationBellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-4 text-[10px] font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </span>
      {(isExpanded || isHovered || isMobileOpen) && (
        <span className={`menu-item-text flex items-center justify-between w-full`}>
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-5 text-[10px] font-medium ml-auto">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      )}
    </Link>
  );
};

const CreditCardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_4360)">
      <path d="M17.4999 17.8301H15.6499C15.2399 17.8301 14.8999 17.4901 14.8999 17.0801C14.8999 16.6701 15.2399 16.3301 15.6499 16.3301H17.4999C17.9099 16.3301 18.2499 16.6701 18.2499 17.0801C18.2499 17.4901 17.9099 17.8301 17.4999 17.8301Z" fill="currentColor" />
      <path d="M12.97 17.8301H6.5C6.09 17.8301 5.75 17.4901 5.75 17.0801C5.75 16.6701 6.09 16.3301 6.5 16.3301H12.97C13.38 16.3301 13.72 16.6701 13.72 17.0801C13.72 17.4901 13.39 17.8301 12.97 17.8301Z" fill="currentColor" />
      <path d="M17.5002 14.0703H11.9702C11.5602 14.0703 11.2202 13.7303 11.2202 13.3203C11.2202 12.9103 11.5602 12.5703 11.9702 12.5703H17.5002C17.9102 12.5703 18.2502 12.9103 18.2502 13.3203C18.2502 13.7303 17.9102 14.0703 17.5002 14.0703Z" fill="currentColor" />
      <path d="M9.27 14.0703H6.5C6.09 14.0703 5.75 13.7303 5.75 13.3203C5.75 12.9103 6.09 12.5703 6.5 12.5703H9.27C9.68 12.5703 10.02 12.9103 10.02 13.3203C10.02 13.7303 9.68 14.0703 9.27 14.0703Z" fill="currentColor" />
      <path opacity="0.4" d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_4418_4360">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const ReceiptIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_169722)">
      <path d="M15.78 2H8.22C4.44 2 3.5 3.01 3.5 7.04V18.3C3.5 20.96 4.96 21.59 6.73 19.69L6.74 19.68C7.56 18.81 8.81 18.88 9.52 19.83L10.53 21.18C11.34 22.25 12.65 22.25 13.46 21.18L14.47 19.83C15.19 18.87 16.44 18.8 17.26 19.68C19.04 21.58 20.49 20.95 20.49 18.29V7.04C20.5 3.01 19.56 2 15.78 2ZM14.75 10.75H9.25C8.84 10.75 8.5 10.41 8.5 10C8.5 9.59 8.84 9.25 9.25 9.25H14.75C15.16 9.25 15.5 9.59 15.5 10C15.5 10.41 15.16 10.75 14.75 10.75Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_4418_169722">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const PaintBrushIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BankIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_8873)">
      <path d="M22 19V22H2V19C2 18.45 2.45 18 3 18H21C21.55 18 22 18.45 22 19Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11H5V18H7V11Z" fill="currentColor" />
      <path d="M11 11H9V18H11V11Z" fill="currentColor" />
      <path d="M15 11H13V18H15V11Z" fill="currentColor" />
      <path d="M19 11H17V18H19V11Z" fill="currentColor" />
      <path d="M23 22.75H1C0.59 22.75 0.25 22.41 0.25 22C0.25 21.59 0.59 21.25 1 21.25H23C23.41 21.25 23.75 21.59 23.75 22C23.75 22.41 23.41 22.75 23 22.75Z" fill="currentColor" />
      <path d="M21.37 5.74984L12.37 2.14984C12.17 2.06984 11.83 2.06984 11.63 2.14984L2.63 5.74984C2.28 5.88984 2 6.29984 2 6.67984V9.99984C2 10.5498 2.45 10.9998 3 10.9998H21C21.55 10.9998 22 10.5498 22 9.99984V6.67984C22 6.29984 21.72 5.88984 21.37 5.74984ZM12 8.49984C11.17 8.49984 10.5 7.82984 10.5 6.99984C10.5 6.16984 11.17 5.49984 12 5.49984C12.83 5.49984 13.5 6.16984 13.5 6.99984C13.5 7.82984 12.83 8.49984 12 8.49984Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_4418_8873">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_169713)">
      <path d="M14.85 3.9498V7.7498H13.35V3.9498C13.35 3.6798 13.11 3.5498 12.95 3.5498C12.9 3.5498 12.85 3.5598 12.8 3.5798L4.87 6.56981C4.34 6.7698 4 7.2698 4 7.8398V8.5098C3.09 9.1898 2.5 10.2798 2.5 11.5098V7.8398C2.5 6.6498 3.23 5.5898 4.34 5.1698L12.28 2.1698C12.5 2.0898 12.73 2.0498 12.95 2.0498C13.95 2.0498 14.85 2.8598 14.85 3.9498Z" fill="currentColor" />
      <path d="M21.4999 14.5V15.5C21.4999 15.77 21.2899 15.99 21.0099 16H19.5499C19.0199 16 18.5399 15.61 18.4999 15.09C18.4699 14.78 18.5899 14.49 18.7899 14.29C18.9699 14.1 19.2199 14 19.4899 14H20.9999C21.2899 14.01 21.4999 14.23 21.4999 14.5Z" fill="currentColor" />
      <path d="M5 15C4.06 15 3.19 15.33 2.5 15.88C1.58 16.61 1 17.74 1 19C1 19.75 1.21 20.46 1.58 21.06C2.27 22.22 3.54 23 5 23C6.01 23 6.93 22.63 7.63 22C7.94 21.74 8.21 21.42 8.42 21.06C8.79 20.46 9 19.75 9 19C9 16.79 7.21 15 5 15ZM3.42 18.46C3.13 18.17 3.13 17.69 3.42 17.4C3.72 17.11 4.19 17.11 4.49 17.4L5.01 17.93L5.51 17.42C5.81 17.13 6.28 17.13 6.58 17.42C6.87 17.72 6.87 18.19 6.58 18.49L6.07 18.99L6.6 19.51C6.89 19.81 6.89 20.28 6.6 20.58C6.45 20.72 6.26 20.79 6.07 20.79C5.88 20.79 5.69 20.72 5.54 20.58L5.01 20.05L4.46 20.6C4.31 20.75 4.12 20.82 3.93 20.82C3.74 20.82 3.55 20.75 3.4 20.6C3.11 20.31 3.11 19.83 3.4 19.54L3.95 18.99L3.42 18.46Z" fill="currentColor" />
      <path d="M19.48 12.95H20.5C21.05 12.95 21.5 12.5 21.5 11.95V11.51C21.5 9.44 19.81 7.75 17.74 7.75H6.26C5.41 7.75 4.63 8.03 4 8.51C3.09 9.19 2.5 10.28 2.5 11.51V13.29C2.5 13.67 2.9 13.91 3.26 13.79C3.82 13.6 4.41 13.5 5 13.5C8.03 13.5 10.5 15.97 10.5 19C10.5 19.72 10.31 20.51 10.01 21.21C9.85 21.57 10.1 22 10.49 22H17.74C19.81 22 21.5 20.31 21.5 18.24V18.05C21.5 17.5 21.05 17.05 20.5 17.05H19.63C18.67 17.05 17.75 16.46 17.5 15.53C17.3 14.77 17.54 14.03 18.04 13.55C18.41 13.17 18.92 12.95 19.48 12.95ZM14 12.75H9C8.59 12.75 8.25 12.41 8.25 12C8.25 11.59 8.59 11.25 9 11.25H14C14.41 11.25 14.75 11.59 14.75 12C14.75 12.41 14.41 12.75 14 12.75Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_4418_169713">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3111_32748)">
      <path d="M11.4599 13.7303C13.0118 13.7303 14.2699 12.4723 14.2699 10.9203C14.2699 9.36843 13.0118 8.11035 11.4599 8.11035C9.90798 8.11035 8.6499 9.36843 8.6499 10.9203C8.6499 12.4723 9.90798 13.7303 11.4599 13.7303Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.65 20.2007C16.65 17.8707 14.33 15.9707 11.46 15.9707C8.59002 15.9707 6.27002 17.8607 6.27002 20.2007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12.5C21 17.75 16.75 22 11.5 22C6.25 22 2 17.75 2 12.5C2 7.25 6.25 3 11.5 3C12.81 3 14.06 3.25999 15.2 3.73999C15.07 4.13999 15 4.56 15 5C15 5.75 15.21 6.46 15.58 7.06C15.78 7.4 16.04 7.70997 16.34 7.96997C17.04 8.60997 17.97 9 19 9C19.44 9 19.86 8.92998 20.25 8.78998C20.73 9.92998 21 11.19 21 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 5C23 5.32 22.96 5.62999 22.88 5.92999C22.79 6.32999 22.63 6.72 22.42 7.06C21.94 7.87 21.17 8.49998 20.25 8.78998C19.86 8.92998 19.44 9 19 9C17.97 9 17.04 8.60997 16.34 7.96997C16.04 7.70997 15.78 7.4 15.58 7.06C15.21 6.46 15 5.75 15 5C15 4.56 15.07 4.13999 15.2 3.73999C15.39 3.15999 15.71 2.64002 16.13 2.21002C16.86 1.46002 17.88 1 19 1C20.18 1 21.25 1.51002 21.97 2.33002C22.61 3.04002 23 3.98 23 5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.4898 4.97949H17.5098" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 3.51953V6.50952" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_3111_32748">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  external?: boolean; // Flag to indicate external links
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// MAIN section items
const mainItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <ReceiptIcon />,
    name: "Transactions",
    path: "/payments",
  },
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    path: "/analytics",
  },
  {
    icon: <WalletIcon />,
    name: "Wallet",
    path: "/wallet",
  },
  {
    icon: <CreditCardIcon />,
    name: "Subscription",
    path: "/billing",
  },
  {
    icon: <UsersIcon />,
    name: "Users",
    path: "/users",
  },
  {
    icon: <NotificationBellIcon />,
    name: "Notifications",
    path: "/notifications",
  },
];

// CONFIGURATION section items
const configurationItems: NavItem[] = [
  {
    icon: <BankIcon />,
    name: "Payment Providers",
    path: "/payment-providers",
  },
  {
    icon: <PaintBrushIcon />,
    name: "Branding",
    path: "/branding",
  },
  {
    icon: <BoltIcon />,
    name: "API Keys",
    path: "/api-keys",
  },
  {
    icon: <PaperPlaneIcon />,
    name: "Webhooks",
    path: "/webhooks",
  },
];

// Custom API Docs Icon
const ApiDocsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_8491)">
      <path d="M15.7999 2.21048C15.3899 1.80048 14.6799 2.08048 14.6799 2.65048V6.14048C14.6799 7.60048 15.9199 8.81048 17.4299 8.81048C18.3799 8.82048 19.6999 8.82048 20.8299 8.82048C21.3999 8.82048 21.6999 8.15048 21.2999 7.75048C19.8599 6.30048 17.2799 3.69048 15.7999 2.21048Z" fill="currentColor" />
      <path d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19ZM11.5 17.75H7.5C7.09 17.75 6.75 17.41 6.75 17C6.75 16.59 7.09 16.25 7.5 16.25H11.5C11.91 16.25 12.25 16.59 12.25 17C12.25 17.41 11.91 17.75 11.5 17.75ZM13.5 13.75H7.5C7.09 13.75 6.75 13.41 6.75 13C6.75 12.59 7.09 12.25 7.5 12.25H13.5C13.91 12.25 14.25 12.59 14.25 13C14.25 13.41 13.91 13.75 13.5 13.75Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_4418_8491">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// RESOURCES section items
const resourcesItems: NavItem[] = [
  {
    icon: <ApiDocsIcon />,
    name: "API Docs",
    path: "https://docs.fetanpay.et/",
    external: true,
  },
  {
    icon: <SettingsIcon />,
    name: "Settings",
    path: "/profile",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const { status: accountStatus, isStatusConfirmed } = useAccountStatus();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "configuration" | "resources"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              nav.external ? (
                <a
                  href={nav.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`menu-item group menu-item-inactive`}
                >
                  <span className="menu-item-icon-inactive">
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </a>
              ) : nav.name === "Notifications" ? (
                <NotificationMenuItem 
                  isExpanded={isExpanded} 
                  isHovered={isHovered} 
                  isMobileOpen={isMobileOpen} 
                  pathname={pathname} 
                />
              ) : (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "configuration" | "resources";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "configuration", "resources"].forEach((menuType) => {
      const items =
        menuType === "main"
          ? mainItems
          : menuType === "configuration"
          ? configurationItems
          : resourcesItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "configuration" | "resources",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "configuration" | "resources") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex items-center gap-2 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
              <Image
            src="/images/logo/fetan-logo.png"
            alt="Fetan Logo"
            width={isExpanded || isHovered || isMobileOpen ? 32 : 24}
            height={isExpanded || isHovered || isMobileOpen ? 32 : 24}
            className="object-contain"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              Fetan Pay
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {/* Pending approval banner (only when account is pending and status is confirmed) */}
        {isStatusConfirmed && <PendingApprovalBanner status={accountStatus} />}
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* MAIN Section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase font-semibold flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "MAIN"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(mainItems, "main")}
            </div>

            {/* CONFIGURATION Section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase font-semibold flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "CONFIGURATION"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(configurationItems, "configuration")}
            </div>

            {/* RESOURCES Section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase font-semibold flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "RESOURCES"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(resourcesItems, "resources")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
