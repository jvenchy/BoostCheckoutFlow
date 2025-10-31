'use client';

export default function SongCard({ song, onRemove, showRemove = true }) {
  return (
    <div className="relative border-2 border-white rounded-2xl p-4 bg-black">
      {showRemove && (
        <button
          onClick={() => onRemove(song.instanceId)}
          className="absolute top-2 right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 z-10 cursor-pointer"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 bg-gray-800 rounded-lg overflow-hidden mb-3">
          {song.image ? (
            <img 
              src={song.image} 
              alt={song.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
        </div>
        
        <h3 className="text-white text-center font-medium line-clamp-2 mb-1">
          {song.name}
        </h3>
        <p className="text-gray-400 text-sm text-center">
          {song.artist}
        </p>
      </div>
    </div>
  );
}