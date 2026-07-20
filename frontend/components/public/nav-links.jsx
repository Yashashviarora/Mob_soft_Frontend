"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLinks({ categories, variant = "desktop" }) {
  const pathname = usePathname();

  return categories.map((c) => {
    const isActive = pathname === `/category/${c.id}`;
    return (
      <Link
        key={c.id}
        href={`/category/${c.id}`}
        className={
          variant === "desktop"
            ? cn(
                "px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap",
                isActive
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            : cn(
                "px-3 py-1.5 text-sm rounded-md border whitespace-nowrap",
                isActive
                  ? "bg-accent text-foreground font-semibold border-foreground/20"
                  : ""
              )
        }
      >
        {c.name}
      </Link>
    );
  });
}
