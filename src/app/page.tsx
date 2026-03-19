import { Navbar } from "@/components/storefront/Navbar";
import { Hero } from "@/components/storefront/Hero";
import { Features } from "@/components/storefront/Features";
import { CategoryList } from "@/components/storefront/CategoryList";
import { MenuGrid } from "@/components/storefront/MenuGrid";
import { Footer } from "@/components/storefront/Footer";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";

export default function StorefrontPage() {
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CategoryList />
        <MenuGrid />
        <Features />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
