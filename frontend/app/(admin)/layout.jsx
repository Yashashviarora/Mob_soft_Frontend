"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoginPage && !isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoginPage, isLoading, user, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
