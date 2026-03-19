"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { CartSidebar } from "./CartSidebar";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl"
          >
            M
          </motion.div>
          <span className={`font-bold text-2xl tracking-tight ${isScrolled ? "text-foreground" : "text-foreground drop-shadow-sm"}`}>
            Mero<span className="text-primary">natic</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {["Menu", "Locations", "About", "Contact"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className={`hover:text-primary transition-colors ${isScrolled ? "text-muted-foreground" : "text-foreground/90"}`}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
            <User className="w-5 h-5" />
          </Button>
          
          <CartSidebar triggerClassName="flex items-center justify-center rounded-full shadow-lg group relative overflow-hidden hidden md:flex h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <span className="relative z-10 flex items-center gap-2 font-medium text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span>Cart (3)</span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </CartSidebar>

          <Button variant="ghost" size="icon" className="md:hidden rounded-full">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
