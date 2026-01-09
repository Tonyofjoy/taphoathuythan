'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { toast } from 'sonner';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
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

const paymentLabels: Record<string, string> = {
  cod: 'Tiền mặt (COD)',
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, customer } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await fetch('/api/customer/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error('Không thể tải đơn hàng');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi');
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
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          Đơn hàng của tôi
        </h1>
        <p className="text-muted-foreground">
          Xem lịch sử và trạng thái đơn hàng của bạn
        </p>
      </div>

      {/* Status Filter */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
          <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
          <TabsTrigger value="preparing">Đang chuẩn bị</TabsTrigger>
          <TabsTrigger value="delivering">Đang giao</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {selectedStatus === 'all' 
                ? 'Bạn chưa có đơn hàng nào. Hãy đặt món ngay!'
                : 'Không có đơn hàng nào với trạng thái này'}
            </p>
            <Link href="/menu">
              <Button>Xem thực đơn</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      Đơn hàng #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={statusLabels[order.status]?.variant || 'default'}>
                    {statusLabels[order.status]?.label || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sản phẩm:</p>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.productName} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Info */}
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Địa chỉ:</span> {order.customerAddress}</p>
                  {order.customerNote && (
                    <p><span className="font-medium">Ghi chú:</span> {order.customerNote}</p>
                  )}
                  <p><span className="font-medium">Thanh toán:</span> {paymentLabels[order.paymentMethod]}</p>
                </div>

                {/* Total */}
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
