import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import hobbyRoutes from './routes/hobbyRoutes';
import userRoutes from './routes/userRoutes';
import path from 'path';

// console.log('Current directory:', process.cwd());
// console.log('Looking for .env in:', require('path').join(process.cwd(), '.env'));

dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? '✅ Yes' : '❌ Missing');
connectDB().catch(err => console.error('DB connection failed:', err));
const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'CurioCity API is running 🚀',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password',
      hobbies: 'GET /api/hobbies',
      roulette: 'GET /api/hobbies/roulette',
      matches: 'GET /api/hobbies/matches',
      myHobbies: 'GET /api/hobbies/my-hobbies',
      profile: 'GET /api/users/me',
    }
  });
});

// ✅ Logger middleware – AFTER app is defined
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/hobbies', hobbyRoutes);
app.use('/api/users', userRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});