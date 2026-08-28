import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  targetUserId: mongoose.Types.ObjectId;
  offeringHobbyId: mongoose.Types.ObjectId; // What the requester teaches
  requestingHobbyId: mongoose.Types.ObjectId; // What the requester wants to learn
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

const swapRequestSchema = new Schema<ISwapRequest>({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  offeringHobbyId: { type: Schema.Types.ObjectId, ref: 'Hobby', required: true },
  requestingHobbyId: { type: Schema.Types.ObjectId, ref: 'Hobby', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  message: { type: String },
}, { timestamps: true });

export const SwapRequest = mongoose.model<ISwapRequest>('SwapRequest', swapRequestSchema);