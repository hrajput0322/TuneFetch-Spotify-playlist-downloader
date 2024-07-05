import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

ffmpeg.setFfmpegPath(ffmpegPath);

const DEFAULT_API_KEY = 'AIzaSyApHXT27iuzXIkutARnt75KfUE3sGEJnoE';

// Resolve __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function DownloadSongs(api_key = DEFAULT_API_KEY, songNames) {
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
    return Error("Internal server error");
  }
}

async function downloadAudio(url, outputFilePath) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url)
      .then(info => {
        const audioFormat = ytdl.filterFormats(info.formats, 'audioonly')[0];
        if (!audioFormat) {
          return reject(new Error('No audio format found for this video.'));
        }

        const stream = ytdl.downloadFromInfo(info, { format: audioFormat });

        ffmpeg(stream)
          .audioBitrate(audioFormat.audioBitrate)
          .save(outputFilePath)
          .on('progress', (progress) => {
            console.log(`Downloading ${path.basename(outputFilePath)}: ${progress.targetSize}kb downloaded`);
          })
          .on('end', () => {
            console.log(`${path.basename(outputFilePath)} download finished.`);
            resolve();
          })
          .on('error', (err) => {
            console.error(`Error downloading ${path.basename(outputFilePath)}: ${err.message}`);
            reject(err);
          });
      })
      .catch(err => reject(err));
  });
}

async function downloadMultipleAudios(urlsAndNames, downloadPath) {
  for (const { songName, url } of urlsAndNames) {
    if (url.startsWith('No video found')) {
      console.error(url);
      continue;
    }
    console.log(url);
    const sanitizedSongName = songName.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_'); // Replace invalid filename characters
    const outputFilePath = path.join(downloadPath, `${sanitizedSongName}.mp3`);
    try {
      await downloadAudio(url, outputFilePath);
    } catch (error) {
      console.error(`Failed to download ${url}: ${error.message}`);
    }
  }
}

async function downloadYouTubeAudios(youtubeLinks) {
  if (!youtubeLinks || !Array.isArray(youtubeLinks)) {
    return Error("Invalid input. Please provide an array of YouTube URLs.");
  }

  try {
    // Specify the download path to be C:\downloads
    const downloadPath = path.join('C:\\', 'downloads');
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }

    await downloadMultipleAudios(youtubeLinks, downloadPath);
    return { message: "Download completed successfully." };
  } catch (error) {
    return { error: `Failed to download audios: ${error.message}` };
  }
}

export async function downloadSongs(DEFAULT_API_KEY, songNames) {
  DownloadSongs(DEFAULT_API_KEY, songNames)
    .then(async links => {
      console.log('YouTube Links:', links);
      const downloadResult = await downloadYouTubeAudios(links);
      if (downloadResult.error) {
        console.error(downloadResult.error);
      } else {
        console.log(downloadResult.message);
      }
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
