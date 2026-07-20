"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, LogOut, Store } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, role, logout, isSuperAdmin } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2 px-5 border-b font-semibold">
        <Store className="h-5 w-5" />
        ShopFlow Admin
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Badge variant={isSuperAdmin ? "default" : "secondary"}>
            {role?.name ?? "..."}
          </Badge>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
        <Link
          href="/"
          className="block text-center text-xs text-muted-foreground hover:underline"
        >
          View storefront
        </Link>
      </div>
    </aside>
  );
}
