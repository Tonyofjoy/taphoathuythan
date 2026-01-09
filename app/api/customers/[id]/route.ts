import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/Order';
import { withAuth } from '@/lib/middleware';

// GET single customer with order history (admin only)
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const { id } = await params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    // Get customer orders
    const orders = await Order.find({ customerPhone: customer.phone })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      customer,
      orders,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy khách hàng' },
      { status: 500 }
    );
  }
});
