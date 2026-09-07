import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

console.log('authenticate:', authenticate);
console.log('getProfile:', getProfile);
console.log('updateProfile:', updateProfile);

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);

export default router;