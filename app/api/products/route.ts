import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { withAuth } from '@/lib/middleware';

// GET all products (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy sản phẩm' },
      { status: 500 }
    );
  }
}

// POST create product (admin only)
export const POST = withAuth(async (request: NextRequest) => {
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

    const product = await Product.create({
      name,
      description,
      price,
      images: images || [],
      category,
      status: status || 'available',
      featured: featured || false,
    });

    await product.populate('category');

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo sản phẩm' },
      { status: 500 }
    );
  }
});
