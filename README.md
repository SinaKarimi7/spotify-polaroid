# Spotify Poster Generator

A client-side web application that generates beautiful Spotify-style poster images from track links. Built with React, Vite, and Tailwind CSS using Spotify's PKCE authentication flow.

## Features

- 🎵 **Track Input**: Accept Spotify URLs, URIs, or raw track IDs
- 🎨 **Pixel-Perfect Design**: Recreates Spotify's mobile player interface
- ⏱️ **Customizable Time**: Adjust the "paused at" moment with a slider
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🖼️ **High-Quality Export**: Download posters as PNG images
- 🔐 **Secure Authentication**: Uses Spotify's PKCE flow (no backend required)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/polaroid-spotify.git
   cd polaroid-spotify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://localhost:5173/` as a redirect URI
   - Copy your Client ID

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Spotify credentials:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

1. **Connect with Spotify**: Click the login button to authenticate
2. **Enter Track Info**: Paste any Spotify track URL, URI, or ID
3. **Fetch Track Data**: Click "Fetch Track" to load the song information
4. **Customize Time**: Use the slider to set the playback position
5. **Download**: Click "Download PNG" to save your poster

### Supported Input Formats

- **URL**: `https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`
- **URI**: `spotify:track:4iV5W9uYEdYUVa79Axb7Rh`
- **Track ID**: `4iV5W9uYEdYUVa79Axb7Rh`

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **HTML5 Canvas** - Image generation
- **Spotify Web API** - Track data and authentication

## Project Structure

```
src/
├── auth.js           # Spotify PKCE authentication
├── utils.js          # Utility functions (parsing, formatting, API calls)
├── SpotifyCanvas.jsx # Canvas rendering component
├── App.jsx           # Main application component
├── main.jsx          # React entry point
└── index.css         # Global styles
```

## Features in Detail

### Authentication
- Uses Spotify's PKCE (Proof Key for Code Exchange) flow
- No backend required - fully client-side
- Automatic token refresh
- Persistent login state

### Canvas Rendering
- Fixed 900x1600 pixel canvas for consistent quality
- High DPI support for crisp images
- Exact recreation of Spotify's mobile player UI
- Dynamic album artwork loading with fallbacks

### Responsive Design
- Two-column layout on desktop
- Stacked layout on mobile
- Optimized for various screen sizes

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Spotify for providing the Web API
- The iconic Spotify design that inspired this project
- The React and Vite communities for excellent tooling
