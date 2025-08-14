import { useState, useEffect } from 'react';
import { initiateSpotifyLogin, exchangeCodeForToken, isAuthenticated, clearTokens } from './auth.js';
import { parseTrackId, fetchTrackData, formatDuration } from './utils.js';
import SpotifyCanvas from './SpotifyCanvas.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [trackData, setTrackData] = useState(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0); // Default to 00:01
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('mobile');

  // Check authentication status on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError('Authentication failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    } else if (code) {
      handleAuthCallback(code);
    }
  }, []);

  const handleAuthCallback = async (code) => {
    try {
      setIsLoading(true);
      await exchangeCodeForToken(code);
      setIsLoggedIn(true);
      setError('');
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      console.error('Auth callback error:', error);
      setError('Failed to complete authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    initiateSpotifyLogin();
  };

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    setTrackData(null);
    setError('');
  };

  const handleFetchTrack = async () => {
    if (!trackInput.trim()) {
      setError('Please enter a Spotify track link, URI, or ID.');
      return;
    }

    const trackId = parseTrackId(trackInput.trim());
    if (!trackId) {
      setError('Invalid Spotify track format. Please use a valid track URL, URI, or ID.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const data = await fetchTrackData(trackId);
      setTrackData(data);
      // Reset time slider to default
      setCurrentTimeMs(0);
    } catch (error) {
      console.error('Fetch track error:', error);
      setError(error.message);
      if (error.message.includes('Authentication expired')) {
        setIsLoggedIn(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (e) => {
    setCurrentTimeMs(parseInt(e.target.value));
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFetchTrack();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-spotify-gray flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Spotify Poster Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Create beautiful poster-style images from your favorite Spotify tracks.
          </p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-spotify-green text-white py-3 px-6 rounded-full font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect with Spotify'}
          </button>
          <p className="text-xs text-gray-500 mt-4">
            No additional permissions required. We only need to read basic track information.
          </p>
        </div>

        {/* Custom slider styles */}
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #1DB954;
            cursor: pointer;
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #1DB954;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-spotify-gray text-white">
      <div className="container mx-auto px-4 py-8">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Spotify Poster Generator</h1>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Track Input</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="track-input" className="block text-sm font-medium mb-2">
                    Spotify Track Link, URI, or ID
                  </label>
                  <input
                    id="track-input"
                    type="text"
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    onKeyPress={handleInputKeyPress}
                    placeholder="https://open.spotify.com/track/... or spotify:track:... or track ID"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spotify-green"
                  />
                </div>

                <button
                  onClick={handleFetchTrack}
                  disabled={isLoading || !trackInput.trim()}
                  className="w-full bg-spotify-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Fetching Track...' : 'Fetch Track'}
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>

            {/* Controls displayed in a flex layout side by side */}
            {trackData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Time Slider */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Playback Position</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatDuration(currentTimeMs)}</span>
                      <span>{formatDuration(trackData.durationMs)}</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={trackData.durationMs}
                      step="1000"
                      value={currentTimeMs}
                      onChange={handleTimeChange}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />

                    <p className="text-sm text-gray-400">
                      Adjust the playback position shown in the poster
                    </p>
                  </div>
                </div>

                {/* Template Selector */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Poster Template</h3>

                  <div className="space-y-3">
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="template"
                          value="mobile"
                          checked={selectedTemplate === 'mobile'}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="mr-2 text-spotify-green focus:ring-spotify-green"
                        />
                        <span className="text-white">Mobile Player</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="template"
                          value="polaroid"
                          checked={selectedTemplate === 'polaroid'}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="mr-2 text-spotify-green focus:ring-spotify-green"
                        />
                        <span className="text-white">Polaroid Style</span>
                      </label>
                    </div>

                    <p className="text-sm text-gray-400">
                      Choose between mobile Spotify player or classic polaroid style
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Track Info */}
            {trackData && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Track Information</h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Title:</span>
                    <p className="font-medium">{trackData.name}</p>
                  </div>

                  <div>
                    <span className="text-gray-400">Artist(s):</span>
                    <p className="font-medium">{trackData.artists.join(', ')}</p>
                  </div>

                  <div>
                    <span className="text-gray-400">Album:</span>
                    <p className="font-medium">{trackData.albumName}</p>
                  </div>

                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <p className="font-medium">{formatDuration(trackData.durationMs)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Canvas Preview */}
          <div className="flex flex-col items-center">
            {trackData ? (
              <SpotifyCanvas
                trackData={trackData}
                currentTimeMs={currentTimeMs}
                template={selectedTemplate}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center w-full max-w-md">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Track Selected</h3>
                <p className="text-gray-400">
                  Enter a Spotify track link above to generate a poster
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1DB954;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1DB954;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default App;
