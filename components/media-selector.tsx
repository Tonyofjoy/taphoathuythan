'use client';

import { useEffect, useState } from 'react';
import { Search, Image as ImageIcon, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Media {
  _id: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedUrls: string[]) => void;
  selectedUrls?: string[];
  multiple?: boolean;
  maxSelection?: number;
}

export default function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  selectedUrls = [],
  multiple = false,
  maxSelection = 10,
}: MediaSelectorProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedUrls);

  useEffect(() => {
    if (open) {
      fetchMedia();
      setTempSelected(selectedUrls);
    }
  }, [open, selectedUrls]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredMedia(
        media.filter((item) =>
          item.filename.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredMedia(media);
    }
  }, [searchQuery, media]);

  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/media', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMedia(data.media);
        setFilteredMedia(data.media);
      }
    } catch (error) {
      toast.error('Lỗi khi tải thư viện media');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = (url: string) => {
    if (multiple) {
      if (tempSelected.includes(url)) {
        setTempSelected(tempSelected.filter((u) => u !== url));
      } else {
        if (tempSelected.length >= maxSelection) {
          toast.error(`Chỉ có thể chọn tối đa ${maxSelection} ảnh`);
          return;
        }
        setTempSelected([...tempSelected, url]);
      }
    } else {
      setTempSelected([url]);
    }
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Chọn Media từ Thư viện</DialogTitle>
          <DialogDescription className="text-sm">
            {multiple
              ? `Chọn tối đa ${maxSelection} ảnh. Đã chọn: ${tempSelected.length}/${maxSelection}`
              : 'Chọn một ảnh'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected count badge */}
          {tempSelected.length > 0 && (
            <Badge variant="secondary" className="w-fit">
              Đã chọn: {tempSelected.length} ảnh
            </Badge>
          )}

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Chưa có media nào</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'Không tìm thấy kết quả'
                    : 'Hãy vào trang Quản lý Media để upload'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredMedia.map((item) => {
                  const isSelected = tempSelected.includes(item.url);
                  return (
                    <Card
                      key={item._id}
                      className={`group overflow-hidden cursor-pointer hover:shadow-lg transition-all ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleMediaClick(item.url)}
                    >
                      <div className="relative aspect-square bg-muted">
                        <Image
                          src={item.url}
                          alt={item.filename}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary rounded-full p-2">
                              <Check className="h-6 w-6 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs font-medium truncate" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={tempSelected.length === 0}
            className="w-full sm:w-auto"
          >
            Xác nhận ({tempSelected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
