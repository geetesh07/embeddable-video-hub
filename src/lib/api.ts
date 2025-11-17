// Local server API client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Video {
  id: string;
  title: string;
  filename: string;
  path: string;
  relativePath?: string;
  folder?: string;
  size: number;
  format: string;
  modified: string;
  subtitles: Subtitle[];
  sourceFolder?: string;
}

export interface Subtitle {
  filename: string;
  path: string;
  language: string;
}

export interface Folder {
  name: string;
  path: string;
  modified: string;
}

export interface BrowseResult {
  folders: Folder[];
  videos: Video[];
  currentPath: string | null;
  error?: string;
}

export interface VideoProgress {
  watched: boolean;
  progress: number;
  completed: boolean;
  lastWatched: string | null;
}

class LocalAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async getVideos(): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/api/videos`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return response.json();
  }

  async getVideo(id: string): Promise<Video> {
    const response = await fetch(`${this.baseUrl}/api/videos/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    return response.json();
  }

  async browseFolders(path?: string): Promise<BrowseResult> {
    const url = path 
      ? `${this.baseUrl}/api/browse?path=${encodeURIComponent(path)}`
      : `${this.baseUrl}/api/browse`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to browse folder');
    }
    return response.json();
  }

  getVideoStreamUrl(id: string): string {
    return `${this.baseUrl}/api/stream/${id}`;
  }

  getSubtitleUrl(videoId: string, filename: string): string {
    return `${this.baseUrl}/api/subtitles/${videoId}/${filename}`;
  }

  async getConfigFolders(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/config/folders`);
    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }
    const data = await response.json();
    return data.folders;
  }

  async addFolder(folder: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/config/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder }),
    });
    if (!response.ok) {
      throw new Error('Failed to add folder');
    }
    const data = await response.json();
    return data.folders;
  }

  async removeFolder(folder: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/config/folders`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder }),
    });
    if (!response.ok) {
      throw new Error('Failed to remove folder');
    }
    const data = await response.json();
    return data.folders;
  }

  async healthCheck(): Promise<{ status: string; folders: number; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error('Server health check failed');
    }
    return response.json();
  }

  getThumbnailUrl(videoId: string): string {
    return `${this.baseUrl}/api/thumbnails/${videoId}.jpg`;
  }

  async generateThumbnail(videoId: string): Promise<{ success: boolean; thumbnail: string }> {
    const response = await fetch(`${this.baseUrl}/api/thumbnail/${videoId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to generate thumbnail');
    }
    return response.json();
  }

  async getNextVideos(videoId: string, limit: number = 5): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/api/videos/${videoId}/next?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch next videos');
    }
    return response.json();
  }

  async getAllProgress(): Promise<Record<string, VideoProgress>> {
    const response = await fetch(`${this.baseUrl}/api/progress`);
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    return response.json();
  }

  async getProgress(videoId: string): Promise<VideoProgress> {
    const response = await fetch(`${this.baseUrl}/api/progress/${videoId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch video progress');
    }
    return response.json();
  }

  async updateProgress(videoId: string, data: Partial<VideoProgress>): Promise<VideoProgress> {
    const response = await fetch(`${this.baseUrl}/api/progress/${videoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update progress');
    }
    return response.json();
  }

  async markComplete(videoId: string): Promise<VideoProgress> {
    const response = await fetch(`${this.baseUrl}/api/progress/${videoId}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to mark video as complete');
    }
    return response.json();
  }

  async resetProgress(videoId: string): Promise<VideoProgress> {
    const response = await fetch(`${this.baseUrl}/api/progress/${videoId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to reset progress');
    }
    return response.json();
  }
}

export const api = new LocalAPI();
