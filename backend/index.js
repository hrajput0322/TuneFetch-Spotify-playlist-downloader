import express from 'express';
import { downloadSongs } from 'song-downloader';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { songs } = req.body;
  
  try {
    await downloadSongs(undefined, songs);
    res.status(200).send('Downloaded successfully');
  } catch (error) {
    console.error('Error downloading songs:', error);
    res.status(500).send('Error downloading songs');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
