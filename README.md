# Video Demo
https://github.com/hrajput0322/TuneFetch-Spotify-playlist-downloader/assets/104441259/d6ffced9-d6c6-462c-8a80-f21e22de3fb0

# TuneFetch
TuneFetch is a versatile application that integrates with Spotify's API to enhance your music experience. It allows you to securely log in with your Spotify account, access your playlists, and download your favorite songs using a custom npm package called "Song Downloader".

## Features
- Spotify Integration: Log in securely with your Spotify credentials using OAuth 2.0 authentication.
- Playlist Management: Fetch and display your Spotify playlists directly within TuneFetch.
- Song Downloading: Use the Song Downloader npm package to download songs from your Spotify playlists effortlessly.
- Download Location: Songs are saved to the "downloads" folder on your C drive for easy access.

## Technologies Used
- Frontend: Built with React.js, Bootstrap for UI styling.
- Backend: Node.js with Express.js for server-side operations.
- API Integration: Utilizes Spotify API for fetching playlists and tracks.
- Custom npm Package: "Song Downloader" utilizes ytdl-core for fetching audio from YouTube and ffmpeg for audio conversion.

## Installation
To run TuneFetch locally:

Clone the repository:

```bash
git clone https://github.com/your-username/TuneFetch.git
cd TuneFetch
```
Install dependencies for both frontend and backend:

```bash
cd frontend
npm install
cd ../backend
npm install
```
Set up environment variables:

Create a .env file in the backend directory.
Define variables for Spotify API credentials and database connection details:
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```
Start the frontend and backend servers:

### In the frontend directory
```bash
npm start
```

### In the backend directory
```bash
node index.js
```
Open your browser and navigate to http://localhost:5173 to use TuneFetch.

## Usage
-> Login: Click on "Login with Spotify" to authenticate and access your Spotify playlists.
-> Playlist Selection: Choose a playlist to view its songs.
-> Download Songs: Click on the download button to download songs from the selected playlist using Song Downloader.
