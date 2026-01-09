import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { withAuth } from '@/lib/middleware';

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy danh mục' },
      { status: 500 }
    );
  }
}

// PUT update category (admin only)
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

    const { id } = await params;

    // Check if slug exists (excluding current category)
    const existingCategory = await Category.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug đã tồn tại' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug, order: order || 0 },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật danh mục' },
      { status: 500 }
    );
  }
});

// DELETE category (admin only)
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa danh mục thành công',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xóa danh mục' },
      { status: 500 }
    );
  }
});
