'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCart } from '@/lib/cart-context';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerNote: '',
    paymentMethod: 'cod' as 'cod' | 'momo' | 'vnpay' | 'zalopay',
  });

  // Prefill customer information if logged in
  useEffect(() => {
    if (isAuthenticated && customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name || prev.customerName,
        customerPhone: customer.phone || prev.customerPhone,
        customerAddress: customer.addresses && customer.addresses.length > 0 
          ? customer.addresses[0] 
          : prev.customerAddress,
      }));
    }
  }, [isAuthenticated, customer]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: getCartTotal(),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setOrderNumber(data.order.orderNumber);
        setOrderSuccess(true);
        clearCart();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setOrderSuccess(false);
    router.push('/');
  };

  if (cart.length === 0 && !orderSuccess) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Link href="/cart">
        <Button variant="ghost" className="mb-4 text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại giỏ hàng
        </Button>
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8">Thanh toán</h1>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Thông tin giao hàng</CardTitle>
              {isAuthenticated && (
                <p className="text-sm text-muted-foreground">
                  Thông tin đã được điền tự động từ tài khoản của bạn
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Họ và tên *</Label>
                  <Input
                    id="name"
                    placeholder="Nhập họ và tên"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm">Địa chỉ giao hàng *</Label>
                  {isAuthenticated && customer && customer.addresses && customer.addresses.length > 1 && (
                    <Select
                      value={formData.customerAddress}
                      onValueChange={(value) =>
                        setFormData({ ...formData, customerAddress: value })
                      }
                    >
                      <SelectTrigger className="text-base mb-2">
                        <SelectValue placeholder="Chọn địa chỉ đã lưu" />
                      </SelectTrigger>
                      <SelectContent>
                        {customer.addresses.map((address, index) => (
                          <SelectItem key={index} value={address}>
                            {address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Textarea
                    id="address"
                    placeholder="Nhập địa chỉ chi tiết"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, customerAddress: e.target.value })
                    }
                    className="text-base resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm">Ghi chú đơn hàng</Label>
                  <Textarea
                    id="note"
                    placeholder="Ghi chú về đơn hàng (tùy chọn)"
                    value={formData.customerNote}
                    onChange={(e) =>
                      setFormData({ ...formData, customerNote: e.target.value })
                    }
                    className="text-base resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment" className="text-sm">Phương thức thanh toán</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Tiền mặt khi nhận hàng (COD)</SelectItem>
                      <SelectItem value="momo">MoMo</SelectItem>
                      <SelectItem value="vnpay">VNPay</SelectItem>
                      <SelectItem value="zalopay">ZaloPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full text-base" size="lg" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-2 sm:gap-3">
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-xl sm:text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm line-clamp-2">{item.productName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                      <p className="font-semibold text-xs sm:text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(getCartTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
        <DialogContent className="sm:max-w-md w-[90vw] max-w-[420px]">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-success" />
            </div>
            <DialogTitle className="text-center text-xl sm:text-2xl">Đặt hàng thành công!</DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-accent/50 p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
              <p className="text-lg sm:text-xl font-bold text-primary">{orderNumber}</p>
            </div>
            <Button onClick={handleSuccessClose} className="w-full" size="lg">
              Về trang chủ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
