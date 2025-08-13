import { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { downloadCanvasAsPNG, loadImage, formatDuration } from './utils.js';

const CANVAS_WIDTH = 390;
const CANVAS_HEIGHT = 844;

// SVG icons as data URLs
const icons = {
  downArrow: "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10L12 15L17 10' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  kebab: "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1' fill='white'/%3E%3Ccircle cx='12' cy='5' r='1' fill='white'/%3E%3Ccircle cx='12' cy='19' r='1' fill='white'/%3E%3C/svg%3E",
  shuffle: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 3H13L16 6M16 3L13 6M16 3V6M4 17L8 13M4 3L16 17M8 7L4 3' stroke='%23b3b3b3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  previous: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 5L10 10L15 15V5Z' fill='%23b3b3b3'/%3E%3Cpath d='M5 5H7V15H5V5Z' fill='%23b3b3b3'/%3E%3C/svg%3E",
  next: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 5L10 10L5 15V5Z' fill='%23b3b3b3'/%3E%3Cpath d='M13 5H15V15H13V5Z' fill='%23b3b3b3'/%3E%3C/svg%3E",
  devices: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='2' y='3' width='12' height='8' rx='1' stroke='%23b3b3b3' stroke-width='1.5'/%3E%3Cpath d='M6 15L10 15' stroke='%23b3b3b3' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M8 11V15' stroke='%23b3b3b3' stroke-width='1.5'/%3E%3Crect x='15' y='6' width='3' height='5' rx='0.5' stroke='%23b3b3b3' stroke-width='1.5'/%3E%3C/svg%3E",
  share: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 12V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V12M8 6L10 4L12 6M10 4V12' stroke='%23b3b3b3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  check: "data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.5 4.5L6 12L2.5 8.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
};

// Helper function to draw rounded rectangles (fallback for older browsers)
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const SpotifyCanvas = ({ trackData, currentTimeMs }) => {
  const canvasRef = useRef(null);

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !trackData) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background - darker, more accurate to Spotify
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#121212');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Top section with header
    const headerHeight = 80;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, headerHeight);

    // Header text - "PLAYING FROM ALBUM"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYING FROM ALBUM', CANVAS_WIDTH / 2, 25);

    // Album name in header
    ctx.fillStyle = 'white';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText(trackData.albumName, CANVAS_WIDTH / 2, 45);

    // Header icons
    try {
      const downArrowImg = await loadImage(icons.downArrow);
      const kebabImg = await loadImage(icons.kebab);
      ctx.drawImage(downArrowImg, 16, 18, 20, 20);
      ctx.drawImage(kebabImg, CANVAS_WIDTH - 36, 18, 20, 20);
    } catch (error) {
      console.warn('Failed to load header icons:', error);
    }

    // Album artwork section - much larger and more prominent
    const albumSection = {
      y: headerHeight + 30,
      cardSize: CANVAS_WIDTH - 60, // Much larger
      padding: 12
    };

    const albumCardX = (CANVAS_WIDTH - albumSection.cardSize) / 2;

    // Album card background (white rounded rectangle)
    ctx.fillStyle = 'white';
    drawRoundedRect(ctx, albumCardX, albumSection.y, albumSection.cardSize, albumSection.cardSize, 12);
    ctx.fill();

    // Album artwork
    if (trackData.albumImage) {
      try {
        const albumImg = await loadImage(trackData.albumImage);
        ctx.save();
        const artworkSize = albumSection.cardSize - (albumSection.padding * 2);
        drawRoundedRect(ctx, albumCardX + albumSection.padding, albumSection.y + albumSection.padding, artworkSize, artworkSize, 8);
        ctx.clip();
        ctx.drawImage(albumImg, albumCardX + albumSection.padding, albumSection.y + albumSection.padding, artworkSize, artworkSize);
        ctx.restore();
      } catch (error) {
        console.warn('Failed to load album image:', error);
        // Draw placeholder
        ctx.fillStyle = '#f0f0f0';
        const artworkSize = albumSection.cardSize - (albumSection.padding * 2);
        drawRoundedRect(ctx, albumCardX + albumSection.padding, albumSection.y + albumSection.padding, artworkSize, artworkSize, 8);
        ctx.fill();
      }
    }

    // Track information section
    const trackInfoY = albumSection.y + albumSection.cardSize + 40;

    // Track title - larger and bolder
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'left';

    const titleX = 30;
    const titleText = trackData.name;
    const titleMetrics = ctx.measureText(titleText);
    ctx.fillText(titleText, titleX, trackInfoY);

    // Green check badge - positioned better
    const checkBadgeX = titleX + titleMetrics.width + 16;
    const checkBadgeY = trackInfoY - 16;
    ctx.fillStyle = '#1DB954';
    ctx.beginPath();
    ctx.arc(checkBadgeX, checkBadgeY, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Check icon
    try {
      const checkImg = await loadImage(icons.check);
      ctx.drawImage(checkImg, checkBadgeX - 6, checkBadgeY - 6, 12, 12);
    } catch (error) {
      console.warn('Failed to load check icon:', error);
    }

    // Artist names - better positioned
    const artistY = trackInfoY + 32;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(trackData.artists.join(', '), titleX, artistY);

    // Progress bar section - positioned lower
    const progressY = CANVAS_HEIGHT - 280;
    const progressBarWidth = CANVAS_WIDTH - 60;
    const progressBarX = 30;
    const progressBarHeight = 4;

    // Progress bar background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    drawRoundedRect(ctx, progressBarX, progressY, progressBarWidth, progressBarHeight, 2);
    ctx.fill();

    // Progress bar filled portion
    const progress = currentTimeMs / trackData.durationMs;
    const filledWidth = progressBarWidth * progress;
    ctx.fillStyle = '#1DB954';
    drawRoundedRect(ctx, progressBarX, progressY, filledWidth, progressBarHeight, 2);
    ctx.fill();

    // Time labels
    const currentTimeText = formatDuration(currentTimeMs);
    const totalTimeText = formatDuration(trackData.durationMs);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(currentTimeText, progressBarX, progressY + 22);
    ctx.textAlign = 'right';
    ctx.fillText(totalTimeText, progressBarX + progressBarWidth, progressY + 22);

    // Playback controls - positioned properly
    const controlsY = progressY + 60;
    const centerX = CANVAS_WIDTH / 2;

    // Control icons with proper spacing
    const iconSpacing = 60;

    try {
      const shuffleImg = await loadImage(icons.shuffle);
      const previousImg = await loadImage(icons.previous);
      const nextImg = await loadImage(icons.next);
      const devicesImg = await loadImage(icons.devices);

      // Shuffle icon
      ctx.drawImage(shuffleImg, centerX - iconSpacing * 2, controlsY - 10, 20, 20);

      // Previous icon
      ctx.drawImage(previousImg, centerX - iconSpacing, controlsY - 10, 20, 20);

      // Next icon
      ctx.drawImage(nextImg, centerX + iconSpacing - 20, controlsY - 10, 20, 20);

      // Devices icon
      ctx.drawImage(devicesImg, centerX + iconSpacing * 2 - 20, controlsY - 10, 20, 20);
    } catch (error) {
      console.warn('Failed to load control icons:', error);
    }

    // Central play button - larger and more prominent
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, controlsY, 28, 0, 2 * Math.PI);
    ctx.fill();

    // Play triangle - properly centered
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(centerX - 6, controlsY - 10);
    ctx.lineTo(centerX - 6, controlsY + 10);
    ctx.lineTo(centerX + 10, controlsY);
    ctx.closePath();
    ctx.fill();

    // Bottom icons (Share and More) - positioned better
    const bottomIconsY = CANVAS_HEIGHT - 120;
    try {
      const shareImg = await loadImage(icons.share);
      const moreImg = await loadImage(icons.kebab);

      ctx.drawImage(shareImg, CANVAS_WIDTH - 80, bottomIconsY, 18, 18);
      ctx.drawImage(moreImg, CANVAS_WIDTH - 50, bottomIconsY, 18, 18);
    } catch (error) {
      console.warn('Failed to load bottom icons:', error);
    }

    // Lyrics tab (bottom sheet peek) - more realistic
    const lyricsTabY = CANVAS_HEIGHT - 60;
    const lyricsTabWidth = 80;
    const lyricsTabHeight = 32;
    const lyricsTabX = (CANVAS_WIDTH - lyricsTabWidth) / 2;

    ctx.fillStyle = 'rgba(40, 40, 40, 0.9)';
    drawRoundedRect(ctx, lyricsTabX, lyricsTabY, lyricsTabWidth, lyricsTabHeight, 16);
    ctx.fill();

    // Lyrics text
    ctx.fillStyle = 'white';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lyrics', CANVAS_WIDTH / 2, lyricsTabY + 20);
  }, [trackData, currentTimeMs]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    if (canvasRef.current && trackData) {
      downloadCanvasAsPNG(canvasRef.current, trackData.name);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-3xl shadow-2xl border border-gray-800"
          style={{
            aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
            maxWidth: '320px',
            backgroundColor: '#121212',
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05)
            `
          }}
        />
        {/* Mobile phone frame effect */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(255,255,255,0.1) 0%,
                transparent 50%,
                rgba(0,0,0,0.1) 100%
              )
            `
          }}
        />
      </div>
      {trackData && (
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-spotify-green text-white font-semibold rounded-full hover:bg-green-500 transition-colors"
        >
          Download PNG
        </button>
      )}
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
