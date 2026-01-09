'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
  _id: string;
  url: string;
  filename: string;
}

export default function GalleryCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      if (data.success && data.media.length > 0) {
        // Duplicate images for infinite scroll effect
        const duplicatedImages = [...data.media, ...data.media, ...data.media];
        setImages(duplicatedImages);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-xl"></div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl py-4">
      {/* Horizontal scrolling container */}
      <div className="flex">
        <div
          className="flex gap-4 md:gap-6"
          style={{
            animation: 'galleryScroll 40s linear infinite',
          }}
        >
          {images.map((image, index) => (
            <div
              key={`${image._id}-${index}`}
              className="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]"
            >
              {/* Image with 3:4 aspect ratio */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '3/4' }}>
                <Image
                  src={image.url}
                  alt={image.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 260px, 300px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
