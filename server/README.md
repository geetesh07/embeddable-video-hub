# VideoHub Local Server

This server scans your local video folders and serves them for the VideoHub frontend.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure your video folders:
```bash
cp .env.example .env
# Edit .env and add your video folder paths
```

3. Start the server:
```bash
npm start
```

## Configuration

Edit `.env` file to set your video folders:

### Windows:
```env
VIDEO_FOLDERS=C:\Users\YourName\Videos,D:\Movies,E:\Courses
```

### Mac/Linux:
```env
VIDEO_FOLDERS=/Users/yourname/Videos,/home/user/movies,/media/courses
```

## Exposing to Internet

### Option 1: ngrok (Easiest)
```bash
npx ngrok http 3001
```
You'll get a public URL like `https://abc123.ngrok.io`

### Option 2: Cloudflare Tunnel (Free)
```bash
# Install cloudflared
# Then run:
cloudflared tunnel --url http://localhost:3001
```

### Option 3: Port Forwarding
1. Configure your router to forward external port 80 → your PC's port 3001
2. Get your public IP from whatismyip.com
3. Optionally setup a Dynamic DNS service (like No-IP or DuckDNS)

### Option 4: Custom Domain
1. Setup port forwarding (Option 3)
2. Point your domain's A record to your public IP
3. Use Caddy or nginx for automatic HTTPS

## API Endpoints

- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get video details
- `GET /api/stream/:id` - Stream video (supports range requests)
- `GET /api/subtitles/:videoId/:filename` - Get subtitle file
- `GET /api/config/folders` - Get configured folders
- `POST /api/config/folders` - Add new folder
- `GET /api/health` - Health check

## Features

- ✅ Recursive folder scanning
- ✅ Multiple video formats (.mp4, .mkv, .avi, .mov, .webm)
- ✅ Automatic subtitle detection (.srt, .vtt)
- ✅ Video streaming with seek support
- ✅ No database required
- ✅ No file uploads needed
- ✅ Embeddable video player
