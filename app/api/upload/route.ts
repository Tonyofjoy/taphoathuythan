import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { withAuth } from '@/lib/middleware';

// POST upload image (admin only)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Vui lòng chọn file' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file ảnh' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Kích thước file không được vượt quá 5MB' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const filename = `products/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi upload ảnh' },
      { status: 500 }
    );
  }
});
