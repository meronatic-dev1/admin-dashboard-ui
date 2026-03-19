"use client";

import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Flame, Star, Coffee, Utensils } from "lucide-react";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Items", icon: Utensils },
  { id: "popular", label: "Popular", icon: Flame },
  { id: "premium", label: "Premium Rolls", icon: Star },
  { id: "drinks", label: "Drinks", icon: Coffee },
];

export function CategoryList() {
  const [active, setActive] = useState("all");

  return (
    <section className="py-8 bg-background border-y border-border/40 sticky top-[88px] z-40">
      <div className="container mx-auto px-4 md:px-8">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = active === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActive(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                    "border border-border/50 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transform scale-105" : "bg-card text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </section>
  );
}
