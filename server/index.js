import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration - Add your video folder paths here
const VIDEO_FOLDERS = process.env.VIDEO_FOLDERS 
  ? process.env.VIDEO_FOLDERS.split(',')
  : [
      // Default example paths - users will configure their own
      path.join(__dirname, '../videos'),
    ];

// Supported video formats
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.webm'];
const SUBTITLE_EXTENSIONS = ['.srt', '.vtt'];

// Helper function to scan directory for videos
async function scanDirectory(dirPath) {
  const videos = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subVideos = await scanDirectory(fullPath);
        videos.push(...subVideos);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          const stats = await fs.stat(fullPath);
          
          // Look for subtitle files with the same name
          const baseName = path.basename(entry.name, ext);
          const dirContent = await fs.readdir(path.dirname(fullPath));
          const subtitles = dirContent
            .filter(file => {
              const fileExt = path.extname(file).toLowerCase();
              const fileBase = path.basename(file, fileExt);
              return SUBTITLE_EXTENSIONS.includes(fileExt) && fileBase.startsWith(baseName);
            })
            .map(file => ({
              filename: file,
              path: path.join(path.dirname(fullPath), file),
              language: extractLanguage(file),
            }));
          
          videos.push({
            id: Buffer.from(fullPath).toString('base64'),
            title: baseName,
            filename: entry.name,
            path: fullPath,
            relativePath: path.relative(dirPath, fullPath),
            folder: path.dirname(path.relative(dirPath, fullPath)),
            size: stats.size,
            format: ext.slice(1),
            modified: stats.mtime,
            subtitles: subtitles,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return videos;
}

// Extract language code from subtitle filename (e.g., "video.en.srt" -> "en")
function extractLanguage(filename) {
  const match = filename.match(/\.([a-z]{2})\.(srt|vtt)$/i);
  return match ? match[1].toLowerCase() : 'en';
}

// API Routes

// Get all videos from configured folders
app.get('/api/videos', async (req, res) => {
  try {
    const allVideos = [];
    
    for (const folder of VIDEO_FOLDERS) {
      const videos = await scanDirectory(folder);
      allVideos.push(...videos.map(v => ({ ...v, sourceFolder: folder })));
    }
    
    // Sort by modified date (newest first)
    allVideos.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    res.json(allVideos);
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ error: 'Failed to scan video folders' });
  }
});

// Get single video by ID
app.get('/api/videos/:id', async (req, res) => {
  try {
    const videoPath = Buffer.from(req.params.id, 'base64').toString('utf-8');
    
    // Security: Validate path is within allowed folders
    if (!isPathAllowed(videoPath)) {
      return res.status(403).json({ error: 'Access denied: Video not in configured folders' });
    }
    
    const stats = await fs.stat(videoPath);
    
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const ext = path.extname(videoPath).toLowerCase();
    const baseName = path.basename(videoPath, ext);
    const dirPath = path.dirname(videoPath);
    
    // Find subtitles
    const dirContent = await fs.readdir(dirPath);
    const subtitles = dirContent
      .filter(file => {
        const fileExt = path.extname(file).toLowerCase();
        const fileBase = path.basename(file, fileExt);
        return SUBTITLE_EXTENSIONS.includes(fileExt) && fileBase.startsWith(baseName);
      })
      .map(file => ({
        filename: file,
        path: path.join(dirPath, file),
        language: extractLanguage(file),
      }));
    
    res.json({
      id: req.params.id,
      title: baseName,
      filename: path.basename(videoPath),
      path: videoPath,
      size: stats.size,
      format: ext.slice(1),
      modified: stats.mtime,
      subtitles: subtitles,
    });
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(404).json({ error: 'Video not found' });
  }
});

