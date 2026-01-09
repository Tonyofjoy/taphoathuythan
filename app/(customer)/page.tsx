'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ShoppingCart, ArrowRight, Sparkles, UtensilsCrossed, Coffee, IceCream, Soup, Camera, ChevronLeft, ChevronRight, Phone, Heart } from 'lucide-react';
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

interface GalleryImage {
  _id: string;
  url: string;
  filename: string;
}

function GalleryCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      if (data.success && data.media.length > 0) {
        // Duplicate images for infinite scroll effect
        const duplicatedImages = [...data.media, ...data.media, ...data.media];
        setImages(duplicatedImages);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-xl"></div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl py-4">
      {/* Horizontal scrolling container */}
      <div className="flex">
        <div
          className="flex gap-4 md:gap-6"
          style={{
            animation: 'galleryScroll 40s linear infinite',
          }}
        >
          {images.map((image, index) => (
            <div
              key={`${image._id}-${index}`}
              className="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]"
            >
              {/* Image with 3:4 aspect ratio */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '3/4' }}>
                <Image
                  src={image.url}
                  alt={image.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 260px, 300px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
    </div>
  );
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, allProductsRes] = await Promise.all([
        fetch('/api/products?featured=true'),
        fetch('/api/categories'),
        fetch('/api/products?status=available'),
      ]);

      const [productsData, categoriesData, allProductsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        allProductsRes.json(),
      ]);

      if (productsData.success) setFeaturedProducts(productsData.products);
      if (categoriesData.success) setCategories(categoriesData.categories);
      if (allProductsData.success) setAllProducts(allProductsData.products);
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

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(product => product.category._id === selectedCategory);

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
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16 md:py-24 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Tạp Hóa Thủy Thản"
            fill
            className="object-cover"
            priority
          />
          {/* White Overlay */}
          <div className="absolute inset-0 bg-white/70"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
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

      {/* Categories Section - Enhanced with icons and gradients */}
      {categories.length > 0 && allProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-2">
                <UtensilsCrossed className="h-4 w-4" />
                Khám phá thực đơn
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Danh mục sản phẩm
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Chọn danh mục yêu thích và khám phá các món ăn ngon đang chờ bạn
              </p>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'bg-background border-2 border-border hover:border-primary hover:scale-105'
                }`}
              >
                Tất cả ({allProducts.length})
              </button>
              {categories.map((category, index) => {
                const Icon = [UtensilsCrossed, Coffee, IceCream, Soup][index % 4];
                const productCount = allProducts.filter(p => p.category._id === category._id).length;
                
                return (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      selectedCategory === category._id
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-background border-2 border-border hover:border-primary hover:scale-105'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name} ({productCount})
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 10).map((product) => (
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
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
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
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Không có sản phẩm trong danh mục này
                  </p>
                </div>
              )}
            </div>
            
            {/* View All CTA */}
            {filteredProducts.length > 10 && (
              <div className="text-center mt-10">
                <p className="text-muted-foreground mb-4">
                  Còn {filteredProducts.length - 10} sản phẩm khác
                </p>
                <Link href={`/menu${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}>
                  <Button size="lg" variant="outline" className="group">
                    Xem tất cả
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-2">
              <Camera className="h-4 w-4" />
              Thư viện ảnh
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Khám phá không gian của chúng tôi
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những khoảnh khắc đáng nhớ và không gian ấm cúng đang chờ bạn
            </p>
          </div>
          <GalleryCarousel />
        </div>
      </section>

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
                  <div className="relative w-full bg-muted overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
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
                      {formatPrice(product.price)} / phần
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

      {/* About Section with Image */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
            {/* Image */}
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
              <Image
                src="/about.jpg"
                alt="Tạp Hóa Thủy Thản - Món ăn gia đình"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              {/* Decorative element */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary fill-primary" />
                <span className="font-semibold text-primary">20+ năm kinh nghiệm</span>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4" />
                Câu chuyện của chúng tôi
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                Đồng hành cùng bữa cơm gia đình Việt
              </h2>
              
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Với hơn <span className="font-semibold text-primary">20 năm kinh nghiệm</span> chế biến những món ăn ngon và đa dạng, 
                  chúng tôi hiểu rằng các bà nội trợ bận rộn cần một người đồng hành đáng tin cậy.
                </p>
                
                <p>
                  Từng món ăn được chúng tôi làm ra đều mang theo <span className="font-semibold text-primary">tâm huyết</span> và 
                  <span className="font-semibold text-primary"> sự tận tâm</span>, giúp bạn tiết kiệm thời gian mà vẫn có những bữa cơm 
                  ấm cúng, đầy đủ dinh dưỡng cho gia đình.
                </p>
                
                <p className="text-base">
                  💡 <span className="font-medium">Mẹo nhỏ:</span> Đặt tiệc tại nhà? Chúng tôi sẵn sàng hỗ trợ bạn!
                </p>
              </div>

              {/* Contact CTA */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-semibold text-primary">Đặt tiệc</span> hoặc <span className="font-semibold text-primary">đơn hàng lớn?</span>
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full p-3">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Liên hệ Chị Thủy</p>
                    <a 
                      href="tel:0972789945" 
                      className="text-xl font-bold text-primary hover:underline"
                    >
                      0972 789 945
                    </a>
                  </div>
                </div>
                <Link href="/menu">
                  <Button size="lg" className="w-full text-lg">
                    Xem thực đơn ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
