import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductStatus = 'available' | 'out_of_stock' | 'discontinued';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  status: ProductStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá không thể âm'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục'],
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
