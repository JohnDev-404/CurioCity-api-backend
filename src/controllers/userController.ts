console.log('userController loaded');

import { Request, Response } from 'express';
import { User } from '../models/User';
import cloudinary from '../utils/cloudinary';

// Fields to never return to the client
const PRIVATE_FIELDS = '-password -resetPasswordToken -resetPasswordExpires -avatarPublicId';

// ---------------------------------------------------------------------------
// Existing: get current user's profile
// ---------------------------------------------------------------------------
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select(PRIVATE_FIELDS);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('❌ getProfile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// Existing: update current user's profile
// ---------------------------------------------------------------------------
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { fullName, bio, location } = req.body;

    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select(PRIVATE_FIELDS);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('❌ updateProfile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// NEW: upload / replace avatar
// ---------------------------------------------------------------------------
export const uploadAvatar = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete previous avatar from Cloudinary (best-effort)
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (err) {
        console.warn('⚠️ Could not delete old avatar:', err);
      }
    }

    // Upload new avatar via upload_stream (accepts a Buffer)
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'curiocity/avatars',
          public_id: `user_${userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    user.avatarUrl = uploadResult.secure_url;
    user.avatarPublicId = uploadResult.public_id;
    await user.save();

    res.json({
      message: 'Avatar updated',
      avatarUrl: user.avatarUrl,
    });
  } catch (error: any) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({ error: error.message || 'Avatar upload failed' });
  }
};

// ---------------------------------------------------------------------------
// NEW: search users by name or email
// ---------------------------------------------------------------------------
export const searchUsers = async (req: any, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    const userId = req.userId;

    if (!q) {
      return res.json({ users: [] });
    }

    // Escape regex special chars to prevent ReDoS
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');

    const users = await User.find({
      _id: { $ne: userId },
      $or: [{ fullName: regex }, { email: regex }],
    })
      .select('fullName avatarUrl bio location isVerified')
      .limit(20)
      .lean();

    res.json({ users });
  } catch (error: any) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

// ---------------------------------------------------------------------------
// NEW: get another user's public profile
// ---------------------------------------------------------------------------
export const getPublicProfile = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(id)
      .select('fullName avatarUrl bio location isVerified createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user,
      isOwnProfile: currentUserId === id,
    });
  } catch (error: any) {
    console.error('❌ Get public profile error:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
};