"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
}

export function FoodCard({ id, name, description, price, image, popular }: FoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted">
        {/* Placeholder for real image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        {/* Fallback pattern if no image */}
        {!image && (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent" />
        )}
        
        {popular && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-sm px-3 py-1">
            Popular
          </Badge>
        )}
      </div>

      <div className="flex flex-col flex-grow p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-xl tracking-tight line-clamp-1">{name}</h3>
          <span className="font-bold text-lg text-primary">${price.toFixed(2)}</span>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
          {description}
        </p>

        <Button 
          className="w-full rounded-xl gap-2 font-medium"
          variant="secondary"
        >
          <Plus className="w-4 h-4" />
          Add to Order
        </Button>
      </div>
    </motion.div>
  );
}
