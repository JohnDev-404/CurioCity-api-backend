import mongoose, { Schema, Document } from 'mongoose';

export interface IHobby extends Document {
  name: string;
  category: string;
  icon: string; // Emoji or icon name
  description: string;
  sampleTutorialUrl?: string; // Link to a YouTube tutorial or guide
}

const hobbySchema = new Schema<IHobby>({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  icon: { type: String, required: true, default: '🎯' },
  description: { type: String, required: true },
  sampleTutorialUrl: { type: String },
});

export const Hobby = mongoose.model<IHobby>('Hobby', hobbySchema);