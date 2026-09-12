import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  getPublicProfile,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

console.log('authenticate:', authenticate);
console.log('getProfile:', getProfile);
console.log('updateProfile:', updateProfile);
console.log('uploadAvatar:', uploadAvatar);
console.log('searchUsers:', searchUsers);
console.log('getPublicProfile:', getPublicProfile);

// Own profile
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);

// Avatar upload
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// Search — MUST come before /:id, otherwise Express treats "search" as an id
router.get('/search', authenticate, searchUsers);

// Public profile of any user
router.get('/:id', authenticate, getPublicProfile);

export default router;