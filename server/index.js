import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

// Configure ffmpeg/ffprobe paths (env overrides first, then static fallbacks)
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
} else if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);
}

if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
} else if ((ffprobeStatic as any)?.path) {
  // ffprobe-static typically exports an object with a `path` property
  ffmpeg.setFfprobePath((ffprobeStatic as any).path);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuration file paths
const configPath = path.join(__dirname, 'config.json');
const progressPath = path.join(__dirname, 'progress.json');
const achievementsPath = path.join(__dirname, 'achievements.json');
const learningStatsPath = path.join(__dirname, 'learning-stats.json');
const thumbnailsDir = path.join(__dirname, 'thumbnails');

// Initialize config file if it doesn't exist
if (!fsSync.existsSync(configPath)) {
  fsSync.writeFileSync(configPath, JSON.stringify({ folders: [] }, null, 2));
}

// Initialize progress file if it doesn't exist
if (!fsSync.existsSync(progressPath)) {
  fsSync.writeFileSync(progressPath, JSON.stringify({}, null, 2));
}

// Initialize achievements file if it doesn't exist
if (!fsSync.existsSync(achievementsPath)) {
  const initialAchievements = {
    unlocked: [],
    availableAchievements: [
      { id: 'first_video', name: 'First Steps', description: 'Watch your first video', icon: '🎬', requirement: 1 },
      { id: 'video_marathon_5', name: 'Getting Started', description: 'Complete 5 videos', icon: '🏃', requirement: 5 },
      { id: 'video_marathon_10', name: 'Committed Learner', description: 'Complete 10 videos', icon: '🎯', requirement: 10 },
      { id: 'video_marathon_25', name: 'Knowledge Seeker', description: 'Complete 25 videos', icon: '🔥', requirement: 25 },
      { id: 'video_marathon_50', name: 'Master Student', description: 'Complete 50 videos', icon: '👑', requirement: 50 },
      { id: 'streak_3', name: '3-Day Streak', description: 'Learn for 3 days in a row', icon: '⚡', requirement: 3 },
      { id: 'streak_7', name: 'Week Warrior', description: 'Learn for 7 days in a row', icon: '🔥', requirement: 7 },
      { id: 'streak_30', name: 'Monthly Champion', description: 'Learn for 30 days in a row', icon: '🏆', requirement: 30 },
      { id: 'speedster', name: 'Speedster', description: 'Complete 5 videos in one day', icon: '⚡', requirement: 5 },
      { id: 'night_owl', name: 'Night Owl', description: 'Watch a video after 10 PM', icon: '🦉', requirement: 1 }
    ]
  };
  fsSync.writeFileSync(achievementsPath, JSON.stringify(initialAchievements, null, 2));
}

// Initialize learning stats file if it doesn't exist
if (!fsSync.existsSync(learningStatsPath)) {
  const initialStats = {
    totalVideosCompleted: 0,
    totalWatchTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    dailyGoal: 3,
    videosCompletedToday: 0,
    points: 0,
    level: 1,
    activityLog: []
  };
  fsSync.writeFileSync(learningStatsPath, JSON.stringify(initialStats, null, 2));
}

// Create thumbnails directory if it doesn't exist
if (!fsSync.existsSync(thumbnailsDir)) {
  fsSync.mkdirSync(thumbnailsDir, { recursive: true });
}

// Read video folders from config
function getConfigFolders() {
  try {
    const config = JSON.parse(fsSync.readFileSync(configPath, 'utf8'));
    return config.folders || [];
  } catch (error) {
    return [];
  }
}

// Save folders to config
function saveConfigFolders(folders) {
  fsSync.writeFileSync(configPath, JSON.stringify({ folders }, null, 2));
}

// Progress tracking functions
function getProgress() {
  try {
    const data = fsSync.readFileSync(progressPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function saveProgress(progress) {
  fsSync.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

function getVideoProgress(videoId) {
  const progress = getProgress();
  return progress[videoId] || { watched: false, progress: 0, completed: false, lastWatched: null };
}

function updateVideoProgress(videoId, data) {
  const progress = getProgress();
  const wasCompleted = progress[videoId]?.completed || false;
  const isNowCompleted = data.completed || false;
  
  progress[videoId] = {
    ...progress[videoId],
    ...data,
    lastWatched: new Date().toISOString()
  };
  saveProgress(progress);
  
  // Check if video was just completed (not already completed)
  if (isNowCompleted && !wasCompleted) {
    updateLearningStats(videoId, data);
    checkAchievements();
  }
  
  return progress[videoId];
}

// Learning Stats Functions
function getLearningStats() {
  try {
    const data = fsSync.readFileSync(learningStatsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      totalVideosCompleted: 0,
      totalWatchTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      dailyGoal: 3,
      videosCompletedToday: 0,
      points: 0,
      level: 1,
      activityLog: []
    };
  }
}

function saveLearningStats(stats) {
  fsSync.writeFileSync(learningStatsPath, JSON.stringify(stats, null, 2));
}

function updateLearningStats(videoId, progressData) {
  const stats = getLearningStats();
  const today = new Date().toISOString().split('T')[0];
  const lastActivityDate = stats.lastActivityDate ? stats.lastActivityDate.split('T')[0] : null;
  
  // Update streak
  if (lastActivityDate === today) {
    // Same day, just update count
    stats.videosCompletedToday += 1;
  } else {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (lastActivityDate === yesterday) {
      // Consecutive day
      stats.currentStreak += 1;
      stats.videosCompletedToday = 1;
    } else if (lastActivityDate) {
      // Streak broken
      stats.currentStreak = 1;
      stats.videosCompletedToday = 1;
    } else {
      // First activity
      stats.currentStreak = 1;
      stats.videosCompletedToday = 1;
    }
  }
  
  // Update longest streak
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  
  // Update totals
  stats.totalVideosCompleted += 1;
  stats.lastActivityDate = new Date().toISOString();
  
  // Award points
  const basePoints = 10;
  const streakBonus = stats.currentStreak * 2;
  stats.points += basePoints + streakBonus;
  
  // Calculate level (every 100 points = 1 level)
  stats.level = Math.floor(stats.points / 100) + 1;
  
  // Add to activity log
  stats.activityLog.unshift({
    videoId,
    timestamp: new Date().toISOString(),
    points: basePoints + streakBonus,
    type: 'video_completed'
  });
  
  // Keep only last 100 activities
  if (stats.activityLog.length > 100) {
    stats.activityLog = stats.activityLog.slice(0, 100);
  }
  
  saveLearningStats(stats);
  return stats;
}

// Achievement Functions
function getAchievements() {
  try {
    const data = fsSync.readFileSync(achievementsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { unlocked: [], availableAchievements: [] };
  }
}

function saveAchievements(achievements) {
  fsSync.writeFileSync(achievementsPath, JSON.stringify(achievements, null, 2));
}

function checkAchievements() {
  const achievements = getAchievements();
  const stats = getLearningStats();
  const newlyUnlocked = [];
  
  achievements.availableAchievements.forEach(achievement => {
    const isUnlocked = achievements.unlocked.some(a => a.id === achievement.id);
    if (isUnlocked) return;
    
    let shouldUnlock = false;
    
    if (achievement.id.startsWith('video_marathon_')) {
      shouldUnlock = stats.totalVideosCompleted >= achievement.requirement;
    } else if (achievement.id === 'first_video') {
      shouldUnlock = stats.totalVideosCompleted >= 1;
    } else if (achievement.id.startsWith('streak_')) {
      shouldUnlock = stats.currentStreak >= achievement.requirement;
    } else if (achievement.id === 'speedster') {
      shouldUnlock = stats.videosCompletedToday >= achievement.requirement;
    } else if (achievement.id === 'night_owl') {
      const hour = new Date().getHours();
      shouldUnlock = hour >= 22 || hour < 6;
    }
    
    if (shouldUnlock) {
      const unlockedAchievement = {
        ...achievement,
        unlockedAt: new Date().toISOString()
      };
      achievements.unlocked.push(unlockedAchievement);
      newlyUnlocked.push(unlockedAchievement);
      
      // Award bonus points for achievement
      stats.points += 50;
      stats.activityLog.unshift({
        achievementId: achievement.id,
        timestamp: new Date().toISOString(),
        points: 50,
        type: 'achievement_unlocked'
      });
      saveLearningStats(stats);
    }
  });
  
  saveAchievements(achievements);
  return newlyUnlocked;
}

// Generate video thumbnail
async function generateThumbnail(videoPath, videoId) {
  return new Promise((resolve) => {
    const thumbnailPath = path.join(thumbnailsDir, `${videoId}.jpg`);
    
    // Check if thumbnail already exists
    if (fsSync.existsSync(thumbnailPath)) {
      resolve(thumbnailPath);
      return;
    }

    console.log(`Generating thumbnail for: ${videoPath}`);
    
    ffmpeg(videoPath)
      .on('error', (err) => {
        console.error(`❌ Thumbnail generation failed for ${videoId}:`, err.message);
        resolve(null);
      })
      .on('end', () => {
        console.log(`✅ Thumbnail generated: ${videoId}.jpg`);
        resolve(thumbnailPath);
      })
      .screenshots({
        timestamps: ['5%'],
        filename: `${videoId}.jpg`,
        folder: thumbnailsDir,
        size: '320x180'
      });
  });
}

// Scan folders for videos recursively
async function scanVideoFolders() {
  const folders = getConfigFolders();
  const videos = [];

  for (const folder of folders) {
    try {
      if (!fsSync.existsSync(folder)) {
        console.warn(`Folder does not exist: ${folder}`);
        continue;
      }
      await scanDirectory(folder, videos, folder);
    } catch (error) {
      console.error(`Error scanning folder ${folder}:`, error);
    }
  }

  return videos;
}

// Recursively scan directory
async function scanDirectory(dir, videos, sourceFolder) {
  try {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        await scanDirectory(filePath, videos, sourceFolder);
      } else {
        const ext = path.extname(file).toLowerCase();
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];
        
        if (videoExtensions.includes(ext)) {
          const relativePath = path.relative(sourceFolder, filePath);
          const folderName = path.dirname(relativePath);
          
          const video = {
            id: Buffer.from(filePath).toString('base64'),
            title: path.basename(file, ext),
            filename: file,
            path: filePath,
            relativePath,
            folder: folderName === '.' ? null : folderName,
            size: stats.size,
            format: ext.slice(1),
            modified: stats.mtime.toISOString(),
            subtitles: findSubtitles(dir, path.basename(file, ext)),
            sourceFolder
          };
          
          videos.push(video);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
}

// Find subtitle files
function findSubtitles(dir, baseName) {
  const subtitleExtensions = ['.srt', '.vtt', '.ass', '.ssa'];
  const subtitles = [];

  subtitleExtensions.forEach(ext => {
    const subtitlePath = path.join(dir, baseName + ext);
    if (fsSync.existsSync(subtitlePath)) {
      subtitles.push({
        filename: baseName + ext,
        path: subtitlePath,
        language: 'en' // Default language, can be enhanced
      });
    }
  });

  return subtitles;
}

// API Routes

// Get all videos
app.get('/api/videos', async (req, res) => {
  const videos = await scanVideoFolders();
  res.json(videos);
});

// Get single video by ID
app.get('/api/videos/:id', async (req, res) => {
  const videos = await scanVideoFolders();
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  res.json(video);
});

// Get next videos in the same folder
app.get('/api/videos/:id/next', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const videos = await scanVideoFolders();
  const currentVideo = videos.find(v => v.id === req.params.id);
  
  if (!currentVideo) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  // Get videos from the same folder, sorted by name
  const sameFolder = videos
    .filter(v => v.sourceFolder === currentVideo.sourceFolder && v.folder === currentVideo.folder)
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
  
  // Find current video index and get next videos
  const currentIndex = sameFolder.findIndex(v => v.id === currentVideo.id);
  const nextVideos = currentIndex >= 0 
    ? sameFolder.slice(currentIndex + 1, currentIndex + 1 + limit)
    : [];
  
  res.json(nextVideos);
});

// Browse folders
app.get('/api/browse', async (req, res) => {
  try {
    const requestedPath = req.query.path;
    const configFolders = getConfigFolders();
    
    if (!requestedPath) {
      // Return root level - show configured folders
      const folders = [];
      for (const folder of configFolders) {
        if (fsSync.existsSync(folder)) {
          const stats = await fs.stat(folder);
          folders.push({
            name: path.basename(folder),
            path: folder,
            modified: stats.mtime.toISOString()
          });
        }
      }
      return res.json({ folders, videos: [], currentPath: null });
    }
    
    // Check if requested path is within configured folders
    const isAllowed = configFolders.some(folder => 
      requestedPath.startsWith(folder)
    );
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied to this path' });
    }
    
    if (!fsSync.existsSync(requestedPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    const items = await fs.readdir(requestedPath);
    const folders = [];
    const videos = [];
    
    for (const item of items) {
      const itemPath = path.join(requestedPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        folders.push({
          name: item,
          path: itemPath,
          modified: stats.mtime.toISOString()
        });
      } else {
        const ext = path.extname(item).toLowerCase();
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];
        
        if (videoExtensions.includes(ext)) {
          videos.push({
            id: Buffer.from(itemPath).toString('base64'),
            title: path.basename(item, ext),
            filename: item,
            path: itemPath,
            size: stats.size,
            format: ext.slice(1),
            modified: stats.mtime.toISOString(),
            subtitles: findSubtitles(requestedPath, path.basename(item, ext))
          });
        }
      }
    }
    
    res.json({ folders, videos, currentPath: requestedPath });
  } catch (error) {
    console.error('Browse error:', error);
    res.status(500).json({ error: 'Failed to browse folder' });
  }
});

// Stream video
app.get('/api/stream/:id', async (req, res) => {
  const videos = await scanVideoFolders();
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const videoPath = video.path;
  const stat = fsSync.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fsSync.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fsSync.createReadStream(videoPath).pipe(res);
  }
});

// Get subtitles
app.get('/api/subtitles/:videoId/:filename', async (req, res) => {
  const videos = await scanVideoFolders();
  const video = videos.find(v => v.id === req.params.videoId);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const subtitle = video.subtitles.find(s => s.filename === req.params.filename);
  if (!subtitle) {
    return res.status(404).json({ error: 'Subtitle not found' });
  }

  const subtitlePath = subtitle.path;
  res.sendFile(subtitlePath);
});

// Get configured folders
app.get('/api/config/folders', (req, res) => {
  const folders = getConfigFolders();
  res.json({ folders });
});

// Add folder to config
app.post('/api/config/folders', (req, res) => {
  const { folder } = req.body;
  
  if (!folder) {
    return res.status(400).json({ error: 'Folder path is required' });
  }
  
  if (!fsSync.existsSync(folder)) {
    return res.status(404).json({ error: 'Folder does not exist' });
  }
  
  const folders = getConfigFolders();
  if (!folders.includes(folder)) {
    folders.push(folder);
    saveConfigFolders(folders);
  }
  
  res.json({ folders });
});

// Remove folder from config
app.delete('/api/config/folders', (req, res) => {
  const { folder } = req.body;
  
  if (!folder) {
    return res.status(400).json({ error: 'Folder path is required' });
  }
  
  let folders = getConfigFolders();
  folders = folders.filter(f => f !== folder);
  saveConfigFolders(folders);
  
  res.json({ folders });
});

// Health check
app.get('/api/health', (req, res) => {
  const folders = getConfigFolders();
  res.json({ 
    status: 'ok',
    folders: folders.length,
    timestamp: new Date().toISOString()
  });
});

// Serve thumbnails with lazy generation
app.get('/api/thumbnails/:id.jpg', async (req, res) => {
  const videoId = req.params.id;
  const thumbnailPath = path.join(thumbnailsDir, `${videoId}.jpg`);
  
  // If thumbnail exists, serve it
  if (fsSync.existsSync(thumbnailPath)) {
    return res.sendFile(thumbnailPath);
  }
  
  // If not, try to generate it on-the-fly
  try {
    const videos = await scanVideoFolders();
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Generate thumbnail
    await generateThumbnail(video.path, video.id);
    
    // Now serve it
    if (fsSync.existsSync(thumbnailPath)) {
      return res.sendFile(thumbnailPath);
    } else {
      return res.status(500).json({ error: 'Thumbnail generation failed' });
    }
  } catch (error) {
    console.error('Lazy thumbnail generation error:', error);
    return res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
});

// Generate thumbnail for a video
app.post('/api/thumbnail/:id', async (req, res) => {
  try {
    const videos = await scanVideoFolders();
    const video = videos.find(v => v.id === req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const thumbnailPath = await generateThumbnail(video.path, video.id);
    res.json({ 
      success: true, 
      thumbnail: `/api/thumbnails/${video.id}.jpg` 
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
});

// Get all progress data
app.get('/api/progress', (req, res) => {
  const progress = getProgress();
  res.json(progress);
});

// Get progress for a specific video
app.get('/api/progress/:id', (req, res) => {
  const progress = getVideoProgress(req.params.id);
  res.json(progress);
});

// Update progress for a video
app.post('/api/progress/:id', (req, res) => {
  const { watched, progress, completed } = req.body;
  const videoId = req.params.id;
  
  const data = {};
  if (watched !== undefined) data.watched = watched;
  if (progress !== undefined) data.progress = progress;
  if (completed !== undefined) data.completed = completed;
  
  const updated = updateVideoProgress(videoId, data);
  res.json(updated);
});

// Mark video as complete
app.post('/api/progress/:id/complete', (req, res) => {
  const updated = updateVideoProgress(req.params.id, {
    watched: true,
    completed: true,
    progress: 100
  });
  res.json(updated);
});

// Reset video progress
app.delete('/api/progress/:id', (req, res) => {
  const updated = updateVideoProgress(req.params.id, {
    watched: false,
    completed: false,
    progress: 0
  });
  res.json(updated);
});

// LMS Endpoints - Achievements
app.get('/api/achievements', (req, res) => {
  const achievements = getAchievements();
  res.json(achievements);
});

app.get('/api/achievements/check', (req, res) => {
  const newlyUnlocked = checkAchievements();
  res.json({ newlyUnlocked });
});

// LMS Endpoints - Learning Stats
app.get('/api/stats', (req, res) => {
  const stats = getLearningStats();
  res.json(stats);
});

app.post('/api/stats/goal', (req, res) => {
  const { dailyGoal } = req.body;
  const stats = getLearningStats();
  stats.dailyGoal = dailyGoal;
  saveLearningStats(stats);
  res.json(stats);
});

app.get('/api/leaderboard', (req, res) => {
  const stats = getLearningStats();
  res.json({
    level: stats.level,
    points: stats.points,
    rank: 1,
    totalUsers: 1
  });
});

app.listen(PORT, () => {
  console.log(`Video server running on http://localhost:${PORT}`);
  console.log(`Configured folders: ${getConfigFolders().length}`);
});
