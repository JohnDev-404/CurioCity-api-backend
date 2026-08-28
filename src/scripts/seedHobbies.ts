import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Hobby } from '../models/Hobby';

dotenv.config();

const hobbies = [
  { name: 'Guitar', category: 'Music', icon: '🎸', description: 'Learn to play acoustic or electric guitar.' },
  { name: 'Painting', category: 'Art', icon: '🎨', description: 'Express yourself with watercolors, oils, or acrylics.' },
  { name: 'Coding', category: 'Technology', icon: '💻', description: 'Build websites, apps, and software.' },
  { name: 'Yoga', category: 'Fitness', icon: '🧘', description: 'Improve flexibility and mental clarity.' },
  { name: 'Cooking', category: 'Food', icon: '🍳', description: 'Master recipes from around the world.' },
  { name: 'Photography', category: 'Art', icon: '📷', description: 'Capture stunning moments with your camera.' },
  { name: 'Gardening', category: 'Outdoors', icon: '🌱', description: 'Grow your own flowers, herbs, and vegetables.' },
  { name: 'Dancing', category: 'Fitness', icon: '💃', description: 'Salsa, hip-hop, ballet – move your body.' },
  { name: 'Writing', category: 'Literature', icon: '✍️', description: 'Write poetry, short stories, or a novel.' },
  { name: 'Chess', category: 'Strategy', icon: '♟️', description: 'Sharpen your mind with the game of kings.' },
  { name: 'Hiking', category: 'Outdoors', icon: '🥾', description: 'Explore trails and enjoy nature.' },
  { name: 'Pottery', category: 'Art', icon: '🏺', description: 'Shape clay into beautiful ceramics.' },
  { name: '3D Printing', category: 'Technology', icon: '🖨️', description: 'Bring digital designs to life.' },
  { name: 'Meditation', category: 'Wellness', icon: '🧠', description: 'Find peace and mindfulness.' },
  { name: 'Gardening', category: 'Outdoors', icon: '🌿', description: 'Cultivate your own green oasis.' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing hobbies to avoid duplicates (optional)
    await Hobby.deleteMany({});
    await Hobby.insertMany(hobbies);
    console.log('✅ Seeded 15 hobbies!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();