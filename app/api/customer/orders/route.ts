import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    // Get orders by phone number
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = {
      customerPhone: payload.username, // username is the phone number
    };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy đơn hàng' },
      { status: 500 }
    );
  }
}
