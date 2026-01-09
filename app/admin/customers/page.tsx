'use client';

import { useEffect, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  addresses: string[];
  totalOrders: number;
  lastOrderAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    addresses: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      toast.error('Lỗi khi tải khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/customers/${customer._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCustomerOrders(data.orders);
      }
    } catch (error) {
      toast.error('Lỗi khi tải lịch sử đơn hàng');
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      const addresses = newCustomerData.addresses
        .split('\n')
        .filter(addr => addr.trim() !== '');

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCustomerData.name,
          phone: newCustomerData.phone,
          addresses,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã tạo khách hàng mới');
        setCreateDialogOpen(false);
        setNewCustomerData({ name: '', phone: '', addresses: '' });
        fetchCustomers();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search)
  );

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">Danh sách khách hàng và lịch sử đơn hàng</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm khách hàng
        </Button>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Tìm theo tên hoặc SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Số đơn hàng</TableHead>
              <TableHead>Đơn hàng cuối</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Không tìm thấy khách hàng nào
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge>{customer.totalOrders} đơn</Badge>
                  </TableCell>
                  <TableCell>
                    {customer.lastOrderAt
                      ? formatDate(customer.lastOrderAt)
                      : 'Chưa có đơn hàng'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin khách hàng</DialogTitle>
            <DialogDescription>Chi tiết và lịch sử đơn hàng</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="rounded-lg border bg-accent/50 p-4 space-y-2">
                <p>
                  <strong>Tên:</strong> {selectedCustomer.name}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {selectedCustomer.phone}
                </p>
                <p>
                  <strong>Tổng số đơn hàng:</strong> {selectedCustomer.totalOrders}
                </p>
                <div>
                  <strong>Địa chỉ đã dùng:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {selectedCustomer.addresses.map((address, index) => (
                      <li key={index} className="text-sm">
                        {address}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Lịch sử đơn hàng</h3>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Chưa có đơn hàng nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        customerOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge variant={statusLabels[order.status].variant}>
                                {statusLabels[order.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin khách hàng thủ công
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Tên khách hàng *</Label>
                <Input
                  id="customer-name"
                  value={newCustomerData.name}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Số điện thoại *</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={newCustomerData.phone}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-addresses">Địa chỉ (mỗi dòng 1 địa chỉ)</Label>
                <Textarea
                  id="customer-addresses"
                  value={newCustomerData.addresses}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, addresses: e.target.value })
                  }
                  rows={3}
                  placeholder="Nhập địa chỉ, mỗi dòng 1 địa chỉ"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang tạo...' : 'Tạo khách hàng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
