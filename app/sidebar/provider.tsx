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
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 transition-margin duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } p-4`}
      >
        {children}
      </main>
    </div>
  );
}
