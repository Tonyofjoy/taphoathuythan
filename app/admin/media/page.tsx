'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function MediaManagementPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('admin_token');
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error);
        }
        return data.media;
      });

      await Promise.all(uploadPromises);
      toast.success('Upload thành công');
      fetchMedia();
    } catch (error) {
      toast.error('Lỗi khi upload media');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa media này?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã xóa media');
        fetchMedia();
        setDetailDialogOpen(false);
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Đã copy URL vào clipboard');
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Quản lý Media</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Thư viện hình ảnh và media của cửa hàng
          </p>
        </div>
        <label className="w-full sm:w-auto">
          <Button disabled={uploading} className="w-full sm:w-auto cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Đang upload...' : 'Upload Media'}
          </Button>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="secondary" className="text-sm px-4 py-2">
          Tổng số: {media.length} media
        </Badge>
        <Badge variant="outline" className="text-sm px-4 py-2">
          Kết quả: {filteredMedia.length} media
        </Badge>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Chưa có media nào</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Hãy upload media đầu tiên'}
            </p>
            {!searchQuery && (
              <label>
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item._id}
              className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedMedia(item);
                setDetailDialogOpen(true);
              }}
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
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
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Chi tiết Media</DialogTitle>
            <DialogDescription className="text-sm">
              Thông tin chi tiết và quản lý media
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Tên file</Label>
                  <p className="text-sm mt-1 break-all">{selectedMedia.filename}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={selectedMedia.url}
                      readOnly
                      className="text-xs sm:text-sm flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedMedia.url)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Kích thước</Label>
                    <p className="text-sm mt-1">{formatFileSize(selectedMedia.size)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ngày upload</Label>
                    <p className="text-sm mt-1">{formatDate(selectedMedia.uploadedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>
            {selectedMedia && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedMedia._id)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa Media
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
