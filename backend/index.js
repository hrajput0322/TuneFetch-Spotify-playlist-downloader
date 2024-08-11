const express = require('express');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;
const DEFAULT_API_KEY = process.env.YOUTUBE_API_KEY;

app.use(cors());
app.use(express.json());

ffmpeg.setFfmpegPath(ffmpegPath);

async function fetchYouTubeLinks(api_key, songNames) {
  try {
    const youtubeLinks = await Promise.all(
      songNames.map(async (songName) => {
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              q: songName,
              part: "snippet",
              key: api_key,
              type: "video",
              maxResults: 1,
            },
          }
        );
        if (response.data.items.length > 0) {
          const videoId = response.data.items[0].id.videoId;
          return { songName, url: `https://www.youtube.com/watch?v=${videoId}` };
        } else {
          return { songName, url: `No video found for ${songName}` };
        }
      })
    );
    return youtubeLinks;
  } catch (error) {
    console.error("Error fetching YouTube links:", error);
    throw new Error("Internal server error");
  }
}

async function downloadAudio(url, outputFilePath) {
  return new Promise((resolve, reject) => {
    youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputFilePath,
    })
      .then(() => {
        console.log(`${path.basename(outputFilePath)} download finished.`);
        resolve();
      })
      .catch(err => {
        console.error(`Error downloading ${path.basename(outputFilePath)}: ${err.message}`);
        reject(err);
      });
  });
}

async function downloadMultipleAudios(urlsAndNames, downloadPath) {
  for (const { songName, url } of urlsAndNames) {
    if (url.startsWith('No video found')) {
      console.error(url);
      continue;
    }
    console.log(url);
    const sanitizedSongName = songName.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_');
    const outputFilePath = path.join(downloadPath, `${sanitizedSongName}.mp3`);
    try {
      await downloadAudio(url, outputFilePath);
    } catch (error) {
      console.error(`Failed to download ${url}: ${error.message}`);
    }
  }
}

async function downloadYouTubeAudios(api_key, songNames) {
  try {
    const youtubeLinks = await fetchYouTubeLinks(api_key, songNames);
    const downloadPath = path.join('C:\\', 'downloads');
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }

    await downloadMultipleAudios(youtubeLinks, downloadPath);
    return { message: "Download completed successfully." };
  } catch (error) {
    console.error("Error during download process:", error);
    throw new Error("Failed to download audios");
  }
}

app.post('/download', async (req, res) => {
  const { songs } = req.body;

  try {
    const result = await downloadYouTubeAudios(DEFAULT_API_KEY, songs);
    res.status(200).send(result.message);
  } catch (error) {
    console.error('Error downloading songs:', error);
    res.status(500).send('Error downloading songs');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