// Stream video file
app.get('/api/stream/:id', async (req, res) => {
  try {
    const videoPath = Buffer.from(req.params.id, 'base64').toString('utf-8');
    
    // Security: Validate path is within allowed folders
    if (!isPathAllowed(videoPath)) {
      return res.status(403).json({ error: 'Access denied: Video not in configured folders' });
    }
    
    const stats = await fs.stat(videoPath);
    const fileSize = stats.size;
    const range = req.headers.range;
    
    if (range) {
      // Handle range requests for video seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const readStream = (await import('fs')).createReadStream(videoPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });
      
      readStream.pipe(res);
    } else {
      // Send entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      
      const readStream = (await import('fs')).createReadStream(videoPath);
      readStream.pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(404).json({ error: 'Video not found' });
  }
});

// Stream subtitle file
app.get('/api/subtitles/:videoId/:filename', async (req, res) => {
  try {
    const videoPath = Buffer.from(req.params.videoId, 'base64').toString('utf-8');
    
    // Security: Validate video path is within allowed folders
    if (!isPathAllowed(videoPath)) {
      return res.status(403).json({ error: 'Access denied: Video not in configured folders' });
    }
    
    const dirPath = path.dirname(videoPath);
    const subtitlePath = path.join(dirPath, req.params.filename);
    
    // Security: Validate the final subtitle path is also within allowed folders
    if (!isPathAllowed(subtitlePath)) {
      return res.status(403).json({ error: 'Access denied: Subtitle not in configured folders' });
    }
    
    const content = await fs.readFile(subtitlePath, 'utf-8');
    const ext = path.extname(subtitlePath).toLowerCase();
    
    res.setHeader('Content-Type', ext === '.vtt' ? 'text/vtt' : 'text/plain');
    res.send(content);
  } catch (error) {
    console.error('Error getting subtitle:', error);
    res.status(404).json({ error: 'Subtitle not found' });
  }
});

// Helper function to validate path is within allowed folders
function isPathAllowed(requestedPath) {
  const normalizedPath = path.normalize(requestedPath);
  return VIDEO_FOLDERS.some(allowedFolder => {
    const normalizedAllowed = path.normalize(allowedFolder);
    return normalizedPath === normalizedAllowed || 
           normalizedPath.startsWith(normalizedAllowed + path.sep);
  });
}

// Browse folder contents (non-recursive)
app.get('/api/browse', async (req, res) => {
  try {
    // Check if any folders are configured
    if (VIDEO_FOLDERS.length === 0) {
      return res.json({ 
        folders: [], 
        videos: [], 
        currentPath: null,
        error: 'No folders configured. Add a folder path in the Folders page.' 
      });
    }

    const folderPath = req.query.path || VIDEO_FOLDERS[0];
    
    // Security: Validate path is within allowed folders
    if (!isPathAllowed(folderPath)) {
      return res.status(403).json({ error: 'Access denied: Path not in configured folders' });
    }

    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    
    const folders = [];
    const videos = [];
    
    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      
      if (entry.isDirectory()) {
        const stats = await fs.stat(fullPath);
        folders.push({
          name: entry.name,
          path: fullPath,
          modified: stats.mtime
        });
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          const stats = await fs.stat(fullPath);
          const baseName = path.basename(entry.name, ext);
          
          // Find subtitles
          const subtitles = entries
            .filter(e => {
              if (!e.isFile()) return false;
              const fileExt = path.extname(e.name).toLowerCase();
              const fileBase = path.basename(e.name, fileExt);
              return SUBTITLE_EXTENSIONS.includes(fileExt) && fileBase.startsWith(baseName);
            })
            .map(e => ({
              filename: e.name,
              path: path.join(folderPath, e.name),
              language: extractLanguage(e.name),
            }));
          
          videos.push({
            id: Buffer.from(fullPath).toString('base64'),
            title: baseName,
            filename: entry.name,
            path: fullPath,
            folder: folderPath,
            size: stats.size,
            format: ext.slice(1),
            modified: stats.mtime,
            subtitles
          });
        }
      }
    }
    
    res.json({ folders, videos, currentPath: folderPath });
  } catch (error) {
    console.error('Error browsing folder:', error);
    res.status(500).json({ error: 'Failed to browse folder' });
  }
});

// Get configured folders
app.get('/api/config/folders', (req, res) => {
  res.json({ folders: VIDEO_FOLDERS });
});

// Add new folder path
app.post('/api/config/folders', express.json(), (req, res) => {
  const { folder } = req.body;
  
  if (!folder) {
    return res.status(400).json({ error: 'Folder path required' });
  }
  
  if (!VIDEO_FOLDERS.includes(folder)) {
    VIDEO_FOLDERS.push(folder);
  }
  
  res.json({ success: true, folders: VIDEO_FOLDERS });
});

// Remove folder path from scanning
app.delete('/api/config/folders', express.json(), (req, res) => {
  const { folder } = req.body;
  
  if (!folder) {
    return res.status(400).json({ error: 'Folder path required' });
  }
  
  const index = VIDEO_FOLDERS.indexOf(folder);
  if (index > -1) {
    VIDEO_FOLDERS.splice(index, 1);
  }
  
  res.json({ success: true, folders: VIDEO_FOLDERS });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    folders: VIDEO_FOLDERS.length,
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`\n🎬 VideoHub Server running on port ${PORT}`);
  console.log(`\n📁 Watching folders:`);
  VIDEO_FOLDERS.forEach(folder => console.log(`   - ${folder}`));
  console.log(`\n🌍 Access your videos at: http://localhost:${PORT}`);
  console.log(`\n💡 To expose to internet:`);
  console.log(`   - Use ngrok: npx ngrok http ${PORT}`);
  console.log(`   - Or setup port forwarding on your router`);
  console.log(`   - Or use Cloudflare Tunnel\n`);
});
