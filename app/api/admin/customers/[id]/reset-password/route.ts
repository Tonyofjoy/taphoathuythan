import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { hashPassword, verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader); // Debug log
    
    const token = getTokenFromHeader(authHeader);
    console.log('Extracted token:', token ? 'exists' : 'missing'); // Debug log

    if (!token) {
      console.log('No token provided'); // Debug log
      return NextResponse.json(
        { error: 'Không có quyền truy cập - Thiếu token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    console.log('Token payload:', payload); // Debug log

    if (!payload) {
      console.log('Invalid token'); // Debug log
      return NextResponse.json(
        { error: 'Không có quyền truy cập - Token không hợp lệ' },
        { status: 401 }
      );
    }

    // Check if user is admin (accept both 'admin' and 'super_admin' roles)
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      console.log('Not admin role:', payload.role); // Debug log
      return NextResponse.json(
        { error: 'Không có quyền truy cập - Không phải admin' },
        { status: 401 }
      );
    }

    // Await params
    const params = await context.params;
    const body = await request.json();
    const { newPassword } = body;

    // Validate input
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await Customer.findById(params.id);

    if (!customer) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update customer password
    customer.password = hashedPassword;
    await customer.save();

    console.log('Password reset successful for customer:', params.id); // Debug log

    return NextResponse.json({
      success: true,
      message: 'Đã đặt lại mật khẩu thành công',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đặt lại mật khẩu' },
      { status: 500 }
    );
  }
}
