import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

// GET all orders (admin only) or POST create order (public)
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy đơn hàng' },
      { status: 500 }
    );
  }
}

// POST create order (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerNote,
      items,
      totalAmount,
      paymentMethod,
    } = body;

    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin đơn hàng' },
        { status: 400 }
      );
    }

    // Create order
    const order = await Order.create({
      customerName,
      customerPhone,
      customerAddress,
      customerNote: customerNote || '',
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending',
    });

    // Update or create customer
    let customer = await Customer.findOne({ phone: customerPhone });

    if (customer) {
      // Update existing customer
      customer.name = customerName;
      if (!customer.addresses.includes(customerAddress)) {
        customer.addresses.push(customerAddress);
      }
      customer.totalOrders += 1;
      customer.lastOrderAt = new Date();
      await customer.save();
    } else {
      // Create new customer
      await Customer.create({
        name: customerName,
        phone: customerPhone,
        addresses: [customerAddress],
        totalOrders: 1,
        lastOrderAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo đơn hàng' },
      { status: 500 }
    );
  }
}
