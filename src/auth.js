// Spotify PKCE Authentication utilities

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

// Generate a cryptographically random code_verifier and code_challenge for PKCE
function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2);
  crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Initiate Spotify login
export async function initiateSpotifyLogin() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store code_verifier in localStorage for persistence across redirects
  localStorage.setItem('code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: '', // No additional scopes needed for basic track info
  });
  
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  const codeVerifier = localStorage.getItem('code_verifier');
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  // Store tokens and expiry time
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
  localStorage.setItem(TOKEN_EXPIRY_KEY, Date.now() + (data.expires_in * 1000));
  
  // Clean up code verifier from storage
  localStorage.removeItem('code_verifier');
  
  return data.access_token;
}

// Refresh access token
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await response.json();
  
  // Update stored tokens
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
  localStorage.setItem(TOKEN_EXPIRY_KEY, Date.now() + (data.expires_in * 1000));
  
  return data.access_token;
}

// Get valid access token (refresh if needed)
export async function getValidAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired (with 5 minute buffer)
  if (expiry && Date.now() > (parseInt(expiry) - 5 * 60 * 1000)) {
    try {
      return await refreshAccessToken();
    } catch (error) {
      // If refresh fails, clear stored tokens
      clearTokens();
      return null;
    }
  }
  
  return token;
}

// Clear stored tokens
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// Check if user is authenticated
export function isAuthenticated() {
  return localStorage.getItem(TOKEN_KEY) !== null;
}
