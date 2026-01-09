'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

const menuItems = [
  { href: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/media', label: 'Thư viện Media', icon: ImageIcon },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');

    if (!token || !userStr) {
      // Redirect to login if not on login page
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } else {
      setAdminUser(JSON.parse(userStr));
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 lg:w-64 transform border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 sm:px-6 flex-shrink-0">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 flex-shrink-0 rounded-lg overflow-hidden border-2 border-primary/20">
                <Image
                  src="/logo.jpg"
                  alt="Tạp Hóa Thủy Thản Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary">Tạp Hóa Thủy Thản</span>
            </Link>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* User info */}
          <div className="p-4">
            {adminUser && (
              <div className="mb-2 rounded-lg bg-accent p-3">
                <p className="text-sm font-medium">{adminUser.name}</p>
                <p className="text-xs text-muted-foreground">@{adminUser.username}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 w-full">
        <div className="container mx-auto p-4 pt-20 lg:pt-6 lg:p-8 max-w-full">{children}</div>
      </main>
    </div>
  );
}
