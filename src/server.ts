import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import hobbyRoutes from './routes/hobbyRoutes';
import userRoutes from './routes/userRoutes';
import path from 'path';

console.log('Current directory:', process.cwd());
console.log('Looking for .env in:', require('path').join(process.cwd(), '.env'));

dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? '✅ Yes' : '❌ Missing');

const app = express();

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

const PORT = parseInt(process.env.PORT || '5001', 10);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
