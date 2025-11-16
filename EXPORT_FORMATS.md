# Export Formats Guide

VideoHub provides multiple export formats for your embed codes, making it easy to use them in different scenarios.

## Available Formats

### 1. HTML File (Formatted with Video Names)

**Best for:** Viewing in a web browser, sharing with team members

**Features:**
- Beautiful formatted HTML page with styling
- Each video shown in a card with:
  - 📹 Video title prominently displayed
  - Embed code in a code block
  - Resolution (1920x1080) and video format info
- Opens directly in any web browser
- Easy to print or save as PDF

**Example output:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Video Embed Codes</title>
    <style>
        /* Professional styling included */
    </style>
</head>
<body>
    <h1>Video Embed Codes (1920x1080)</h1>
    <p>Total Videos: 25</p>
    
    <div class="video-section">
        <div class="video-title">📹 Introduction to Course</div>
        <div class="embed-code">&lt;iframe src="..."&gt;&lt;/iframe&gt;</div>
        <div class="info">Resolution: 1920x1080 | Format: mp4</div>
    </div>
    <!-- More videos... -->
</body>
</html>
```

### 2. TXT File (Plain Text with Video Names)

**Best for:** Quick reference, documentation, copy-pasting

**Features:**
- Plain text format readable in any text editor
- Each video includes:
  - VIDEO: [clear video name]
  - FORMAT: [mp4, mkv, etc.]
  - RESOLUTION: 1920x1080
  - EMBED CODE: [full iframe code]
- Separated with clear dividers (80 dashes)
- Header with total count and generation date

**Example output:**
```
VIDEO EMBED CODES
Total Videos: 25
Generated: 11/16/2025, 12:30:45 PM
================================================================================

VIDEO: Introduction to Course
FORMAT: mp4
RESOLUTION: 1920x1080
EMBED CODE:
<iframe src="https://your-domain.com/embed/abc123" width="1920" height="1080"...></iframe>
--------------------------------------------------------------------------------

VIDEO: Chapter 1 - Getting Started
FORMAT: mp4
RESOLUTION: 1920x1080
EMBED CODE:
<iframe src="https://your-domain.com/embed/def456" width="1920" height="1080"...></iframe>
--------------------------------------------------------------------------------
```

### 3. CSV File (Excel-Compatible)

**Best for:** Spreadsheets, bulk operations, data analysis

**Features:**
- Opens directly in Microsoft Excel, Google Sheets, LibreOffice
- Columns:
  - **Video Title** - Full name of the video
  - **File Format** - mp4, mkv, avi, etc.
  - **Resolution** - Always 1920x1080
  - **Embed Code** - Complete iframe code
- Perfect for:
  - Sorting and filtering videos
  - Bulk editing (find & replace domain names)
  - Creating custom reports
  - Sharing with non-technical team members

**Example in Excel:**

| Video Title | File Format | Resolution | Embed Code |
|------------|-------------|------------|------------|
| Introduction to Course | mp4 | 1920x1080 | `<iframe src="..."></iframe>` |
| Chapter 1 - Getting Started | mp4 | 1920x1080 | `<iframe src="..."></iframe>` |
| Chapter 2 - Advanced Topics | mkv | 1920x1080 | `<iframe src="..."></iframe>` |

## How to Export

### Bulk Export (All Videos)

1. Go to **Bulk Embed Codes** page from the navigation menu
2. (Optional) Use search to filter specific videos
3. Click the **Download** button
4. Choose your preferred format:
   - HTML File (with video names)
   - TXT File (with video names)
   - CSV File (Excel-compatible)
5. File will download with all videos that match your search

### Folder Export (Specific Folder Videos)

1. Browse to the folder you want to export
2. Click **Get Embed Codes for This Folder** button
3. In the dialog, click the **Download** button
4. Choose your preferred format
5. File will download with only videos from that specific folder

## Use Cases

### For LMS Integration (Learning Management Systems)

**Recommended:** HTML or TXT format
- Copy individual codes or all codes
- Paste directly into your LMS HTML editor
- Video names help you organize content

### For Documentation

**Recommended:** TXT format
- Include in project documentation
- Easy to read and search
- Can be version-controlled in Git

### For Spreadsheet Management

**Recommended:** CSV format
- Track which videos are embedded where
- Bulk find & replace for domain changes
- Share with content managers
- Create custom video catalogs

### For Client Handoff

**Recommended:** HTML format
- Professional presentation
- Client can open in browser immediately
- No special software needed
- Can print or save as PDF

## Tips & Tricks

### Excel Power Users

1. Open CSV file in Excel
2. Use **Find & Replace** to update domain names in bulk
3. Filter by format to find specific video types
4. Sort by title to organize alphabetically
5. Add custom columns for tracking (e.g., "Published Date", "LMS Course")

### LMS Quick Paste

1. Download TXT format
2. Open in text editor
3. Use Ctrl+F to find specific video by name
4. Copy just that video's embed code
5. Paste into your LMS

### Backup Strategy

1. Export all videos as CSV monthly
2. Store in version control or cloud storage
3. Easy to restore or reference later
4. Track what was embedded where

## Technical Details

- **Character Encoding:** UTF-8 (supports all languages and special characters)
- **CSV Escaping:** Quotes properly escaped for Excel compatibility
- **HTML Entities:** Codes displayed safely in HTML format
- **Resolution:** All codes use 1920x1080 (Full HD)
- **Video Names:** Always clearly displayed before each code

## Need Help?

- Can't find a specific video? Use the search feature before exporting
- Want only certain folders? Use folder-specific export
- Need a different format? Let us know what you need!
