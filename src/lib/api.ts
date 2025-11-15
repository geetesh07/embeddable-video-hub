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
}

export const api = new LocalAPI();
