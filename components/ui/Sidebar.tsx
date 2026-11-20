"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { RoleBadge } from "./RoleBadge";
import {
  FileCheck2,
  LayoutDashboard,
  Users,
  CheckSquare,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  };
  pendingReviewsCount?: number;
}

export function Sidebar({ user, pendingReviewsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      setSigningOut(false);
    }
  };

  const navLinks: Record<
    UserRole,
    Array<{
      href: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number;
    }>
  > = {
    admin: [
      {
        href: "/admin",
        label: "System Overview",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/users",
        label: "Users & Roles",
        icon: Users,
      },
    ],
    manager: [
      {
        href: "/manager",
        label: "Assigned Tasks",
        icon: CheckSquare,
        badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      },
      {
        href: "/manager/tasks/new",
        label: "Create Task",
        icon: PlusCircle,
      },
    ],
    employee: [
      {
        href: "/employee",
        label: "My Tasks",
        icon: CheckSquare,
      },
    ],
  };

  const links = navLinks[user.role] || [];
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href={`/${user.role}`} className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">TaskFlow</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar (Desktop fixed + Mobile drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/90 shadow-sm transition-all duration-300 ease-in-out md:static",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link
            href={`/${user.role}`}
            className={cn(
              "flex items-center space-x-3 overflow-hidden transition-all",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0 transition-transform hover:scale-105">
              <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base tracking-tight leading-tight">
                  TaskFlow
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">
                  {user.role} workspace
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Menu
                </span>
              </div>
            )}

            <nav className="space-y-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== `/${user.role}` &&
                    pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? link.label : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-indigo-50/80 text-indigo-600 font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                    )}

                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-slate-700",
                        !collapsed && "mr-3"
                      )}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1">{link.label}</span>
                    )}

                    {link.badge !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center text-xs font-bold rounded-full bg-amber-500 text-white flex-shrink-0 shadow-xs",
                          collapsed
                            ? "absolute top-1.5 right-1.5 w-2 h-2 p-0"
                            : "px-2 py-0.5 ml-2"
                        )}
                      >
                        {!collapsed && link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick System Badge / Status */}
          {!collapsed && (
            <div className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Cloud Sync</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Real-time RLS state enforcement
              </p>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div
            className={cn(
              "flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs",
              collapsed && "justify-center p-1.5"
            )}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.full_name || "User"}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign Out"
              className="mt-2 w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
