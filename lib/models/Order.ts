import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'delivering' 
  | 'completed' 
  | 'cancelled';

export type PaymentMethod = 'cod' | 'momo' | 'vnpay' | 'zalopay';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: false,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, 'Vui lòng nhập tên khách hàng'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      trim: true,
    },
    customerAddress: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ giao hàng'],
      trim: true,
    },
    customerNote: {
      type: String,
      default: '',
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'momo', 'vnpay', 'zalopay'],
      default: 'cod',
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number automatically
OrderSchema.pre('save', async function () {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    this.orderNumber = `DH${dateStr}${String(count + 1).padStart(4, '0')}`;
  }
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
