import express from 'express';
import { Hobby } from '../models/Hobby';
import { UserHobby } from '../models/UserHobby';
import { SwapRequest } from '../models/SwapRequest';
import { authenticate } from '../middleware/auth'; // We'll create this shortly

const router = express.Router();

// --- HELPER: Auth middleware (if not already created) ---
// We'll add this in step 4.

// 1. 🎲 Hobby Roulette – Get a random hobby the user doesn't have
router.get('/roulette', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId;

    // Get all hobby IDs the user already has (learn or teach)
    const userHobbies = await UserHobby.find({ userId }).select('hobbyId');
    const excludedIds = userHobbies.map(uh => uh.hobbyId);

    // Find one random hobby not in excludedIds
    const randomHobby = await Hobby.aggregate([
      { $match: { _id: { $nin: excludedIds } } },
      { $sample: { size: 1 } }
    ]);

    if (randomHobby.length === 0) {
      return res.status(404).json({ message: 'No more hobbies to explore! You have them all.' });
    }

    res.json(randomHobby[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. 📋 Get all hobbies (for selection)
router.get('/', authenticate, async (req, res) => {
  try {
    const hobbies = await Hobby.find().sort('name');
    res.json(hobbies);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. ➕ Add a hobby to user's profile (learn/teach)
router.post('/user-hobbies', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { hobbyId, type, level } = req.body;

    // Check if hobby exists
    const hobby = await Hobby.findById(hobbyId);
    if (!hobby) return res.status(404).json({ error: 'Hobby not found' });

    const userHobby = new UserHobby({ userId, hobbyId, type, level });
    await userHobby.save();

    res.status(201).json(userHobby);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. 🤝 Find Skill Swap Matches
router.get('/matches', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId;

    // Get all hobbies the user wants to LEARN
    const learnHobbies = await UserHobby.find({ userId, type: 'learn' }).select('hobbyId');
    const learnIds = learnHobbies.map(lh => lh.hobbyId);

    // Find users who TEACH these hobbies AND are willing to LEARN something the current user TEACHES
    const matches = await UserHobby.aggregate([
      // Step A: Find users who teach the hobbies I want to learn
      { $match: { hobbyId: { $in: learnIds }, type: 'teach', userId: { $ne: userId } } },
      { $group: { _id: '$userId', teachingHobby: { $first: '$hobbyId' } } },
      // Step B: For those users, find what they want to learn
      {
        $lookup: {
          from: 'userhobbies',
          let: { targetUserId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$userId', '$$targetUserId'] },
              { $eq: ['$type', 'learn'] }
            ] } } },
            { $limit: 1 }
          ],
          as: 'learnTarget'
        }
      },
      { $unwind: '$learnTarget' },
      // Step C: Populate user info and hobby names
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'hobbies',
          localField: 'teachingHobby',
          foreignField: '_id',
          as: 'teachHobbyInfo'
        }
      },
      { $unwind: '$teachHobbyInfo' },
      {
        $lookup: {
          from: 'hobbies',
          localField: 'learnTarget.hobbyId',
          foreignField: '_id',
          as: 'learnHobbyInfo'
        }
      },
      { $unwind: '$learnHobbyInfo' },
      // Step D: Format output
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          email: '$user.email',
          teaches: '$teachHobbyInfo.name',
          wantsToLearn: '$learnHobbyInfo.name',
        }
      }
    ]);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. 📨 Send a swap request
router.post('/swap-request', authenticate, async (req: any, res) => {
  try {
    const requesterId = req.userId;
    const { targetUserId, offeringHobbyId, requestingHobbyId, message } = req.body;

    const swap = new SwapRequest({
      requesterId,
      targetUserId,
      offeringHobbyId,
      requestingHobbyId,
      message
    });
    await swap.save();

    res.status(201).json({ message: 'Swap request sent!', swap });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. 📋 Get current user's hobbies
router.get('/my-hobbies', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId;

    const userHobbies = await UserHobby.find({ userId })
      .populate('hobbyId') // replaces hobbyId with full hobby object
      .sort({ type: 1 }); // learn first, then teach

    res.json(userHobbies);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 7. 🗑️ Remove a hobby from user's list
router.delete('/user-hobbies/:id', authenticate, async (req: any, res) => {
  try {
    const userId = req.userId;
    const userHobbyId = req.params.id;

    const deleted = await UserHobby.findOneAndDelete({ _id: userHobbyId, userId });
    if (!deleted) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Removed from your hobbies' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;