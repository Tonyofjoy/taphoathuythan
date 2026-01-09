'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const paymentMethodLabels: Record<string, string> = {
  cod: 'Tiền mặt (COD)',
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error('Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã cập nhật trạng thái đơn hàng');
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã xóa đơn hàng');
        fetchOrders();
        setDialogOpen(false);
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
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

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Quản lý đơn hàng</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Theo dõi và quản lý đơn hàng của khách hàng</p>
        </div>
        <Link href="/admin/orders/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tạo đơn hàng
          </Button>
        </Link>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="flex-wrap h-auto w-full justify-start">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Tất cả ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Chờ xác nhận ({getOrdersByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs sm:text-sm">
            Đã xác nhận ({getOrdersByStatus('confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="preparing" className="text-xs sm:text-sm">
            Đang chuẩn bị ({getOrdersByStatus('preparing').length})
          </TabsTrigger>
          <TabsTrigger value="delivering" className="text-xs sm:text-sm">
            Đang giao ({getOrdersByStatus('delivering').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Hoàn thành ({getOrdersByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Mã đơn</TableHead>
                    <TableHead className="whitespace-nowrap min-w-[120px]">Khách hàng</TableHead>
                    <TableHead className="whitespace-nowrap">SĐT</TableHead>
                    <TableHead className="whitespace-nowrap">Tổng tiền</TableHead>
                    <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                    <TableHead className="whitespace-nowrap">Ngày đặt</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium whitespace-nowrap">{order.orderNumber}</TableCell>
                        <TableCell className="whitespace-nowrap">{order.customerName}</TableCell>
                        <TableCell className="whitespace-nowrap">{order.customerPhone}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={statusLabels[order.status].variant}>
                            {statusLabels[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs sm:text-sm">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedOrder(order);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(order._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Chi tiết đơn hàng {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription className="text-sm">
              Thông tin chi tiết và cập nhật trạng thái đơn hàng
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm">Trạng thái đơn hàng</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder._id, value)}
                >
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xác nhận</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                    <SelectItem value="delivering">Đang giao</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm sm:text-base">Thông tin khách hàng</h3>
                <div className="rounded-lg border bg-accent/50 p-3 sm:p-4 space-y-1 text-sm">
                  <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.customerPhone}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.customerAddress}</p>
                  {selectedOrder.customerNote && (
                    <p><strong>Ghi chú:</strong> {selectedOrder.customerNote}</p>
                  )}
                  <p><strong>Thanh toán:</strong> {paymentMethodLabels[selectedOrder.paymentMethod]}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm sm:text-base">Sản phẩm đã đặt</h3>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Sản phẩm</TableHead>
                          <TableHead className="text-center whitespace-nowrap text-xs sm:text-sm">SL</TableHead>
                          <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">Đơn giá</TableHead>
                          <TableHead className="text-right whitespace-nowrap text-xs sm:text-sm">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs sm:text-sm">{item.productName}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-right text-xs sm:text-sm">{formatPrice(item.price)}</TableCell>
                            <TableCell className="text-right text-xs sm:text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold text-xs sm:text-sm">
                            Tổng cộng:
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary text-xs sm:text-sm">
                            {formatPrice(selectedOrder.totalAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground">
                <p>Ngày đặt: {formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
