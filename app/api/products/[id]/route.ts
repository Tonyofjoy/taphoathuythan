import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { withAuth } from '@/lib/middleware';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy sản phẩm' },
      { status: 500 }
    );
  }
}

// PUT update product (admin only)
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, price, images, category, status, featured } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin sản phẩm' },
        { status: 400 }
      );
    }

    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        images,
        category,
        status,
        featured,
      },
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật sản phẩm' },
      { status: 500 }
    );
  }
});

// DELETE product (admin only)
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa sản phẩm thành công',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xóa sản phẩm' },
      { status: 500 }
    );
  }
});
