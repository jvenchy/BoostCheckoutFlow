import { NextResponse } from 'next/server';
import { searchTracks, parseSpotifyUrl, getTrackById } from '../../../lib/spotify';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Check if query is a Spotify URL
    const trackId = parseSpotifyUrl(query);
    
    if (trackId) {
      // If it's a URL, get the specific track
      const track = await getTrackById(trackId);
      if (track) {
        return NextResponse.json({ tracks: [track] });
      }
      return NextResponse.json({ tracks: [] });
    }

    // Otherwise, search for tracks
    const tracks = await searchTracks(query);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Failed to search tracks' },
      { status: 500 }
    );
  }
}