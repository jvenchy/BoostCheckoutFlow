'use client';

export default function CampaignTierCard({ tier, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-cyan-400 bg-cyan-400/10'
          : 'border-gray-700 hover:bg-gray-500/50 hover:border-gray-600 duration-100'
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <span className="bg-cyan-400 text-black text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </span>
        </div>
      )}

      <div className="text-left">
        <h3 className="text-white font-bold text-lg mb-2">{tier.name}</h3>

        <div className="mb-3">
          <div className="text-2xl font-bold text-white">${tier.price}</div>
          <div className="text-gray-400 text-sm line-through">${tier.originalPrice}</div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="text-gray-300">
            <span className="font-semibold">{tier.streams}</span> streams
          </div>
          <div className="text-gray-300">
            <span className="font-semibold">{tier.pitches}</span> playlist pitches
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}
