import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Media from '@/lib/models/Media';
import { put } from '@vercel/blob';

// GET - Fetch all media
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();
    const media = await Media.find().sort({ uploadedAt: -1 });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Save media info to database
    await connectDB();
    const media = await Media.create({
      url: blob.url,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
