
"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileSidebar } from "@/components/sidebar/sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = ["/login", "/register"].includes(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null; // Evitar flash de contenido protegido
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {!isPublicRoute && <Sidebar />}
      <main className={`flex-1 overflow-y-auto ${!isPublicRoute ? "md:ml-64" : ""}`}>
        {!isPublicRoute && (
          <div className="md:hidden p-4 pb-0">
            <MobileSidebar />
          </div>
        )}
        <div className={!isPublicRoute ? "p-8" : ""}>{children}</div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <title>CRM Startup</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
          <Toaster position="top-right" closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}

