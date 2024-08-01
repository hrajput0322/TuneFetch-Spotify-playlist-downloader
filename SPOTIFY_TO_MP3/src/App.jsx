import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [token, setToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
      token = new URLSearchParams(hash.substring(1)).get('access_token');
      window.location.hash = '';
      window.localStorage.setItem('token', token);
    }

    setToken(token);

    if (token) {
      fetchPlaylists(token);
    }
  }, []);

  const fetchPlaylists = (token) => {
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setPlaylists(data.items);
      })
      .catch(error => console.error('Error fetching playlists:', error));
  };

  const fetchTracks = (playlistId) => {
    if (selectedPlaylist === playlistId) {
      setSelectedPlaylist(null);
      setTracks([]);
      return;
    }
    
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setTracks(data.items);
        setSelectedPlaylist(playlistId);
      })
      .catch(error => console.error('Error fetching tracks:', error));
  };

  const handleLogin = () => {
    const clientId = '809ffee594af4fff849003463b1ebdc2';
    const redirectUri = 'http://localhost:5173';
    const scope = 'playlist-read-private';

    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token&show_dialog=true`;
  };

  const handleDownload = async () => {
    setLoading(true);
    const songNames = tracks.map(track => track.track.name);

    try {
      const response = await fetch('http://localhost:5000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songs: songNames })
      });

      if (response.ok) {
        toast.success('Playlist downloaded');
      } else {
        toast.error('Error downloading playlist');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error downloading playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="content">
        <h1>TuneFetch</h1>
        {!token ? (
          <button className="btn btn-custom" onClick={handleLogin}>
            Log In with Spotify
          </button>
        ) : (
          <div className="playlist-container">
            <h2>Your Playlists</h2>
            <div className="playlist-list">
              <ul className="list-group">
                {playlists && playlists.length > 0 && playlists.map(playlist => (
                  <li key={playlist.id} className="list-group-item playlist-item">
                    <button 
                      className="btn btn-link playlist-name" 
                      onClick={() => fetchTracks(playlist.id)}
                    >
                      {playlist.name}
                    </button>
                    {selectedPlaylist === playlist.id && (
                      <ul className="track-list list-group">
                        {tracks && tracks.length > 0 && tracks.map(track => (
                          <li key={track.track.id} className="list-group-item track-item">
                            {track.track.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {selectedPlaylist && (
              <button className="download-btn" onClick={handleDownload}>
                Download Playlist
              </button>
            )}
          </div>
        )}
        <p className="description">Download all your favorite playlists...</p>
        {loading && (
          <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
