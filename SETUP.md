# Setup nhanh cho Tạp Hóa

## Bước 1: Cài đặt dependencies
```bash
npm install
```

## Bước 2: Cấu hình MongoDB

### Tạo MongoDB Atlas account (miễn phí)
1. Truy cập https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí
3. Tạo cluster mới (chọn Free tier)
4. Tạo database user với username/password
5. Whitelist IP: chọn "Allow access from anywhere" (0.0.0.0/0)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Thay `<password>` bằng password của user

## Bước 3: Cấu hình Vercel Blob

### Tạo Vercel account và Blob storage
1. Truy cập https://vercel.com/signup
2. Đăng nhập và tạo project mới
3. Vào project → Storage → Create Database → Blob
4. Copy `BLOB_READ_WRITE_TOKEN` từ .env.local tab

## Bước 4: Tạo file .env.local

```bash
cp .env.example .env.local
```

Cập nhật file `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taphoa?retryWrites=true&w=majority
JWT_SECRET=thay_bang_chuoi_random_manh_o_day
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_tu_buoc_3
```

## Bước 5: Seed dữ liệu ban đầu

```bash
npm run seed
```

Script này sẽ tạo:
- Admin user (username: `admin`, password: `admin123`)
- 4 danh mục mẫu (Đồ uống, Món chính, Món phụ, Tráng miệng)

## Bước 6: Chạy development server

```bash
npm run dev
```

## Bước 7: Truy cập website

- **Trang khách hàng**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login
  - Username: `admin`
  - Password: `admin123`

## Bước 8: Thêm sản phẩm đầu tiên

1. Đăng nhập vào admin
2. Vào "Sản phẩm" → "Thêm sản phẩm"
3. Upload ảnh, điền thông tin
4. Đánh dấu "Sản phẩm nổi bật" để hiện trên trang chủ
5. Lưu!

## Xong! 🎉

Website đã sẵn sàng để sử dụng!

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: Sau khi tạo admin đầu tiên, nên:
1. Xóa hoặc comment endpoint `/api/auth/register` trong production
2. Đổi password admin mặc định
3. Thay `JWT_SECRET` bằng chuỗi random mạnh (tối thiểu 32 ký tự)

## Deploy lên Vercel

```bash
# 1. Push code lên GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 2. Import vào Vercel
# - Truy cập vercel.com
# - Import GitHub repository
# - Thêm environment variables (MONGODB_URI, JWT_SECRET, BLOB_READ_WRITE_TOKEN)
# - Deploy!
```

## Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra connection string có đúng không
- Kiểm tra IP có được whitelist không
- Kiểm tra password có ký tự đặc biệt → encode URL

### Lỗi upload ảnh
- Kiểm tra BLOB_READ_WRITE_TOKEN có đúng không
- Kiểm tra file size < 5MB

### Lỗi đăng nhập admin
- Chạy lại `npm run seed` để đảm bảo admin đã được tạo
- Kiểm tra MongoDB có chạy không
