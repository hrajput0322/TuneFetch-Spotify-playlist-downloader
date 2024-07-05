# song-downloader

A Node.js package to download songs.

## Installation

You can install this package using npm:

```bash
npm install song-downloader
```
## Usage (with API key)

```bash
import { downloadSongs } from 'song-downloader';

const DEFAULT_API_KEY = 'YOUR_YOUTUBE_API_KEY';

const songNames = ['perfect', 'let her go'];

downloadSongs(DEFAULT_API_KEY, songNames)
  .then(() => console.log('Downloaded successfully'))
  .catch((err) => console.error('Error:', err));
```

## Usage (without API key)

```bash
import { downloadSongs } from 'song-downloader';

const songNames = ['perfect', 'let her go'];

downloadSongs(undefined, songNames)
  .then(() => console.log('Downloaded successfully'))
  .catch((err) => console.error('Error:', err));
```

## API
downloadSongs(api_key: string, songNames: string[])
api_key (string): Your YouTube Data API v3 key.
songNames (string[]): An array of song names you want to download.

## Where will the songs be downloaded
The songs will be downloaded in the "C drive" of your computer under the folder named "downloads".

## Download Limit
There is a limit to the number of songs that can be downloaded because of the Youtube Data API v3.

## License
This project is licensed under the MIT License.

