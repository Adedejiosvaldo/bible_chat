import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { SessionProvider } from "next-auth/react";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import AuthProvider from "./auth/Provider";
import Sidebar from "@/components/sidebar";
import LayoutWrapper from "./sidebar/provider";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <AuthProvider>
            <div className="relative flex flex-col h-screen">
              <Navbar />
              {/* <div className="flex min-h-screen">
                {/* <Sidebar />
                <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                  {children}
                </main> */}
              {/* </div> */}
              {/*
              <div className="flex min-h-screen">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main
                  className={`flex-1 transition-margin duration-300 ease-in-out ${
                    isSidebarOpen ? "ml-64" : "ml-0"
                  } p-4`}
                >
                  {children}
                </main>
              </div> */}

              <LayoutWrapper>{children}</LayoutWrapper>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
