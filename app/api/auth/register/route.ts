import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { hashPassword } from '@/lib/auth';

// This endpoint creates a default admin user
// In production, you should remove this or add proper authorization
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, password, name, role = 'admin' } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Tên đăng nhập đã tồn tại' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await Admin.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      name,
      role,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Register admin error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo tài khoản' },
      { status: 500 }
    );
  }
}
