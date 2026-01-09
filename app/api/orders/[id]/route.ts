import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { withAuth } from '@/lib/middleware';

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy đơn hàng' },
      { status: 500 }
    );
  }
}

// PUT update order status (admin only)
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Vui lòng chọn trạng thái' },
        { status: 400 }
      );
    }

    const { id } = await params;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
});

// DELETE order (admin only)
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa đơn hàng thành công',
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xóa đơn hàng' },
      { status: 500 }
    );
  }
});
