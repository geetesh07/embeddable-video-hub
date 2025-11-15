# VideoHub Setup Guide

## 📋 What You Got

A **local video server** that:
- Serves videos directly from your folders (no uploads!)
- Beautiful web interface to browse and search
- Generates embeddable video players for your LMS
- Can be exposed to the internet

## 🎯 Setup (5 minutes)

### Step 1: Prepare Your Videos

Organize your videos in folders:
```
C:\Users\YourName\Videos\
├── Course1\
│   ├── 001 Introduction.mp4
│   ├── 001 Introduction.en.srt
│   └── 002 Overview.mp4
└── Course2\
    └── Lesson1.mkv
```

### Step 2: Start the Backend Server

```bash
# Navigate to server folder
cd server

# Install dependencies (first time only)
npm install

# Create configuration file
cp .env.example .env

# Edit .env and add your video folder paths:
# Windows: VIDEO_FOLDERS=C:\Users\YourName\Videos,D:\Movies
# Mac: VIDEO_FOLDERS=/Users/yourname/Videos,/Volumes/External/Courses
# Linux: VIDEO_FOLDERS=/home/user/Videos,/media/videos

# Start the server
npm start
```

You'll see:
```
🎬 VideoHub Server running on port 3001
📁 Watching folders:
   - /your/video/folder
🌍 Access your videos at: http://localhost:3001
```

### Step 3: Start the Frontend

```bash
# In a new terminal, from project root
npm run dev
```

Access at: `http://localhost:8080`

### Step 4: Configure Folders

1. Open `http://localhost:8080/settings`
2. Click "Add" and enter your video folder paths
3. Videos will appear automatically!

## 🌍 Expose to Internet (Choose One)

### Option A: ngrok (Fastest - 2 min)

```bash
# In a new terminal:
npx ngrok http 3001
```

Copy the URL (e.g., `https://abc123.ngrok.io`)

Update frontend `.env`:
```env
VITE_API_URL=https://abc123.ngrok.io
```

Restart frontend: `npm run dev`

**Done!** Share `https://abc123.ngrok.io` with anyone.

### Option B: Cloudflare Tunnel (Free Forever)

```bash
cloudflared tunnel --url http://localhost:3001
```

Gets you a permanent free URL with HTTPS!

### Option C: Your Own Domain

1. **Buy a domain** (Namecheap, Google Domains, etc.)
2. **Port forward**: Router settings → Forward port 80 → Your PC port 3001
3. **Point domain**: Add A record pointing to your public IP (whatismyip.com)
4. **Setup HTTPS** (optional):
```bash
# Install Caddy
caddy reverse-proxy --from yourdomain.com --to localhost:3001
```

## 🎓 Use in Your LMS

1. Navigate to any video
2. Click "Get Embed Code"
3. Copy the iframe code
4. Paste in your LMS (Canvas, Moodle, Blackboard, etc.)

```html
<iframe 
  src="https://your-url.com/embed/VIDEO_ID" 
  width="640" 
  height="360" 
  allowfullscreen>
</iframe>
```

## 🎥 Subtitle Support

Name your subtitle files like:
- `video.en.srt` (English)
- `video.es.srt` (Spanish)
- `video.fr.vtt` (French)

They'll auto-load in the player!

## 📱 Multiple Devices

Access from:
- **Same WiFi**: Use your computer's local IP (Settings → Network → IPv4)
  - Example: `http://192.168.1.100:3001`
- **Internet**: Use ngrok/Cloudflare URL
- **Custom domain**: Use your domain

## 🔧 Configuration

### Add More Folders

1. Go to Settings
2. Add folder path
3. Videos auto-refresh every 30 seconds

### Change Ports

Backend (`server/.env`):
```env
PORT=3001
```

Frontend (`vite.config.ts`):
```ts
server: {
  port: 8080,
}
```

## 🎨 Customize

Colors in `src/index.css`:
```css
:root {
  --primary: 188 94% 55%;     /* Change this! */
  --accent: 270 70% 65%;      /* And this! */
}
```

## ⚡ Quick Commands

```bash
# Start everything
cd server && npm start          # Terminal 1
npm run dev                     # Terminal 2 (from root)

# Expose to internet
npx ngrok http 3001            # Terminal 3

# Check if server is running
curl http://localhost:3001/api/health
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Find what's using port 3001
# Mac/Linux: lsof -i :3001
# Windows: netstat -ano | findstr :3001
```

**Videos not showing?**
- Check folder paths in Settings
- Ensure videos are .mp4, .mkv, .avi, .mov, or .webm
- Check server logs for errors

**Can't access from other devices?**
- Firewall blocking port 3001?
- Using correct IP address?
- Both devices on same network?

**Frontend shows "Server Offline"?**
- Is backend running on port 3001?
- Check `.env` has correct `VITE_API_URL`
- Try: `curl http://localhost:3001/api/health`

## 📚 Next Steps

- Add more video folders in Settings
- Share your ngrok URL with students
- Embed videos in your LMS
- Setup custom domain for professional look

## 🎉 You're Done!

Your videos are now accessible and embeddable from anywhere! No uploads, no cloud, just your local files served to the world.

**Need help?** Check the main README.md for detailed docs.
