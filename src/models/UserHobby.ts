import mongoose, { Schema, Document } from 'mongoose';

export interface IUserHobby extends Document {
  userId: mongoose.Types.ObjectId;
  hobbyId: mongoose.Types.ObjectId;
  type: 'learn' | 'teach';
  level: 'beginner' | 'intermediate' | 'expert';
}

const userHobbySchema = new Schema<IUserHobby>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hobbyId: { type: Schema.Types.ObjectId, ref: 'Hobby', required: true },
  type: { type: String, enum: ['learn', 'teach'], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'expert'], required: true },
}, { timestamps: true });

// Ensure a user doesn't duplicate the same hobby+type
userHobbySchema.index({ userId: 1, hobbyId: 1, type: 1 }, { unique: true });

export const UserHobby = mongoose.model<IUserHobby>('UserHobby', userHobbySchema);