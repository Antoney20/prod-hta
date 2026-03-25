"use client";

import React, { ReactNode } from "react";
import Navbar from "@/app/components/layouts/navbar";

export interface Tab {
  id: string;
  label: string;
  upcoming?: boolean;
}

export interface GuidanceHero {
  title: string;
  description: string;
  stats?: { label: string; value: number }[];
}

interface GuidanceLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  hero: GuidanceHero;
  children: ReactNode;
  mobileFiltersOpen?: boolean;
  onMobileFilterToggle?: (open: boolean) => void;
  filterSidebar?: ReactNode;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="text-xl font-extrabold text-gray-900">
        {value.toLocaleString()}
      </span>
      <span className="ml-1.5 text-sm text-gray-500">{label}</span>
    </div>
  );
}

function MobileFilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative ml-auto w-80 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b-2 border-gray-900">
          <h2 className="font-bold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            aria-label="Close filters"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 flex-1">{children}</div>
      </aside>
    </div>
  );
}

function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="border-b-2 border-gray-900 mb-6 -mt-0.5">
      <nav className="flex" role="tablist" aria-label="Guidance sections">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.upcoming;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              type="button"
              onClick={() => !isDisabled && onTabChange(tab.id)}
              className={`relative px-5 py-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d70b8] ${
                isActive
                  ? "bg-gray-900 text-white"
                  : isDisabled
                    ? "text-gray-400 cursor-default"
                    : "text-[#1d70b8] hover:bg-[#e8f0fb]"
              }`}
            >
              {tab.label}
              {tab.upcoming && (
                <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function GuidanceLayout({
  tabs,
  activeTab,
  onTabChange,
  hero,
  children,
  mobileFiltersOpen = false,
  onMobileFilterToggle,
  filterSidebar,
}: GuidanceLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white mt-8">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-3xl tracking-tight leading-tight mb-3">
              {hero.title}
            </h1>
            <p className="text-base text-gray-800 max-w-4xl">
              {hero.description}
            </p>

            {hero.stats && hero.stats.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                {hero.stats.map((stat, idx) => (
                  <Stat key={idx} label={stat.label} value={stat.value} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Button */}
        {filterSidebar && (
          <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => onMobileFilterToggle?.(true)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-2 border-gray-900 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d70b8]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
              Filter results
            </button>
          </div>
        )}

        {/* Mobile Filter Drawer */}
        {filterSidebar && (
          <MobileFilterDrawer
            open={mobileFiltersOpen}
            onClose={() => onMobileFilterToggle?.(false)}
          >
            {filterSidebar}
          </MobileFilterDrawer>
        )}

        {/* Main Content Area */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-10 items-start">
            {/* Desktop Sidebar */}
            {filterSidebar && (
              <aside className="hidden lg:block w-72 shrink-0 sticky top-6">
                {filterSidebar}
              </aside>
            )}

            {/* Content with Tabs */}
            <div className="flex-1 min-w-0">
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}