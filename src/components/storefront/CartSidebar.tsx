"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Trash2, ArrowRight, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

export function CartSidebar({ children, triggerClassName }: { children: React.ReactNode, triggerClassName?: string }) {
  // Placeholder cart items
  const cartItems = [
    { id: 1, name: "Dragon Ninja Roll", description: "Eel & avocado", price: 18.99, quantity: 1, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=200&auto=format&fit=crop" },
    { id: 2, name: "Yuzu Lemonade", description: "Sparkling craft", price: 6.00, quantity: 2, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=200&auto=format&fit=crop" },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger className={triggerClassName}>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background/95 backdrop-blur-2xl border-l-border/30 p-0 shadow-2xl">
        <SheetHeader className="px-6 pt-8 pb-4 border-b border-border/40 bg-muted/20">
          <SheetTitle className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Your Order
          </SheetTitle>
          <p className="text-sm text-muted-foreground font-medium">Review your premium selections</p>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto pt-4 pb-8 px-6">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    className="flex gap-4 items-center p-3 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-muted relative overflow-hidden flex-shrink-0 shadow-inner">
                      <div 
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-bold text-base truncate text-foreground">{item.name}</h4>
                      <p className="text-muted-foreground text-xs font-medium mb-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full py-1 gap-3">
                      <span className="font-bold text-lg tracking-tight">${(item.price * item.quantity).toFixed(2)}</span>
                      <button className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary opacity-50" />
              </div>
              <p className="text-lg font-medium">Your cart is perfectly empty.</p>
              <Button variant="outline" className="rounded-full px-8">Browse Menu</Button>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 bg-card border-t border-border/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground font-medium">
                <span>Delivery Fee</span>
                <span className="text-primary font-bold">Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center text-xl">
                <span className="font-extrabold text-foreground">Total</span>
                <span className="font-extrabold text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform bg-gradient-to-r from-primary to-primary/80 flex items-center justify-between px-6">
              <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
