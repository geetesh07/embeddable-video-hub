import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuration file path
const configPath = path.join(__dirname, 'config.json');

// Initialize config file if it doesn't exist
if (!fsSync.existsSync(configPath)) {
  fsSync.writeFileSync(configPath, JSON.stringify({ folders: [] }, null, 2));
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

app.listen(PORT, () => {
  console.log(`Video server running on http://localhost:${PORT}`);
  console.log(`Configured folders: ${getConfigFolders().length}`);
});
