import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Spotify-style color extraction based on Reddit community insights
const extractColorsFromImage = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Use smaller canvas for performance (64x64 is typical)
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      
      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Extract and analyze colors
        const colorFrequency = new Map();
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha > 128) {
            const hsl = rgbToHsl(r, g, b);
            
            // Apply Spotify's filtering logic:
            // - Exclude very dark colors (lightness < 0.1)
            // - Exclude very light colors (lightness > 0.9)
            // - Exclude very desaturated colors (saturation < 0.3)
            // - Prefer medium lightness values (0.3-0.7 range)
            if (hsl.l > 0.1 && hsl.l < 0.9 && hsl.s > 0.3) {
              // Create a simplified color key for frequency counting
              const colorKey = `${Math.round(r/10)*10}-${Math.round(g/10)*10}-${Math.round(b/10)*10}`;
              
              if (!colorFrequency.has(colorKey)) {
                colorFrequency.set(colorKey, {
                  count: 0,
                  r, g, b,
                  saturation: hsl.s,
                  lightness: hsl.l,
                  hue: hsl.h
                });
              }
              colorFrequency.get(colorKey).count++;
            }
          }
        }
        
        const dominantColors = findSpotifyStyleColors(colorFrequency);
        resolve(dominantColors);
      } catch (error) {
        console.error('Error extracting colors:', error);
        resolve(getDefaultColors());
      }
    };
    
    img.onerror = () => resolve(getDefaultColors());
    img.src = imageUrl;
  });
};

// Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h, s, l };
};

// Spotify-style color selection using frequency + saturation scoring
const findSpotifyStyleColors = (colorFrequency) => {
  if (colorFrequency.size === 0) return getDefaultColors();
  
  // Convert to array and score each color
  const scoredColors = Array.from(colorFrequency.values()).map(color => {
    // Reddit insight: "best ratio of saturation to frequency"
    // Also prefer medium lightness values (0.4-0.6 range gets bonus)
    const lightnessBonus = (color.lightness >= 0.3 && color.lightness <= 0.7) ? 1.5 : 1;
    
    // Score = frequency * saturation * lightness_bonus
    const score = color.count * color.saturation * lightnessBonus;
    
    return { ...color, score };
  });
  
  // Sort by score (highest first)
  scoredColors.sort((a, b) => b.score - a.score);
  
  // Take the best scoring color
  const primaryColor = scoredColors[0];
  
  if (!primaryColor) return getDefaultColors();
  
  const primary = {
    r: Math.floor(primaryColor.r),
    g: Math.floor(primaryColor.g),
    b: Math.floor(primaryColor.b)
  };
  
  // Create secondary color - much darker version
  const secondary = {
    r: Math.max(16, Math.floor(primary.r * 0.15)),
    g: Math.max(16, Math.floor(primary.g * 0.15)),
    b: Math.max(16, Math.floor(primary.b * 0.15))
  };
  
  return { primary, secondary };
};

// Default fallback colors (Spotify-like grays)
const getDefaultColors = () => ({
  primary: { r: 83, g: 83, b: 83 },
  secondary: { r: 18, g: 18, b: 18 }
});

// Spotify Icons extracted from the official Spotify web player
const SpotifyIcons = {
  ChevronDown: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 24 24" className="fill-current" style={{ width: '20px', height: '20px' }}>
      <path d="M2.793 8.043a1 1 0 0 1 1.414 0L12 15.836l7.793-7.793a1 1 0 1 1 1.414 1.414L12 18.664 2.793 9.457a1 1 0 0 1 0-1.414" />
    </svg>
  ),
  MoreVertical: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 24 24" className="fill-current" style={{ width: '20px', height: '20px' }}>
      <path d="M12 16.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m0-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m0-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3" />
    </svg>
  ),
  Shuffle: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z" />
      <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z" />
    </svg>
  ),
  SkipBack: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z" />
    </svg>
  ),
  Play: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
    </svg>
  ),
  SkipForward: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z" />
    </svg>
  ),
  Repeat: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75z" />
    </svg>
  ),
  AddToLiked: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 24 24" className="fill-current">
      <path d="M11.999 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m-11 9c0-6.075 4.925-11 11-11s11 4.925 11 11-4.925 11-11 11-11-4.925-11-11" />
      <path d="M17.999 12a1 1 0 0 1-1 1h-4v4a1 1 0 1 1-2 0v-4h-4a1 1 0 1 1 0-2h4V7a1 1 0 1 1 2 0v4h4a1 1 0 0 1 1 1" />
    </svg>
  ),
  Queue: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M15 15H1v-1.5h14zm0-4.5H1V9h14zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5m2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2z" />
    </svg>
  ),
  Heart: () => (
    <svg role="img" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
      <path d="M15.724 4.22A4.313 4.313 0 0012.192.814a4.269 4.269 0 00-3.622 1.13.837.837 0 01-1.14 0 4.272 4.272 0 00-6.21 5.855l5.916 7.05a1.128 1.128 0 001.727 0l5.916-7.05a4.228 4.228 0 00.945-3.577z" />
    </svg>
  )
};

