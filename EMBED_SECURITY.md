# Embed Security Documentation

## Overview

VideoHub implements Content Security Policy (CSP) `frame-ancestors` to control which websites can embed your videos in iframes. This prevents unauthorized websites from embedding your content.

## How It Works

### Security Mechanism

The server sets HTTP security headers on video streaming and HTML responses:

1. **CSP frame-ancestors**: Modern browser standard that specifies which domains can embed the content
2. **X-Frame-Options**: Legacy fallback for older browsers (only used when no domains are allowed)

### What's Protected

- `/api/stream/:id` - Video streaming endpoint (always protected)
- HTML responses - Embed page protection (production only)

### Configuration

Allowed embed domains are configured in `server/config.json`:

```json
{
  "folders": [...],
  "allowedEmbedDomains": [
    "https://lms.ntechnosolution.com"
  ]
}
```

## Managing Allowed Domains

### Via Settings UI

1. Navigate to Settings page
2. Find the "Embed Security" section
3. Add or remove domains using the interface
4. Domains must include `http://` or `https://`

### Via API

```javascript
// Get allowed domains
GET /api/config/embed-domains

// Add a domain
POST /api/config/embed-domains
Body: { "domain": "https://example.com" }

// Remove a domain
DELETE /api/config/embed-domains
Body: { "domain": "https://example.com" }
```

## Development vs Production

### Development (Current Setup)

- ✅ Video streaming (`/api/stream/:id`) is protected
- ⚠️ Embed HTML page served by Vite dev server (no CSP headers in dev)
- Videos won't load on unauthorized domains, but the HTML page itself isn't protected in dev

### Production Deployment

For full security in production, the built frontend must be served with CSP headers:

#### Option 1: Serve from Express

```javascript
// In server/index.js, add after other routes:
import path from 'path';

// Serve built React app
app.use(express.static(path.join(__dirname, '../dist')));

// Handle client-side routing
app.get('*', setEmbedSecurityHeaders, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

#### Option 2: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        
        # Add CSP headers for HTML responses
        add_header Content-Security-Policy "frame-ancestors 'self' https://lms.ntechnosolution.com;" always;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

## Testing Embed Security

### Test Allowed Domain

1. Add your test domain to allowed list
2. Create an HTML file:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Embed Test</h1>
  <iframe 
    src="https://your-domain.com/embed/VIDEO_ID" 
    width="1920" 
    height="1080" 
    frameborder="0" 
    allowfullscreen>
  </iframe>
</body>
</html>
```

3. Host this file on the allowed domain
4. Video should load successfully

### Test Blocked Domain

1. Host the same HTML on a domain NOT in the allowed list
2. Open browser console
3. You should see: `Refused to frame because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'self' https://lms.ntechnosolution.com"`
4. Video will not load

## Security Best Practices

1. **HTTPS Only**: Always use `https://` domains in production
2. **Specific Domains**: Don't use wildcards - list specific allowed domains
3. **Regular Review**: Periodically review and remove unused domains
4. **Monitor Logs**: Check server logs for blocked embedding attempts
5. **Test Before Deploy**: Always test embed security after deployment changes

## Troubleshooting

### Video Won't Load on Allowed Domain

1. Check domain is exactly correct (including `https://`)
2. Verify domain is in the allowed list (Settings > Embed Security)
3. Check browser console for CSP errors
4. Clear browser cache and try again

### All Domains Blocked

1. Check if allowed domains list is empty
2. Restart the server after adding domains
3. Verify server logs show: `Embed security enabled for: <domains>`

### Works in Dev but Not Production

1. Ensure built frontend is served with CSP headers
2. Check production server configuration
3. Verify headers are set on HTML responses (check Network tab)

## Technical Details

### Header Format

When allowed domains are configured:
```
Content-Security-Policy: frame-ancestors 'self' https://lms.ntechnosolution.com;
```

When no domains allowed:
```
Content-Security-Policy: frame-ancestors 'none';
X-Frame-Options: DENY
```

### Browser Support

- **CSP frame-ancestors**: All modern browsers (Chrome 40+, Firefox 33+, Safari 10+)
- **X-Frame-Options**: Legacy fallback for older browsers

## Additional Resources

- [MDN: frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [Content Security Policy Reference](https://content-security-policy.com/frame-ancestors/)
