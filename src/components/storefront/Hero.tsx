"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background with abstract shapes or placeholder image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40 z-10" />
        <div 
          className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 bg-cover bg-center opacity-30 md:opacity-100"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=2000&auto=format&fit=crop')" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-primary font-medium bg-primary/10 w-fit px-4 py-1.5 rounded-full"
          >
            <Star className="w-4 h-4 fill-primary" />
            <span>#1 Premium Sushi in Town</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            Experience <br className="hidden md:block" />
            <span className="text-primary italic">Authentic</span> Taste.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg"
          >
            Handcrafted rolls, fresh ingredients, and an unforgettable culinary journey delivered straight to your door in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Button size="lg" className="rounded-full text-lg h-14 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
              Order Delivery <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full text-lg h-14 px-8 hover:bg-muted transition-colors">
              View Full Menu
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.6 }}
             className="flex items-center gap-4 mt-8 pt-8 border-t border-border/50"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                  <UserAvatarFallback />
                </div>
              ))}
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-bold flex items-center gap-1">
                4.9 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </span>
              <span className="text-muted-foreground">from 2,000+ happy customers</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function UserAvatarFallback() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-muted-foreground/50 bg-secondary" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" fill="currentColor"/>
    </svg>
  );
}
