import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/lib/cart-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#FF6B35',
};

export const metadata: Metadata = {
  title: {
    default: 'Tạp Hóa Thủy Thản - Đặt Món Ăn Online Nhanh Chóng',
    template: '%s | Tạp Hóa Thủy Thản',
  },
  description: 'Tạp Hóa Thủy Thản - Đặt món ăn online nhanh chóng, tiện lợi. Thực đơn đa dạng, tươi ngon mỗi ngày. Giao hàng tận nơi, thanh toán linh hoạt.',
  keywords: [
    'tạp hóa',
    'thủy thản',
    'đặt món ăn online',
    'giao đồ ăn',
    'thực đơn',
    'món ngon',
    'giao hàng tận nơi',
    'đồ ăn tươi ngon',
    'order food',
    'food delivery',
  ],
  authors: [{ name: 'Tạp Hóa Thủy Thản' }],
  creator: 'Tạp Hóa Thủy Thản',
  publisher: 'Tạp Hóa Thủy Thản',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tạp Hóa Thủy Thản - Đặt Món Ăn Online',
    description: 'Đặt món ăn online nhanh chóng, tiện lợi. Thực đơn đa dạng, tươi ngon mỗi ngày.',
    url: '/',
    siteName: 'Tạp Hóa Thủy Thản',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tạp Hóa Thủy Thản',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tạp Hóa Thủy Thản - Đặt Món Ăn Online',
    description: 'Đặt món ăn online nhanh chóng, tiện lợi. Thực đơn đa dạng, tươi ngon mỗi ngày.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
