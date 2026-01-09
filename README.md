# Tạp Hóa - Food Shop Website

Website bán đồ ăn với quản lý CMS hoàn chỉnh, sử dụng Next.js 16, MongoDB, và Vercel Blob.

## Tính năng chính

### 🛍️ Trang khách hàng
- Xem danh sách món ăn với hình ảnh đẹp mắt
- Tìm kiếm và lọc theo danh mục
- Giỏ hàng với localStorage
- Đặt hàng không cần đăng nhập (guest checkout)
- Giao diện tươi sáng, màu sắc tích cực
- Responsive design cho mobile

### 🎛️ Quản trị CMS (Admin)
- Đăng nhập với JWT authentication
- Dashboard với thống kê tổng quan
- Quản lý danh mục sản phẩm
- Quản lý sản phẩm với upload nhiều ảnh (Vercel Blob)
- Quản lý đơn hàng với cập nhật trạng thái
- Quản lý khách hàng với lịch sử đơn hàng

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui, Tailwind CSS
- **Database**: MongoDB với Mongoose
- **Storage**: Vercel Blob (hình ảnh)
- **Authentication**: JWT
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Cập nhật các giá trị trong `.env.local`:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/taphoa?retryWrites=true&w=majority

# JWT Secret Key (tạo chuỗi random mạnh)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Vercel Blob Token (lấy từ Vercel dashboard)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXX
```

### 3. Chạy development server

```bash
npm run dev
```

Website sẽ chạy tại `http://localhost:3000`

## Tạo tài khoản Admin đầu tiên

Sử dụng API endpoint để tạo admin:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "Quản trị viên",
    "role": "super_admin"
  }'
```

Hoặc sử dụng Postman/Thunder Client với:
- URL: `POST http://localhost:3000/api/auth/register`
- Body (JSON):
  ```json
  {
    "username": "admin",
    "password": "admin123",
    "name": "Quản trị viên",
    "role": "super_admin"
  }
  ```

## Truy cập website

- **Trang khách hàng**: http://localhost:3000
- **Đăng nhập Admin**: http://localhost:3000/admin/login
- **Dashboard Admin**: http://localhost:3000/admin/dashboard

## Cấu trúc thư mục

```
app/
├── (customer)/        # Trang khách hàng
│   ├── page.tsx       # Trang chủ
│   ├── menu/          # Thực đơn
│   ├── cart/          # Giỏ hàng
│   └── checkout/      # Đặt hàng
├── admin/             # CMS Admin
│   ├── login/         # Đăng nhập
│   ├── dashboard/     # Dashboard
│   ├── categories/    # Quản lý danh mục
│   ├── products/      # Quản lý sản phẩm
│   ├── orders/        # Quản lý đơn hàng
│   └── customers/     # Quản lý khách hàng
└── api/               # API Routes
    ├── auth/          # Authentication
    ├── categories/    # CRUD danh mục
    ├── products/      # CRUD sản phẩm
    ├── orders/        # CRUD đơn hàng
    ├── customers/     # Customer endpoints
    └── upload/        # Upload ảnh

lib/
├── mongodb.ts         # MongoDB connection
├── auth.ts            # JWT utilities
├── blob.ts            # Vercel Blob utilities
├── cart-context.tsx   # Cart context
├── middleware.ts      # Auth middleware
└── models/            # Mongoose models

components/
└── ui/                # shadcn/ui components
```

## Tính năng sắp tới

- [ ] Tích hợp thanh toán online (MoMo, VNPay, ZaloPay)
- [ ] Email/SMS thông báo đơn hàng
- [ ] Đăng ký/đăng nhập cho khách hàng
- [ ] Đánh giá sản phẩm
- [ ] Chương trình khách hàng thân thiết
- [ ] Thống kê chi tiết hơn trong admin

## Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm environment variables trong Vercel dashboard
4. Deploy!

## Lưu ý

- **Xóa endpoint `/api/auth/register`** sau khi tạo admin đầu tiên trong production để bảo mật
- Đổi `JWT_SECRET` thành một chuỗi random mạnh
- Sử dụng MongoDB Atlas cho production
- Enable Vercel Blob trong project settings

## Hỗ trợ

Nếu có vấn đề gì, vui lòng tạo issue hoặc liên hệ.

---

Made with ❤️ using Next.js & shadcn/ui
