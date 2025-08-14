# Spotify App Setup Instructions

## Create a Spotify Application

Before you can use this app, you need to create a Spotify application to get your Client ID.

### Step 1: Go to Spotify Developer Dashboard
1. Open your browser and go to: https://developer.spotify.com/dashboard
2. Log in with your Spotify account (create one if you don't have it)

### Step 2: Create a New App
1. Click **"Create app"** button
2. Fill in the app details:
   - **App name**: `Spotify Polaroid` (or any name you prefer)
   - **App description**: `A web app that generates mobile player and polaroid-style images from Spotify tracks`
   - **Website**: `http://localhost:5173` (for development)
   - **Redirect URI**: `http://localhost:5173/`
   - **Which API/SDKs are you planning to use?**: Select **"Web API"**

### Step 3: Get Your Client ID
1. After creating the app, you'll be taken to the app dashboard
2. Copy the **Client ID** (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 4: Configure Redirect URI
1. In your app dashboard, click **"Settings"**
2. Under **"Redirect URIs"**, make sure you have: `http://localhost:5173/`
3. If it's not there, click **"Add URI"** and add it
4. Click **"Save"**

### Step 5: Update Your Environment File
1. In your project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace `your_spotify_client_id_here` with your actual Client ID:
   ```
   VITE_SPOTIFY_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/
   ```

### Step 6: Start the Development Server
```bash
npm run dev
```

Your app should now be running at http://localhost:5173

## Important Notes

- **No Client Secret needed**: This app uses PKCE (Proof Key for Code Exchange) flow, which is more secure for client-side applications and doesn't require a client secret.

- **Redirect URI must match exactly**: The redirect URI in your Spotify app settings must exactly match the one in your `.env` file, including the trailing slash.

- **Multiple Templates**: The app offers both a mobile player template and a polaroid-style template, with dynamic color extraction from album artwork.

- **High-Quality Images**: The app generates high-resolution images using dom-to-image for best quality results.

- **Development only**: The current setup is for development. For production, you'll need to:
  - Update the redirect URI to your production domain
  - Update the `VITE_SPOTIFY_REDIRECT_URI` in your environment variables

## Troubleshooting

### "Invalid client" error
- Make sure your Client ID is correct in the `.env` file
- Restart the development server after changing environment variables

### "Invalid redirect URI" error
- Check that the redirect URI in your Spotify app settings exactly matches `http://localhost:5173/`
- Make sure there's a trailing slash

### Authentication errors after login
- The app has robust error handling for authentication issues
- If you see an error about failed authentication, try refreshing the page
- The app will automatically manage authentication state to prevent duplicate token requests

### App not loading
- Make sure you've installed dependencies: `npm install`
- Check that the development server is running on port 5173
- Try clearing your browser cache

### Image generation issues
- Ensure you have the latest dom-to-image package installed: `npm install dom-to-image --save`
- Check browser console for any errors related to image generation

## Testing the App

1. Open http://localhost:5173 in your browser
2. Click "Connect with Spotify"
3. Log in with your Spotify account and authorize the app
4. You'll be redirected back to the app
5. Enter a Spotify track URL (e.g., copy a link from the Spotify app)
6. Click "Fetch Track" to load the song data
7. Select your preferred template (Mobile or Polaroid style)
8. Adjust the playback position if desired
9. Click "Download PNG" (or "Save Polaroid") to save your image
