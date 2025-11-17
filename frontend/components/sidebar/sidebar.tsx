"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CheckSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200",
        className
      )}
    >
      <div className="flex h-full flex-col">
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

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-lg px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="truncate text-xs text-gray-500">
                john@startup.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

