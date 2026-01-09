import mongoose, { Schema, model, models } from 'mongoose';

export interface IMedia {
  url: string;
  filename: string;
  size: number;
  folder: string;
  uploadedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  folder: {
    type: String,
    default: 'general',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Media = models.Media || model<IMedia>('Media', MediaSchema);

export default Media;
