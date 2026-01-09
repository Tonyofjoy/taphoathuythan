'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
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

function MenuContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?status=available'),
        fetch('/api/categories'),
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
      ]);

      if (productsData.success) setProducts(productsData.products);
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category._id === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Thực đơn
          </h1>
          <p className="text-muted-foreground">
            Khám phá các món ăn ngon của chúng tôi
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category._id} value={category._id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy sản phẩm nào
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product._id}
                className="group overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative w-full bg-muted overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-300"
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
                <CardContent className="p-3">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {product.category.name}
                  </Badge>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.status !== 'available'}
                  >
                    <ShoppingCart className="mr-2 h-3 w-3" />
                    {product.status === 'available' ? 'Thêm' : 'Hết hàng'}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
