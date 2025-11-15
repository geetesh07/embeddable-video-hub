# Videos Folder

Place your video files here. The server will automatically scan this folder and all subdirectories.

## Supported Formats
- .mp4
- .mkv
- .avi
- .mov
- .webm

## Adding Subtitles
Place subtitle files with the same name as your video:
- `myvideo.en.srt` - English subtitles
- `myvideo.es.srt` - Spanish subtitles
- `myvideo.fr.vtt` - French subtitles (VTT format)

## Folder Organization
You can organize videos in subfolders:
```
videos/
├── Movies/
│   ├── action/
│   └── comedy/
└── TV Shows/
    └── Season 1/
```

The server will recursively scan all folders and make videos available in the library.
