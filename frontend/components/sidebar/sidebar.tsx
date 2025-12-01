"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { useState } from "react";
import {LayoutDashboard,Users, MessageSquare, CheckSquare, Settings, Sparkles, Menu, LogOut,  ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";

function SidebarContent({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter(); // Inicializamos el router

  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Contacts",
      href: "/contacts",
      icon: Users,
      active: pathname === "/contacts",
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      active: pathname === "/messages",
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      active: pathname === "/tasks",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  // Función para cerrar sesión
  const handleLogout = () => {
    // Aquí podrías limpiar cookies o tokens si tuvieras lógica real
    console.log("Cerrando sesión..."); 
    router.push("/login"); // Redirige al login
  };

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      {/* Header with Logo */}
      <div className="flex items-center border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-purple-600">
              Startup CRM
            </h1>
            <p className="text-xs text-gray-500">
              Smart Contact Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                item.active
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
              {item.active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section CON DROPDOWN */}
      <div className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Convertimos el div en un botón interactivo */}
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between gap-3 h-auto px-2 py-3 hover:bg-gray-100 rounded-lg group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                  JD
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900">John Doe</p>
                  <p className="truncate text-xs text-gray-500 font-normal">
                    john@startup.com
                  </p>
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56" side="top" sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Botón de Log out */}
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// --- EXPORTACIÓN 1: SIDEBAR DE ESCRITORIO ---
interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200",
        className
      )}
    >
      <SidebarContent />
    </aside>
  );
}

// --- EXPORTACIÓN 2: SIDEBAR MÓVIL ---
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden bg-white shadow-sm">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="p-0 w-64 border-r">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <SidebarContent onClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}