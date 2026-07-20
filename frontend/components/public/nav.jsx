import Link from "next/link";
import { Store } from "lucide-react";
import { getPublicCategories } from "@/lib/api";
import { NavLinks } from "./nav-links";

export async function PublicNav() {
  let categories = [];
  try {
    categories = await getPublicCategories();
  } catch {
    categories = [];
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Store className="h-5 w-5" />
          ShopFlow
        </Link>
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          <NavLinks categories={categories} variant="desktop" />
        </nav>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
        >
          Admin
        </Link>
      </div>
      {categories.length > 0 && (
        <div className="container flex md:hidden gap-1 overflow-x-auto pb-3">
          <NavLinks categories={categories} variant="mobile" />
        </div>
      )}
    </header>
  );
}
