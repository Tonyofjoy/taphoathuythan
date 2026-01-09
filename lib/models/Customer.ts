import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  addresses: string[];
  totalOrders: number;
  lastOrderAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên khách hàng'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      unique: true,
      trim: true,
    },
    addresses: {
      type: [String],
      default: [],
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    lastOrderAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
