"use client";

import { motion, Variants } from "framer-motion";
import { Clock, ShieldCheck, MapPin, Sparkles } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Clock,
      title: "Lightning Fast Delivery",
      description: "Hot and fresh to your door in under 30 minutes, guaranteed.",
    },
    {
      icon: ShieldCheck,
      title: "Premium Quality",
      description: "We source only the finest, freshest ingredients daily.",
    },
    {
      icon: MapPin,
      title: "Live Tracking",
      description: "Watch your order travel from our kitchen to your table.",
    },
    {
      icon: Sparkles,
      title: "Awarded Chefs",
      description: "Crafted by culinary experts with decades of experience.",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Why Choose Us?</h2>
          <p className="text-muted-foreground text-lg">
            We don't just deliver food; we deliver an experience. Here's what sets us apart.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center p-6 bg-background rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
