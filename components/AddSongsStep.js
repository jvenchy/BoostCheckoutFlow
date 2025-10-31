'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Trash2, Play, Pause } from 'lucide-react';
import SongSearch from './SongSearch';
import TextType from './TextType';

export default function AddSongsStep() {
  const { selectedSongs, addSong, removeSong } = useOrder();
  const [playingInstanceId, setPlayingInstanceId] = useState(null);
  const audioRef = useRef(null);

  // Stop audio when song is removed or component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleAddSong = (song) => {
    // Add a unique instanceId to allow duplicate songs
    const songWithInstanceId = {
      ...song,
      instanceId: `${song.id}-${Date.now()}-${Math.random()}`
    };
    addSong(songWithInstanceId);
  };

  const togglePlayPreview = (song, e) => {
    e.stopPropagation(); // Prevent opening Spotify when clicking play button

    if (!song.previewUrl) {
      alert('No preview available for this song');
      return;
    }

    // If clicking the currently playing song, pause it
    if (playingInstanceId === song.instanceId) {
      audioRef.current?.pause();
      setPlayingInstanceId(null);
      return;
    }

    // Play new song
    if (audioRef.current) {
      audioRef.current.src = song.previewUrl;
      audioRef.current.play();
      setPlayingInstanceId(song.instanceId);

      // Reset playing state when audio ends
      audioRef.current.onended = () => {
        setPlayingInstanceId(null);
      };
    }
  };

  const openInSpotify = (spotifyUrl, e) => {
    e.stopPropagation();
    window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRemoveSong = (instanceId, e) => {
    e.stopPropagation();

    // Stop audio if removing the currently playing song
    if (playingInstanceId === instanceId) {
      audioRef.current?.pause();
      setPlayingInstanceId(null);
    }

    removeSong(instanceId);
  };

  return (
    <div className="min-h-screen pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
          <TextType
            text={["confirm or add more songs"]}
            as="span"
            typingSpeed={75}
            pauseDuration={5000}
            showCursor={true}
            cursorCharacter="_"
            className="text-white"
          />
        </h1>

        {/* Search Bar at Top */}
        <div className="mb-8">
          <SongSearch onSongSelect={handleAddSong} />
        </div>

        {/* Selected Songs Cart */}
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-white">
              selected songs ({selectedSongs.length})
            </h2>
            {selectedSongs.length >= 2 && (
              <div className="bg-yellow-300 text-black text-sm font-bold px-4 py-2 rounded-full">
                20% OFF Applied
              </div>
            )}
          </div>

          {selectedSongs.length === 0 ? (
            <div className="text-center py-12">
              <svg 
                className="w-16 h-16 text-gray-600 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                />
              </svg>
              <p className="text-gray-400 text-lg">
                search and add songs to promote
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedSongs.map((song) => {
                const isPlaying = playingInstanceId === song.instanceId;
                return (
                  <div
                    key={song.instanceId}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5"
                  >
                    <div className="flex items-center gap-4">
                      {/* Song Image with Play Button Overlay */}
                      <div className="relative w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                        {song.image ? (
                          <img
                            src={song.image}
                            alt={song.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Play/Pause Button Overlay */}
                        {song.previewUrl && (
                          <button
                            onClick={(e) => togglePlayPreview(song, e)}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label={isPlaying ? "Pause preview" : "Play preview"}
                          >
                            {isPlaying ? (
                              <Pause className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
                            ) : (
                              <Play className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {song.name}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                          {song.artist}
                        </p>
                        {isPlaying && (
                          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                            Playing preview
                          </p>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {selectedSongs.length >= 2 && (
                        <div className="bg-yellow-300/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                          -20%
                        </div>
                      )}

                      {/* Action Buttons - Slide in from right with snap effect */}
                      <div className="flex gap-2 translate-x-24 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        {/* Spotify Button */}
                        <button
                          onClick={(e) => openInSpotify(song.spotifyUrl, e)}
                          className="w-10 h-10 bg-green-600/80 hover:bg-green-600 border border-green-500/50 hover:border-green-400 rounded-lg flex items-center justify-center transition-all hover:cursor-pointer flex-shrink-0"
                          aria-label="Open in Spotify"
                          title="Open in Spotify"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                        </button>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => handleRemoveSong(song.instanceId, e)}
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 rounded-lg flex items-center justify-center transition-all hover:cursor-pointer flex-shrink-0"
                          aria-label="Remove song"
                        >
                          <Trash2 className="w-5 h-5 text-white/50" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedSongs.length > 0 && selectedSongs.length < 10 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm text-center">
                {selectedSongs.length === 1
                  ? 'Add one more song to get 20% OFF both songs!'
                  : `You can add up to ${10 - selectedSongs.length} more song${10 - selectedSongs.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}
        </div>

        {/* Hidden audio element for preview playback */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
}