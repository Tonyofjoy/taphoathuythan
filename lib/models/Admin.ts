import mongoose, { Schema, Document, Model } from 'mongoose';

export type AdminRole = 'super_admin' | 'admin';

export interface IAdmin extends Document {
  username: string;
  password: string;
  name: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: [true, 'Vui lòng nhập tên đăng nhập'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
