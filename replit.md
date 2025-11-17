# VideoHub - Local Video Server

## Overview

VideoHub is a local video hosting platform that serves videos directly from your filesystem without requiring uploads. It provides a beautiful web interface for browsing, searching, and playing videos with subtitle support, while also generating embeddable video players for use in Learning Management Systems (LMS) or other platforms.

The application consists of two main components:
- **Frontend**: React-based web application with a dark cinematic theme
- **Backend**: Node.js/Express server that scans local folders and streams video files

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 17, 2025 - Video Player Enhancements & Complete Cleanup
- ✅ **Auto-Play Next Video**: When a video ends, automatically plays the next video in the sidebar queue
- ✅ **NO Video Looping**: Videos completely disabled from looping (loop: false enforced)
- ✅ **Click-to-Pause Feature**: YouTube-style click-anywhere-to-pause functionality
- ✅ **Optimized Video Loading**: Changed preload to 'auto' for instant playback without buffering delay
- ✅ **Enhanced Keyboard Controls**: 
  - Global keyboard shortcuts enabled (Space, arrows, F for fullscreen)
  - Helpful tooltips on all controls
  - Visual guide showing available shortcuts below player
- ✅ **Complete Database Removal**: 
  - Removed all Supabase files and dependencies completely
  - Deleted server/db.ts and all database-related code
  - Removed @supabase/supabase-js from package.json
  - Added prominent README warning for AI agents about database-free architecture
- ✅ **Fixed Port Configuration**: Updated Vite to use port 5000 with allowedHosts: true
- ✅ **TypeScript Syntax Fix**: Removed TS assertions from JS files causing build errors
- ✅ **Fixed Video End Bug**: Videos now properly stop when ended instead of ghost audio replaying

### November 16, 2025 - Advanced LMS Features & Gamification System
- ✅ **Enhanced Thumbnail System**: Improved FFmpeg-based thumbnail generation with better error handling and logging
- ✅ **Achievements & Badges System**: 
  - 10 different achievements (First Steps, Video Marathon, Streaks, etc.)
  - Automatic unlock detection based on learning behavior
  - Bonus points awarded for each achievement (+50 points)
- ✅ **Learning Streaks**: Track consecutive days of learning with streak bonuses
- ✅ **Points & Leveling System**: 
  - Base 10 points per completed video + streak bonus
  - Level up every 100 points
  - Activity log tracking all points earned
- ✅ **Learning Stats Dashboard**:
  - Total videos completed, watch time, current/longest streak
  - Daily goal tracking
  - Videos completed today counter
- ✅ **Concurrent Startup**: Added `npm start` to run both frontend + backend together
- ✅ **Windows Batch File**: Created start.bat instructions for easy Windows setup
- ✅ **File-Based Storage**: All LMS data in JSON files (achievements.json, learning-stats.json)
- ✅ **No Database Required**: Complete LMS functionality without any database dependencies

### November 16, 2025 - LMS Features: Thumbnails & Progress Tracking
- ✅ **Video Thumbnails**: Automatic thumbnail generation using ffmpeg with lazy loading
- ✅ **Progress Tracking**: JSON-based watch progress system (no database needed)
  - Track watched status, completion, and progress percentage per video
  - Visual indicators: completion badges, progress bars, "In Progress" tags
  - Mark videos as complete/incomplete from video card menu
- ✅ **LMS-Ready**: Full Learning Management System capabilities without needing a database
- ✅ All data persisted in JSON files (progress.json) for simplicity

### November 16, 2025 - Complete Migration to Replit
- ✅ Installed all dependencies for frontend and server
- ✅ Fixed server to use ES6 module syntax (import/export)
- ✅ Removed all Supabase files and database dependencies
- ✅ Fixed CSS import order in index.css
- ✅ Simplified LocalLibrary page to work with local file browsing
- ✅ Both workflows running successfully (Frontend: port 5000, Server: port 3001)

