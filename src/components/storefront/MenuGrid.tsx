"use client";

import { motion } from "framer-motion";
import { FoodCard } from "./FoodCard";

export function MenuGrid() {
  const menuItems = [
    {
      id: "1",
      name: "Dragon Ninja Roll",
      description: "Eel, cucumber, and crab meat topped with avocado and sweet eel sauce.",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=600&auto=format&fit=crop",
      popular: true,
    },
    {
      id: "2",
      name: "Spicy Tuna Volcano",
      description: "Crispy rice base topped with spicy tuna, jalapeños, and spicy mayo.",
      price: 16.50,
      image: "https://images.unsplash.com/photo-1617254559288-ce9119159938?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Wagyu Beef Sushi",
      description: "A5 Japanese Wagyu lightly seared, truffle oil, and smoked sea salt.",
      price: 24.00,
      image: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?q=80&w=600&auto=format&fit=crop",
      popular: true,
    },
    {
      id: "4",
      name: "Rainbow Crunch",
      description: "Assorted sashimi draped over a crispy tempura shrimp roll.",
      price: 21.00,
      image: "https://images.unsplash.com/photo-1583623025817-d180a2221dce?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "5",
      name: "Matcha Mochi",
      description: "Sweet rice cake filled with premium green tea ice cream.",
      price: 8.50,
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "6",
      name: "Yuzu Lemonade",
      description: "Refreshing sparkling craft lemonade infused with Japanese Yuzu.",
      price: 6.00,
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop",
    },
  ];

  return (
    <section id="menu" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Our Menu</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Curated by master chefs using the freshest ingredients. Explore our signature dishes and find your new favorite.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <FoodCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
