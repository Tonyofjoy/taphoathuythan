'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: Category;
  status: string;
  featured: boolean;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?featured=true'),
        fetch('/api/categories'),
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
      ]);

      if (productsData.success) setFeaturedProducts(productsData.products);
      if (categoriesData.success) setCategories(categoriesData.categories);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
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

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

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
    <div>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: 'Tạp Hóa Thủy Thản',
            description: 'Đặt món ăn online nhanh chóng, tiện lợi. Thực đơn đa dạng, tươi ngon mỗi ngày.',
            url: typeof window !== 'undefined' ? window.location.origin : '',
            servesCuisine: 'Vietnamese',
            priceRange: '₫₫',
            acceptsReservations: false,
            hasMenu: {
              '@type': 'Menu',
              hasMenuSection: categories.map(cat => ({
                '@type': 'MenuSection',
                name: cat.name,
              })),
            },
            potentialAction: {
              '@type': 'OrderAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: typeof window !== 'undefined' ? `${window.location.origin}/menu` : '',
                actionPlatform: [
                  'http://schema.org/DesktopWebPlatform',
                  'http://schema.org/MobileWebPlatform',
                ],
              },
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Đặt hàng nhanh chóng, giao tận nơi
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              Chào mừng đến với Tạp Hóa Thủy Thản
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Thực đơn đa dạng, tươi ngon mỗi ngày. Đặt món chỉ với vài thao tác đơn giản!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="text-lg px-8">
                  Xem thực đơn
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-primary">
              Danh mục sản phẩm
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/menu?category=${category._id}`}
                  className="group"
                >
                  <div className="rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-primary hover:shadow-lg hover:scale-105">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Món ăn nổi bật
              </h2>
              <Link href="/menu">
                <Button variant="outline">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card
                  key={product._id}
                  className="group overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    {product.featured && (
                      <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                        Nổi bật
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.status !== 'available'}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.status === 'available' ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Sẵn sàng đặt món?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Khám phá thực đơn phong phú của chúng tôi và đặt hàng ngay hôm nay!
          </p>
          <Link href="/menu">
            <Button size="lg" className="text-lg px-8">
              Đặt hàng ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
