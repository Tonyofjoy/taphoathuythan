# 🚀 Quick Start Guide - Tạp Hóa Thủy Thản

## Start Development

```bash
npm run dev
```
Visit: http://localhost:3000

## Admin Access
- URL: http://localhost:3000/admin/login
- Username: `admin`
- Password: `admin123`

## Build for Production

```bash
npm run build
npm start
```

## Database Seed

```bash
npm run seed
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection string ✅
- `JWT_SECRET` - JWT secret key ✅
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (⏳ add when ready)
- `NEXT_PUBLIC_SITE_URL` - Your domain (for production)

## Quick Reference

### Customer Pages
- `/` - Homepage
- `/menu` - Products
- `/cart` - Shopping cart
- `/checkout` - Order placement

### Admin Pages
- `/admin/login` - Login
- `/admin/dashboard` - Overview
- `/admin/products` - Manage products
- `/admin/categories` - Manage categories
- `/admin/orders` - Manage orders
- `/admin/orders/create` - **NEW: Create manual order**
- `/admin/customers` - Manage customers (can create manually)

### SEO Files
- `/robots.txt` - Search engine rules
- `/sitemap.xml` - Site structure
- `SEO_GUIDE.md` - Full SEO documentation

## Recent Updates ✨

1. ✅ Brand updated to **"Tạp Hóa Thủy Thản"**
2. ✅ Full SEO optimization
3. ✅ Manual order creation for admin
4. ✅ Manual customer creation for admin
5. ✅ Structured data (JSON-LD)
6. ✅ Meta tags optimization
7. ✅ Sitemap & robots.txt

## Status: ✅ PRODUCTION READY

All features complete and tested!
