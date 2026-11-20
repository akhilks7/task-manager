"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RoleBadge } from "./RoleBadge";
import { UserRole } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import {
  CheckSquare,
  LogOut,
  Users,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  FileCheck2,
} from "lucide-react";

interface NavbarProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  };
  pendingReviewsCount?: number;
}

export function Navbar({ user, pendingReviewsCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    Array<{ href: string; label: string; icon: React.ReactNode; badge?: number }>
  > = {
    admin: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
      },
      {
        href: "/admin/users",
        label: "Users & Roles",
        icon: <Users className="w-4 h-4 mr-2" />,
      },
    ],
    manager: [
      {
        href: "/manager",
        label: "My Tasks",
        icon: <CheckSquare className="w-4 h-4 mr-2" />,
        badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      },
      {
        href: "/manager/tasks/new",
        label: "Create Task",
        icon: <PlusCircle className="w-4 h-4 mr-2" />,
      },
    ],
    employee: [
      {
        href: "/employee",
        label: "My Assigned Tasks",
        icon: <CheckSquare className="w-4 h-4 mr-2" />,
      },
    ],
  };

  const links = navLinks[user.role] || [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Links */}
          <div className="flex items-center space-x-8">
            <Link
              href={`/${user.role}`}
              className="flex items-center space-x-2 text-slate-900 font-bold text-lg hover:opacity-90"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="tracking-tight">TaskFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== `/${user.role}` && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                    {typeof link.badge === "number" && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: User & Sign Out */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-sm font-medium text-slate-800">
                  {user.full_name}
                </span>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <RoleBadge role={user.role} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <div className="pb-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span className="flex items-center">
                {link.icon}
                {link.label}
              </span>
              {typeof link.badge === "number" && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center px-3 py-2 mt-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      )}
    </header>
  );
}
