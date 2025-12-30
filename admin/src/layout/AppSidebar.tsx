"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { PendingApprovalBanner } from "@/components/common/AccountStatus";
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
} from "../icons/index";

// Custom icon components for better representation
const CreditCardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const ReceiptIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
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

// RESOURCES section items
const resourcesItems: NavItem[] = [
  {
    icon: <DocsIcon />,
    name: "API Docs",
    path: "/api-keys?tab=docs",
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

  // TODO: Replace this with real account status from API / context
  const accountStatus: "pending" | "active" = "pending";

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
                <span
                  className={`ml-auto w-5 h-5 transition-transform duration-200 flex items-center justify-center ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                >
                  <ChevronDownIcon />
                </span>
              )}
            </button>
          ) : (
            nav.path && (
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
        {/* Pending approval banner (only when account is pending) */}
        <PendingApprovalBanner status={accountStatus} />
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
