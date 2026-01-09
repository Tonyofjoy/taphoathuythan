import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, phone, password } = body;

    // Validate input
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Số điện thoại đã được đăng ký' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer
    const customer = await Customer.create({
      name,
      phone,
      password: hashedPassword,
      addresses: [],
      totalOrders: 0,
    });

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
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng ký' },
      { status: 500 }
    );
  }
}
