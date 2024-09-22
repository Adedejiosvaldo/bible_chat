"use client";

import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen">
      {/* Overlay for mobile view */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleSidebar();
            }
          }}
          aria-label="Close sidebar overlay"
        />
      )}

      <main
        className={`flex-1 transition-margin duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64 md:ml-0 sm:ml-0" : "ml-0"
        } p-4`}
      >
        {children}
      </main>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}
