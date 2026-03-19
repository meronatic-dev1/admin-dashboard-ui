"use client";

import Link from "next/link";
import { Home, Search, ShoppingBag, User, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { CartSidebar } from "./CartSidebar";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe pt-2 px-6 flex justify-between items-center h-[72px] transition-all">
      <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      
      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        <Search className="w-6 h-6" />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <CartSidebar triggerClassName="flex flex-col items-center gap-1 bg-primary text-primary-foreground p-3 rounded-full -mt-8 shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
        <ShoppingBag className="w-6 h-6" />
      </CartSidebar>

      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        <Heart className="w-6 h-6" />
        <span className="text-[10px] font-medium">Saved</span>
      </button>

      <Link href="/admin/login" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </div>
  );
}
