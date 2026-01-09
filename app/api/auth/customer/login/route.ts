import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { phone, password } = body;

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập số điện thoại và mật khẩu' },
        { status: 400 }
      );
    }

    // Find customer and include password field
    const customer = await Customer.findOne({ phone }).select('+password');

    if (!customer) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Check if customer has password (for backward compatibility)
    if (!customer.password) {
      return NextResponse.json(
        { error: 'Tài khoản chưa được thiết lập mật khẩu. Vui lòng đăng ký lại.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, customer.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: customer._id.toString(),
      username: customer.phone,
      role: 'customer',
    });

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        addresses: customer.addresses,
        totalOrders: customer.totalOrders,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    );
  }
}
