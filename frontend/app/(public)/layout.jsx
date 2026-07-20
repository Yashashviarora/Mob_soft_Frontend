import { PublicNav } from "@/components/public/nav";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 container py-8">{children}</main>
      <footer className="border-t py-6">
        <div className="container text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
