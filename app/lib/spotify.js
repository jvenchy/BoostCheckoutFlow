// Spotify API helper functions

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

// Get Spotify access token using Client Credentials flow
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);

  return accessToken;
}

// Search for tracks
export async function searchTracks(query) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    // Transform Spotify data to our format
    return data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url,
      uri: track.uri,
      spotifyUrl: track.external_urls.spotify,
      popularity: track.popularity,
      previewUrl: track.preview_url,
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

// Get track details by ID
export async function getTrackById(trackId) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const track = await response.json();
    
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url,
      uri: track.uri,
      spotifyUrl: track.external_urls.spotify,
      popularity: track.popularity,
      previewUrl: track.preview_url,
    };
  } catch (error) {
    console.error('Error getting track:', error);
    return null;
  }
}

// Parse Spotify URL to get track ID
export function parseSpotifyUrl(url) {
  // Handle various Spotify URL formats
  // https://open.spotify.com/track/TRACKID
  // spotify:track:TRACKID
  
  const trackMatch = url.match(/track[\/:]([a-zA-Z0-9]+)/);
  if (trackMatch) {
    return trackMatch[1];
  }
  
  return null;
}