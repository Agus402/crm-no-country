import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileSidebar } from "@/components/sidebar/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Startup CRM",
  description: "Manage your contacts efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50/50`}>
        <div className="flex min-h-screen">
            <Sidebar />
          <main className="flex-1 md:ml-64 transition-all">
            <div className="md:hidden p-4 pb-0">
              <MobileSidebar />
            </div>
            {children}       
          </main>
        </div>
      </body>
    </html>
  );
}