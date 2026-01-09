'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
              T
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary hidden xs:inline">Tạp Hóa Thủy Thản</span>
          </Link>

          <nav className="flex items-center space-x-3 sm:space-x-6">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium transition-colors hover:text-primary"
            >
              Trang chủ
            </Link>
            <Link
              href="/menu"
              className="text-xs sm:text-sm font-medium transition-colors hover:text-primary"
            >
              Thực đơn
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                T
              </div>
              <span className="text-lg font-bold text-primary">Tạp Hóa Thủy Thản</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2026 Tạp Hóa Thủy Thản. Đặt món ăn nhanh chóng và tiện lợi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
