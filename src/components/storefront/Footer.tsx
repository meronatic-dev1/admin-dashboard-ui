"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 py-16 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <span className="font-bold text-3xl tracking-tight text-white flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">M</div>
              Mero<span className="text-primary">natic</span>
            </span>
            <p className="text-zinc-400 max-w-sm">
              Delivering an unparalleled culinary experience to your door. Freshness requested, perfection delivered.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">Explore</h4>
            <ul className="space-y-4">
              {['Menu', 'Locations', 'Our Story', 'Careers'].map(link => (
                <li key={link}>
                  <Link href="#" className="hover:text-primary transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Newsletter</h4>
            <p className="text-zinc-400 mb-4 text-sm">Subscribe for exclusive offers and secret menu access.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-primary transition-colors text-white"
              />
              <Button>Join</Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Meronatic Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