### November 15, 2025 - Project Migration & Cleanup
- ✅ Migrated from Lovable to Replit environment
- ✅ Configured Vite to run on port 5000 with proper Replit host configuration
- ✅ **Removed Supabase dependencies** - Not needed for local-first architecture
- ✅ Cleaned up unused cloud-based pages (Index, Library, Upload, Watch, Embed, Folders)
- ✅ Added folder segregation feature with collapsible folder sections
- ✅ Implemented 5 sorting options: Folder (A-Z), Name (A-Z/Z-A), Date (Newest/Oldest)
- ✅ Folders now intelligently order based on selected sort option

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom dark cinematic theme
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router for client-side navigation
- **Video Player**: Plyr React for rich video playback with subtitle support

**Key Design Decisions:**
- Component-based architecture using React functional components and hooks
- No traditional database on frontend - all data fetched from local backend API
- TypeScript configuration relaxed (`strict: false`) for rapid development
- Dark theme as default with cinematic color palette (dark blues, cyan primary, purple accents)
- Responsive design with mobile-first approach

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js for HTTP server
- **File System**: Native Node.js `fs/promises` for async file operations

**Core Functionality:**
- Recursive directory scanning to discover video files
- Support for multiple video formats: MP4, MKV, AVI, MOV, WebM
- Automatic subtitle detection (.srt, .vtt files)
- Video streaming via HTTP endpoints
- CORS enabled for cross-origin access

**Design Rationale:**
- No database required - filesystem serves as the source of truth
- Videos never uploaded or moved - served directly from user's folders
- Configurable via environment variables (VIDEO_FOLDERS)
- Auto-refresh capability (frontend polls every 30 seconds)
- Stateless server design for simplicity

### Data Storage Solutions

**No Traditional Database:**
The application deliberately avoids using a database. Instead:
- Video metadata is generated on-the-fly by scanning the filesystem
- File system acts as the canonical data source
- Video titles derived from filenames
- Folder structure preserved and exposed through the API

**Rationale:**
- Eliminates sync issues between database and actual files
- Simplifies setup (no database installation needed)
- Videos remain in user's existing folder organization
- Real-time reflection of file system changes

### External Dependencies

**Frontend Dependencies:**
- **@tanstack/react-query**: Server state management and caching
- **plyr-react**: Feature-rich HTML5 video player
- **Radix UI**: Headless UI components for accessibility
- **lucide-react**: Icon library
- **react-router-dom**: Client-side routing
- **tailwindcss**: Utility-first CSS framework
- **sonner**: Toast notifications

**Backend Dependencies:**
- **express**: Web server framework
- **cors**: Cross-Origin Resource Sharing middleware
- **nodemon** (dev): Auto-restart during development

**Development Tools:**
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety (with relaxed rules)
- **ESLint**: Code linting
- **Replit deployment**: Configured for hosting on Replit platform

**Third-Party Integrations:**
- Video player supports standard HTML5 video capabilities
- Subtitle rendering via WebVTT/SRT standards

### API Architecture

**Backend Endpoints:**
- `GET /api/videos` - List all discovered videos
- `GET /api/videos/:id` - Get specific video metadata
- `GET /api/stream/:id` - Stream video file
- `GET /api/subtitles/:id/:filename` - Serve subtitle file
- `GET /api/health` - Server health check
- `GET /api/config/folders` - Get configured video folders
- `POST /api/config/folders` - Add new video folder

**Video ID Generation:**
Videos are identified by encoding their file path, allowing direct filesystem access while maintaining a clean URL structure.

### Deployment Strategy

**Local Deployment:**
- Frontend runs on port 5000 (Vite dev server) or 8080 (production)
- Backend runs on port 3001
- Environment-based API URL configuration

**Internet Exposure Options:**
- ngrok tunneling for quick public access
- Cloudflare Tunnel for free permanent URLs
- Port forwarding for self-hosting
- Replit hosting with configured allowed hosts

**Configuration:**
- `.env` file for backend video folder paths
- `VITE_API_URL` for frontend API endpoint
- Cross-platform path support (Windows, Mac, Linux)