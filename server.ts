import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserProfile, updateUserProfile } from './src/db/users.ts';
import { getUserActivities, saveUserActivity, deleteUserActivity } from './src/db/activities.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cloudSql: process.env.SQL_HOST ? 'configured' : 'offline',
  });
});

// Sync or register user in Cloud SQL
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || `${uid}@wayfit.app`;
    const displayName = (req.user as any).name || req.body.displayName || null;

    const user = await getOrCreateUser(uid, email, displayName);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error in /api/auth/sync-user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Fetch user profile from Cloud SQL
app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const profile = await getUserProfile(uid);
    res.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

// Update user profile in Cloud SQL
app.put('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { displayName, weightKg, heightCm, dailyStepGoal, weeklyDistanceGoalKm, unit } = req.body;

    const updated = await updateUserProfile(uid, {
      displayName,
      weightKg,
      heightCm,
      dailyStepGoal,
      weeklyDistanceGoalKm,
      unit,
    });
    res.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// Fetch user activities from Cloud SQL
app.get('/api/activities', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const activities = await getUserActivities(uid);
    res.json({ activities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch activities' });
  }
});

// Save activity to Cloud SQL
app.post('/api/activities', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const activity = req.body;
    if (!activity || !activity.id) {
      return res.status(400).json({ error: 'Invalid activity data' });
    }

    const saved = await saveUserActivity(activity, uid);
    res.json({ success: true, activity: saved });
  } catch (error: any) {
    console.error('Error saving activity:', error);
    res.status(500).json({ error: error.message || 'Failed to save activity' });
  }
});

// Delete activity from Cloud SQL
app.delete('/api/activities/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const id = req.params.id;
    const deleted = await deleteUserActivity(id, uid);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: error.message || 'Failed to delete activity' });
  }
});

// Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WayFit Cloud SQL & Express backend running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