const SpotifyCanvas = ({ trackData, currentTimeMs }) => {
  const posterRef = useRef(null);
  const [backgroundColors, setBackgroundColors] = useState(getDefaultColors());

  // Extract colors from album art when trackData changes
  useEffect(() => {
    if (trackData?.albumImage) {
      extractColorsFromImage(trackData.albumImage)
        .then(colors => {
          setBackgroundColors(colors);
        })
        .catch(error => {
          console.error('Failed to extract colors:', error);
        });
    }
  }, [trackData?.albumImage]);

  const handleDownload = async () => {
    if (!posterRef.current || !trackData) return;

    try {
      // Dynamic import to avoid bundling html2canvas if not needed
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#121212',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `${trackData.name || 'spotify-poster'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to generate poster:', error);
    }
  };

  if (!trackData) return null;

  const progress = Math.max(0, Math.min(100, (currentTimeMs / trackData.durationMs) * 100));
  const currentTime = formatTime(currentTimeMs);
  const totalTime = formatTime(trackData.durationMs);

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Create dynamic gradient based on extracted colors
  const dynamicGradient = `linear-gradient(to bottom, 
    rgb(${backgroundColors.primary.r}, ${backgroundColors.primary.g}, ${backgroundColors.primary.b}), 
    rgb(${backgroundColors.secondary.r}, ${backgroundColors.secondary.g}, ${backgroundColors.secondary.b}))`;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Spotify Poster */}
      <div
        ref={posterRef}
        className="relative p-6 flex flex-col rounded-3xl shadow-2xl overflow-hidden spotify-ui"
        style={{
          width: '360px',
          height: '780px',
          background: dynamicGradient
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 text-white">
          <div className="w-5 h-5">
            <SpotifyIcons.ChevronDown />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <div className="text-[10px] text-gray-300 uppercase tracking-wide font-normal leading-tight">Playing from album</div>
            <div className="text-[12px] font-medium text-white leading-tight">{trackData.albumName || 'Unknown Album'}</div>
          </div>
          <div className="w-5 h-5">
            <SpotifyIcons.MoreVertical />
          </div>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full" >
            {trackData.albumImage ? (
              <img
                src={trackData.albumImage}
                alt={trackData.name}
                className="w-full aspect-square object-cover rounded-xl"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-4xl">♪</span>
              </div>
            )}
          </div>
        </div>

        {/* Song Info */}
        <div className="pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-white text-[20px] font-bold spotify-title leading-tight mb-1">{trackData.name || 'Unknown Track'}</h2>
              <p className="text-gray-300 text-base font-normal leading-tight">{trackData.artists?.join(', ') || 'Unknown Artist'}</p>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1">
              <div className="w-6 h-6 text-white">
                <SpotifyIcons.AddToLiked />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-600 rounded-full h-1 mb-2">
              <div className="bg-white h-1 rounded-full relative px-1" style={{ width: `${progress}%` }}>
                <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-300 text-[11px] font-normal">
              <span>{currentTime}</span>
              <span>{totalTime}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-8" >
            {/* Shuffle */}
            <div className="min-w-5 min-h-5 text-gray-300">
              <SpotifyIcons.Shuffle />
            </div>

            {/* Previous */}
            <div className="min-w-6 min-h-6 text-white">
              <SpotifyIcons.SkipBack />
            </div>

            {/* Play */}
            <div className="min-w-14 min-h-14 bg-white rounded-full flex items-center justify-center">
              <div className="w-7 h-7 text-black ml-1">
                <SpotifyIcons.Play />
              </div>
            </div>

            {/* Next */}
            <div className="min-w-6 min-h-6 text-white">
              <SpotifyIcons.SkipForward />
            </div>

            {/* Repeat */}
            <div className="min-w-5 min-h-5 text-gray-300">
              <SpotifyIcons.Repeat />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-6">
              {/* Share */}
              <svg className="min-w-4 min-h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>

              {/* Queue */}
              <div className="min-w-4 min-h-4 text-gray-300">
                <SpotifyIcons.Queue />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors spotify-ui"
      >
        Download PNG
      </button>
    </div>
  );
};

SpotifyCanvas.propTypes = {
  trackData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    artists: PropTypes.arrayOf(PropTypes.string).isRequired,
    albumName: PropTypes.string.isRequired,
    albumImage: PropTypes.string,
    durationMs: PropTypes.number.isRequired,
  }),
  currentTimeMs: PropTypes.number.isRequired,
};

export default SpotifyCanvas;
