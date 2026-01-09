'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Giỏ hàng trống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá thực đơn của chúng tôi!
            </p>
            <Link href="/menu">
              <Button className="w-full">
                Xem thực đơn
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/menu">
          <Button variant="ghost" className="mb-4 text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tiếp tục mua hàng
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          Giỏ hàng ({getCartCount()} món)
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-2xl sm:text-3xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{item.productName}</h3>
                      <p className="text-primary font-bold text-sm sm:text-base">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <p className="font-bold text-sm sm:text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Tổng đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(getCartTotal())}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Đặt hàng
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
