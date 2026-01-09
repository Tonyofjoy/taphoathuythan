'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; variant: any }> = {
  pending: { label: 'Chờ xác nhận', variant: 'secondary' },
  confirmed: { label: 'Đã xác nhận', variant: 'default' },
  preparing: { label: 'Đang chuẩn bị', variant: 'default' },
  delivering: { label: 'Đang giao', variant: 'default' },
  completed: { label: 'Hoàn thành', variant: 'default' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, productsRes, customersRes] = await Promise.all([
        fetch('/api/orders', { headers }),
        fetch('/api/products'),
        fetch('/api/customers', { headers }),
      ]);

      const [ordersData, productsData, customersData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        customersRes.json(),
      ]);

      if (ordersData.success) {
        const orders = ordersData.orders;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(
          (order: Order) => new Date(order.createdAt) >= today
        );

        const pendingOrders = orders.filter((order: Order) => order.status === 'pending');

        const todayRevenue = todayOrders.reduce(
          (sum: number, order: Order) => sum + order.totalAmount,
          0
        );

        setStats({
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          todayOrders: todayOrders.length,
          todayRevenue,
          totalProducts: productsData.success ? productsData.products.length : 0,
          totalCustomers: customersData.success ? customersData.customers.length : 0,
        });

        setRecentOrders(orders.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Tổng quan</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Chào mừng đến với trang quản trị Tạp Hóa Thủy Thản</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Đơn hàng hôm nay</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-primary">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Tổng: {stats.totalOrders} đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-secondary">
              {formatPrice(stats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Từ {stats.todayOrders} đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Chờ xác nhận</CardTitle>
            <ShoppingCart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-accent">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Cần xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCustomers} khách hàng
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Mã đơn</TableHead>
                  <TableHead className="whitespace-nowrap">Khách hàng</TableHead>
                  <TableHead className="whitespace-nowrap">Tổng tiền</TableHead>
                  <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                  <TableHead className="whitespace-nowrap">Ngày đặt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Chưa có đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <Link
                          href="/admin/orders"
                          className="hover:text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{order.customerName}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatPrice(order.totalAmount)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={statusLabels[order.status].variant}>
                          {statusLabels[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
