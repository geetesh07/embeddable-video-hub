# VideoHub - Local Video Server

A beautiful, production-ready video hosting platform that serves videos directly from your local folders. No uploads needed!

## 🎬 Features

- ✅ **Local File Serving** - Videos stay on your machine, no uploads required
- ✅ **Automatic Folder Scanning** - Recursively scans video folders
- ✅ **Multiple Formats** - Supports MP4, MKV, AVI, MOV, WebM
- ✅ **Subtitle Support** - Automatic detection of .srt and .vtt files
- ✅ **Beautiful UI** - Dark cinematic theme with smooth animations
- ✅ **Embeddable Player** - Generate iframe codes for your LMS
- ✅ **No Database** - Everything from filesystem
- ✅ **Internet Ready** - Easy to expose via ngrok, Cloudflare, or port forwarding

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd server
npm install
cp .env.example .env

# Edit .env and add your video folder paths
# Windows: VIDEO_FOLDERS=C:\Users\YourName\Videos,D:\Movies
# Mac/Linux: VIDEO_FOLDERS=/Users/yourname/Videos,/media/movies

npm start
```

Server runs on `http://localhost:3001`

### 2. Start the Frontend

```bash
# In the project root
npm install
npm run dev
```

Frontend runs on `http://localhost:8080`

### 3. Configure Your Folders

1. Open `http://localhost:8080/settings`
2. Add your video folder paths
3. Videos will auto-scan every 30 seconds

## 🌍 Expose to Internet

### Option 1: ngrok (Easiest - 2 minutes)

```bash
# Terminal 1: Run backend
cd server && npm start

# Terminal 2: Expose via ngrok
npx ngrok http 3001
```

You'll get a URL like `https://abc123.ngrok.io` - update your frontend `.env`:

```env
VITE_API_URL=https://abc123.ngrok.io
```

### Option 2: Cloudflare Tunnel (Free + Permanent)

```bash
# Install cloudflared
# Then run:
cloudflared tunnel --url http://localhost:3001
```

### Option 3: Port Forwarding (For Custom Domain)

1. **Router Setup**: Forward external port 80/443 → your PC port 3001
2. **Find IP**: Visit whatismyip.com
3. **Dynamic DNS**: Use No-IP or DuckDNS for permanent URL
4. **HTTPS**: Use Caddy for automatic SSL

```bash
# Install Caddy
caddy reverse-proxy --from yourdomain.com --to localhost:3001
```

## 📁 Folder Structure

```
/
├── server/              # Node.js backend
│   ├── index.js        # Main server file
│   ├── package.json    # Server dependencies
│   └── .env            # Server configuration
├── src/
│   ├── pages/          # Frontend pages
│   ├── components/     # React components
│   └── lib/
│       └── api.ts      # API client
└── videos/             # Example video folder (configure your own)
```

## 🎥 Video Organization

The server automatically detects:

```
/Videos/
├── Course 1/
│   ├── 001 Welcome.mp4
│   ├── 001 Welcome.en.srt
│   ├── 001 Welcome.es.srt
│   ├── 002 Introduction.mp4
│   └── 002 Introduction.en.vtt
└── Course 2/
    └── Lesson 1.mkv
```

Subtitles naming:
- `videoname.en.srt` - English
- `videoname.es.srt` - Spanish  
- `videoname.fr.vtt` - French

## 🔧 Environment Variables

### Backend (`server/.env`)

```env
PORT=3001
VIDEO_FOLDERS=/path/to/videos1,/path/to/videos2
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001
# or for production:
# VITE_API_URL=https://your-domain.com
```

## 📡 API Endpoints

```
GET  /api/videos              - List all videos
GET  /api/videos/:id          - Get video details
GET  /api/stream/:id          - Stream video (range requests supported)
GET  /api/subtitles/:id/:file - Get subtitle file
GET  /api/config/folders      - Get configured folders
POST /api/config/folders      - Add new folder
GET  /api/health              - Server health check
```

## 🎨 Customization

### Change Theme

Edit `src/index.css` to customize colors:

```css
:root {
  --primary: 188 94% 55%;     /* Electric cyan */
  --accent: 270 70% 65%;      /* Purple */
  --background: 220 26% 7%;   /* Dark navy */
}
```

### Add Custom Domain

1. Point your domain's A record to your server IP
2. Setup SSL with Caddy or nginx
3. Update `.env` with your domain URL

## 🔒 Security Notes

- **Public Access**: Current setup allows anyone with the URL to view videos
- **Authentication**: Add auth middleware to Express if needed
- **Firewall**: Only open necessary ports
- **HTTPS**: Always use HTTPS for production (ngrok/Cloudflare include this)

## 📱 Embed in LMS

1. Click any video → "Get Embed Code"
2. Copy the iframe code
3. Paste in your LMS (Canvas, Moodle, Blackboard, etc.)

```html
<iframe 
  src="https://your-url.com/embed/VIDEO_ID" 
  width="640" 
  height="360" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

## 🐛 Troubleshooting

**Backend not starting?**
- Check port 3001 isn't in use: `lsof -i :3001`
- Verify folder paths in `.env` exist

**Videos not showing?**
- Check server logs for scan errors
- Verify video formats are supported
- Ensure read permissions on folders

**Can't access from internet?**
- Check firewall allows port 3001
- Verify ngrok/cloudflared is running
- Test locally first

## 📚 Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + TypeScript + Vite
- **Video Player**: Plyr
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router

## 🤝 Contributing

Want to add features? Ideas:
- Thumbnail generation
- Video transcoding
- User authentication
- View analytics
- Playlist support

## 📄 License

MIT License - Use freely for personal or commercial projects!

---

Built with ❤️ for easy video hosting
