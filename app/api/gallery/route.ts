import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/lib/models/Media';

// GET - Fetch gallery images (public endpoint)
export async function GET() {
  try {
    await connectDB();
    
    // Fetch only images in the 'gallery' folder
    const media = await Media.find({ folder: 'gallery' }).sort({ uploadedAt: -1 });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
