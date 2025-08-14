// Utility functions for Spotify API and data processing

import { getValidAccessToken } from "./auth.js";

// Parse Spotify track ID from various input formats
export function parseTrackId(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();

  // Direct 22-character ID
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return trimmed;
  }

  // Spotify URI format: spotify:track:ID
  const uriMatch = trimmed.match(/spotify:track:([a-zA-Z0-9]{22})/);
  if (uriMatch) {
    return uriMatch[1];
  }

  // Spotify URL formats
  const urlMatch = trimmed.match(
    /open\.spotify\.com\/track\/([a-zA-Z0-9]{22})/
  );
  if (urlMatch) {
    return urlMatch[1];
  }

  return null;
}

// Convert milliseconds to mm:ss format
export function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Fetch track data from Spotify API
export async function fetchTrackData(trackId) {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("No valid access token available. Please log in again.");
  }

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please log in again.");
    } else if (response.status === 404) {
      throw new Error("Track not found. Please check the track ID.");
    } else if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else {
      throw new Error(`Failed to fetch track data: ${response.status}`);
    }
  }

  const data = await response.json();

  // Find the best album image (≥512px or largest available)
  let bestImage = null;
  if (data.album.images && data.album.images.length > 0) {
    bestImage =
      data.album.images.find((img) => img.width >= 512) || data.album.images[0]; // Fallback to largest available
  }

  return {
    id: data.id,
    name: data.name,
    artists: data.artists.map((artist) => artist.name),
    albumName: data.album.name,
    albumImage: bestImage?.url || null,
    durationMs: data.duration_ms,
  };
}

// Download canvas as PNG
export function downloadCanvasAsPNG(canvas, filename) {
  // Sanitize filename
  const sanitizedFilename =
    filename
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "spotify_poster";

  const link = document.createElement("a");
  link.download = `${sanitizedFilename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Load image and return promise
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
