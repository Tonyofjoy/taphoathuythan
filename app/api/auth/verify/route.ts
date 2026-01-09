import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token đã hết hạn hoặc không hợp lệ' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: payload,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xác thực' },
      { status: 500 }
    );
  }
}
