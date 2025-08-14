# Project Structure and Implementation Details

## Overview
This is a complete Spotify-style poster generator built with React, Vite, and Tailwind CSS. The application uses Spotify's PKCE authentication flow to fetch track data and renders pixel-perfect poster images that can be downloaded as PNG files.

## File Structure
```
src/
├── auth.js           # Spotify PKCE authentication utilities
├── utils.js          # Utility functions (parsing, formatting, API calls)
├── SpotifyCanvas.jsx # Canvas rendering component with multiple templates
├── SpotifyFonts.css  # Custom fonts for Spotify-accurate typography
├── App.jsx           # Main application component with UI and state management
├── main.jsx          # React entry point
└── index.css         # Global styles with Tailwind imports

Root files:
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.cjs # PostCSS configuration
├── .eslintrc.cjs     # ESLint configuration
├── .env              # Environment variables (create from .env.example)
├── .env.example      # Environment template
├── .gitignore        # Git ignore rules
├── README.md         # Project documentation
└── SPOTIFY_SETUP.md  # Spotify app setup instructions
```

## Key Features Implemented

### 1. Authentication (auth.js)
- **PKCE Flow**: Secure authentication without client secret
- **Token Management**: Automatic refresh and persistence
- **Error Handling**: Graceful handling of auth failures
- **Auth State Tracking**: Prevents duplicate token requests and improves reliability

### 2. Input Processing (utils.js)
- **Flexible Input**: Accepts URLs, URIs, and raw track IDs
- **API Integration**: Fetches track data with proper error handling
- **Image Utilities**: Loads and processes album artwork

### 3. Image Generation (SpotifyCanvas.jsx)
- **High-Resolution**: 2x scale factor for crisp image output
- **Multiple Templates**: Mobile player, Polaroid style, and Spotify Code options
- **Dynamic Color Extraction**: Auto-extracts colors from album art for personalized gradients
- **Pixel-Perfect Design**: Exact recreation of Spotify's mobile player
- **Dynamic Content**: Real album artwork and track information
- **Interactive Time**: Adjustable playback position
- **DOM-to-Image Rendering**: High-quality image generation with proper styling preservation
- **Spotify Code Generation**: Procedural barcode generation based on track ID

### 4. User Interface (App.jsx)
- **Responsive Layout**: Two-column desktop, stacked mobile
- **Template Selection**: Choose between Mobile player or Polaroid style
- **Real-time Updates**: Live preview as you adjust settings
- **Error Handling**: User-friendly error messages with detailed diagnostics
- **State Management**: Comprehensive React state handling
- **Authentication Resilience**: Robust error recovery for auth flows

## Design Specifications

### Mobile Player Layout
1. **Header Section** (0-120px):
   - Dark gradient background
   - "PLAYING FROM ALBUM" text
   - Album name
   - Down arrow and kebab menu icons

2. **Album Artwork** (140-540px):
   - White rounded card container
   - Square album image with rounded corners
   - Centered positioning

3. **Track Information** (560-620px):
   - Track title (large, bold)
   - Artist names (lighter gray)
   - Green check badge

4. **Progress Section** (700-780px):
   - Progress bar with Spotify green fill
   - Current and total time labels

5. **Controls** (850-950px):
   - Five control icons including large central play button
   - Shuffle, Previous, Play, Next, Devices

6. **Bottom Section** (1400-1600px):
   - Share and More icons
   - Lyrics tab preview

### Polaroid Layout
- **Image Area**: Album artwork centered with appropriate scaling
- **Caption Area**: Track name and artists in bottom section
- **Clean Design**: Modern interpretation of polaroid format
- **Dynamic Colors**: Background uses colors extracted from album artwork

### Color Scheme
- **Mobile Background**: Dynamic gradient based on album art colors
- **Polaroid Background**: White frame with album art color gradient for image area
- **Primary Green**: #1DB954 (Spotify brand color)
- **White Text**: #FFFFFF for primary content
- **Gray Text**: rgba(255,255,255,0.7) for secondary content
- **Progress Background**: rgba(255,255,255,0.18)

## API Integration

### Spotify Web API Endpoints Used
- **Token Endpoint**: `https://accounts.spotify.com/api/token`
- **Track Endpoint**: `https://api.spotify.com/v1/tracks/{id}`

### Data Extracted
- Track name, artists, album name
- Album artwork (best quality ≥512px)
- Track duration in milliseconds
- No additional scopes required

## Browser Compatibility

### Image Generation Features
- High-quality PNG export via dom-to-image library
- 2x scale factor for high DPI output
- Preserves CSS effects and transforms
- Multiple template options with consistent styling

### Modern Web APIs
- Crypto API for PKCE code generation
- Fetch API for HTTP requests
- Local Storage for token persistence

## Performance Optimizations

1. **Image Loading**: Async loading with error fallbacks
2. **Efficient Color Extraction**: Optimized algorithm for album art analysis
3. **Component Optimization**: Proper React hooks usage
4. **Bundle Size**: Tree-shaking enabled via Vite
5. **Dynamic Imports**: Load dom-to-image only when needed

## Security Features

1. **PKCE Authentication**: No client secret exposure
2. **Token Refresh**: Automatic token renewal
3. **Input Validation**: Sanitized track ID parsing
4. **CORS Handling**: Proper cross-origin image loading
5. **Auth State Tracking**: Prevents token replay attacks and duplicate requests

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Environment Configuration

Required environment variables:
- `VITE_SPOTIFY_CLIENT_ID`: Your Spotify app client ID
- `VITE_SPOTIFY_REDIRECT_URI`: Callback URL (http://localhost:5173/ for dev)

## Error Handling

The application handles various error scenarios:
- Invalid track IDs or URLs
- Network failures
- Authentication expiration
- Rate limiting (429 errors)
- Missing album artwork
- Browser compatibility issues
- Duplicate authentication attempts
- Code verifier storage issues
- Authentication flow interruptions

## Current Features

1. **Multiple Templates**:
   - Mobile Player Style: Recreates Spotify's mobile interface
   - Polaroid Style: Clean, modern take on the classic polaroid format

2. **Dynamic Color Extraction**: Automatically analyzes album art to create personalized color schemes

3. **High-Quality Image Export**: Generates crisp, detailed images using dom-to-image

4. **Fully Client-Side**: No server required, works entirely in the browser

## Future Enhancements

Potential improvements:
1. **Additional Templates**: More poster and card styles
2. **Custom Fonts**: Load Spotify's Circular font
3. **Batch Processing**: Generate multiple posters
4. **Social Sharing**: Direct sharing to social platforms
5. **Animation**: Animated GIF generation
6. **Playlists**: Support for playlist artwork

## Deployment Notes

For production deployment:
1. Update redirect URI in Spotify app settings
2. Update `VITE_SPOTIFY_REDIRECT_URI` environment variable
3. Build with `npm run build`
4. Serve the `dist/` folder with a static file server
5. Ensure HTTPS for production (required by Spotify)
