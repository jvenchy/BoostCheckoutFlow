'use client';

import { useState } from 'react';

export default function SongSearch({ onSongSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.tracks || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSong = (song) => {
    onSongSelect(song);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Search for a song or artist..."
          className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 focus:outline-none focus:border-blue-300/60 focus:ring-2 focus:ring-blue-700/30 placeholder-white/40 transition-all duration-300 shadow-lg hover:bg-white/15"
        />
        
        {/* Search Icon */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-5 h-5 text-white/40" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Results */}
      {showResults && (
        <div className="absolute z-50 w-full mt-3">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-orange-700"></div>
                  <p className="mt-4 text-white/60 text-sm">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((song, index) => (
                    <button
                      key={song.id}
                      onClick={() => handleSelectSong(song)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-black/30 hover:cursor-pointer rounded-xl transition-all group"
                    >
                      {/* Album Art */}
                      <div className="w-14 h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-orange-700/50 transition-all duration-200">
                        {song.image ? (
                          <img 
                            src={song.image} 
                            alt={song.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg 
                              className="w-6 h-6 text-white/30" 
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
                      </div>

                      {/* Song Info */}
                      <div className="flex-grow text-left min-w-0">
                        <div className="text-white font-medium line-clamp-1 group-hover:text-orange-700 transition-colors duration-200">
                          {song.name}
                        </div>
                        <div className="text-white/50 text-sm line-clamp-1 mt-0.5">
                          {song.artist}
                        </div>
                      </div>

                      {/* Play Icon (appears on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                        <svg 
                          className="w-5 h-5 text-orange-700" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg 
                    className="w-12 h-12 text-white/20 mx-auto mb-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" 
                    />
                  </svg>
                  <p className="text-white/40 text-sm">No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}