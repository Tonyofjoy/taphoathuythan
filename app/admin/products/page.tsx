'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MediaSelector from '@/components/media-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: Category;
  status: string;
  featured: boolean;
}

const statusLabels: Record<string, { label: string; variant: any }> = {
  available: { label: 'Còn hàng', variant: 'default' },
  out_of_stock: { label: 'Hết hàng', variant: 'destructive' },
  discontinued: { label: 'Ngừng bán', variant: 'secondary' },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    images: [] as string[],
    category: '',
    status: 'available',
    featured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
      ]);

      if (productsData.success) setProducts(productsData.products);
      if (categoriesData.success) setCategories(categoriesData.categories);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const handleMediaSelect = (selectedUrls: string[]) => {
    setFormData((prev) => ({ ...prev, images: selectedUrls }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingProduct ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm mới');
        setDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        fetchData();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category._id,
      status: product.status,
      featured: product.featured,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã xóa sản phẩm');
        fetchData();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      images: [],
      category: '',
      status: 'available',
      featured: false,
    });
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    resetForm();
    setDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Quản lý sản phẩm</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Quản lý sản phẩm của cửa hàng</p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] whitespace-nowrap">Hình ảnh</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Tên sản phẩm</TableHead>
                <TableHead className="whitespace-nowrap">Danh mục</TableHead>
                <TableHead className="whitespace-nowrap">Giá</TableHead>
                <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Chưa có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.images.length > 0 ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-md">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{product.category.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatPrice(product.price)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusLabels[product.status].variant}>
                        {statusLabels[product.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingProduct ? 'Cập nhật thông tin sản phẩm' : 'Nhập thông tin sản phẩm mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Tên sản phẩm</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-base resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm">Giá (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">Danh mục</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Còn hàng</SelectItem>
                      <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                      <SelectItem value="discontinued">Ngừng bán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured" className="text-sm">Sản phẩm nổi bật</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Hình ảnh</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-md">
                      <Image
                        src={url}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMediaSelectorOpen(true)}
                    className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary transition-colors"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhấn vào biểu tượng để chọn ảnh từ thư viện media
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Selector */}
      <MediaSelector
        open={mediaSelectorOpen}
        onOpenChange={setMediaSelectorOpen}
        onSelect={handleMediaSelect}
        selectedUrls={formData.images}
        multiple={true}
        maxSelection={5}
      />
    </div>
  );
}
