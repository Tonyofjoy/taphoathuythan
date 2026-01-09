import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { withAuth } from '@/lib/middleware';

// GET all categories (public)
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ order: 1 });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy danh mục' },
      { status: 500 }
    );
  }
}

// POST create category (admin only)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { name, slug, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên và slug' },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug đã tồn tại' },
        { status: 400 }
      );
    }

    const category = await Category.create({ name, slug, order: order || 0 });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo danh mục' },
      { status: 500 }
    );
  }
});
