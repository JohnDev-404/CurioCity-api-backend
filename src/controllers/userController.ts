console.log('userController loaded')

import { Request, Response } from 'express';
import { User } from '../models/User';

// Get current user's profile
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update current user's profile
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { fullName, bio, location } = req.body;

    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio; // allow empty string
    if (location !== undefined) updates.location = location;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
