import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { withAuth } from '@/lib/middleware';

// GET all customers (admin only)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .sort({ lastOrderAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy khách hàng' },
      { status: 500 }
    );
  }
});

// POST create customer (admin only)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { name, phone, addresses } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên và số điện thoại' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Số điện thoại đã tồn tại' },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      name,
      phone,
      addresses: addresses || [],
      totalOrders: 0,
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo khách hàng' },
      { status: 500 }
    );
  }
});
