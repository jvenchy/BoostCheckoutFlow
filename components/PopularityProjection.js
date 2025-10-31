'use client';

import { useMemo } from 'react';

// Campaign tier strength - how effectively they can boost songs
// Reflects actual campaign size: Bronze (500-1.5k) vs Platinum (8k-15k streams)
const TIER_STRENGTH = {
  bronze: { min: 0.12, max: 0.22 },    // Modest boost for smaller campaigns
  gold: { min: 0.28, max: 0.42 },      // Moderate boost
  pro: { min: 0.48, max: 0.68 },       // Strong boost
  platinum: { min: 0.72, max: 0.95 }   // Maximum impact
};

// Calculate projected popularity with intelligent scaling
// Uses diminishing returns as songs approach 100 popularity
function calculateProjectedPopularity(currentPopularity, tierStrength) {
  // Calculate how much "room to grow" the song has
  const roomToGrow = 100 - currentPopularity;

  // For low popularity songs (0-60): more aggressive growth
  // For mid popularity (60-85): moderate growth with some diminishing returns
  // For high popularity (85-100): smaller but still meaningful growth

  if (currentPopularity <= 60) {
    // Low popularity: can grow more directly
    const growth = roomToGrow * tierStrength * 0.7;
    return Math.min(100, currentPopularity + growth);
  } else if (currentPopularity <= 85) {
    // Mid-range: moderate diminishing returns
    const baseGrowth = roomToGrow * tierStrength * 0.6;
    const diminishingFactor = 1 - ((currentPopularity - 60) / 50); // 1.0 to 0.5
    return Math.min(100, currentPopularity + (baseGrowth * diminishingFactor));
  } else {
    // High popularity: significant diminishing returns but still show tier differences
    // Even a 95 popularity song can reach 98-99 with platinum tier
    const baseGrowth = roomToGrow * tierStrength;
    const diminishingFactor = 0.7 - ((currentPopularity - 85) / 30); // 0.7 to 0.2
    return Math.min(100, currentPopularity + (baseGrowth * diminishingFactor));
  }
}

export default function PopularityProjection({ currentSong, selectedTier }) {
  const currentPopularity = currentSong?.popularity || 50;
  
  const projections = useMemo(() => {
    if (!selectedTier) return null;

    const tierStrength = TIER_STRENGTH[selectedTier];
    const minProjected = calculateProjectedPopularity(currentPopularity, tierStrength.min);
    const maxProjected = calculateProjectedPopularity(currentPopularity, tierStrength.max);

    // Calculate y-axis range: start slightly below current, end slightly above max
    const padding = (maxProjected - currentPopularity) * 0.1;
    const minValue = Math.max(0, Math.floor((currentPopularity - padding) / 5) * 5);
    const maxValue = Math.min(100, Math.ceil((maxProjected + padding) / 5) * 5);
    const range = maxValue - minValue;

    // Helper function to convert popularity value to y coordinate
    const valueToY = (value) => {
      if (range === 0) return 100; // Avoid division by zero if range is 0
      const normalizedValue = (value - minValue) / range;
      return 200 - (normalizedValue * 180);
    };

    // Generate 12 points for a smoother curve
    const points = 12;
    const minCurve = [];
    const maxCurve = [];

    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      // S-curve (ease-in-out) for more realistic growth
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const x = (i / points) * 400;

      // Min curve (starts at current, grows to minProjected)
      const minPopularity = currentPopularity + (minProjected - currentPopularity) * easeProgress;
      const minY = valueToY(minPopularity);
      minCurve.push(`${x},${minY}`);

      // Max curve (starts at current, grows to maxProjected)
      const maxPopularity = currentPopularity + (maxProjected - currentPopularity) * easeProgress;
      const maxY = valueToY(maxPopularity);
      maxCurve.push(`${x},${maxY}`);
    }

    return {
      minCurve: minCurve.join(' '),
      maxCurve: maxCurve.join(' '),
      minProjected,
      maxProjected,
      currentPopularity,
      minValue,
      maxValue,
      valueToY
    };
  }, [currentPopularity, selectedTier]);

  if (!projections) {
    return (
      <div className="bg-boost-gray border border-gray-700 rounded-2xl p-6">
        <div className="text-center py-12 text-gray-400">
          Select a campaign tier to see projected growth
        </div>
      </div>
    );
  }

  // Calculate y-axis labels based on the actual scale range
  const yAxisSteps = 5;
  const stepSize = (projections.maxValue - projections.minValue) / (yAxisSteps - 1);
  const yLabels = Array.from({ length: yAxisSteps }, (_, i) =>
    projections.maxValue - (stepSize * i)
  );

  return (
    <div className="bg-boost-gray border border-gray-700 rounded-2xl p-6 transition-all duration-500">
      <h3 className="text-xl font-bold text-white mb-2">
        projected popularity growth
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Based on {currentSong?.name}&apos;s current popularity of {projections.currentPopularity}/100
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-4">
        <div className="flex items-center">
          <span className="text-white mr-2">minimum</span>
          <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-500 ml-2 font-bold">
            {Math.round(projections.minProjected)}/100
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-white mr-2">maximum</span>
          <div className="w-8 h-8 bg-white rounded-full"></div>
          <span className="text-white ml-2 font-bold">
            {Math.round(projections.maxProjected)}/100
          </span>
        </div>
      </div>

      <div className="relative h-64 bg-black rounded-lg p-4 overflow-hidden">
        {/* Starting point indicator */}
        <div
          className="absolute left-4 w-2 h-2 bg-indigo-400 rounded-full z-10 transition-all duration-500"
          style={{
            top: `calc(1rem + ( (16rem - 2rem) * ${projections.valueToY(projections.currentPopularity) / 200} ))`
          }}
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-light text-indigo-400 ">
            Current: {projections.currentPopularity}
          </div>
        </div>

        <svg 
          className="w-full h-full" 
          viewBox="0 0 400 200" 
          preserveAspectRatio="none"
        >
          {/* Gradient fill between curves */}
          <defs>
            <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Fill area between curves */}
          <path
            d={`M ${projections.minCurve} L ${projections.maxCurve.split(' ').reverse().join(' ')} Z`}
            fill="url(#growthGradient)"
            className="transition-all duration-500"
          />

          {/* Min curve */}
          <polyline
            fill="none"
            stroke="#ffd700"
            strokeWidth="3"
            points={projections.minCurve}
            className="transition-all duration-500"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))'
            }}
          />
          
          {/* Max curve */}
          <polyline
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            points={projections.maxCurve}
            className="transition-all duration-500"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
            }}
          />
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-4">
          {yLabels.map((label, i) => (
            <span key={i} className="transition-all duration-500">
              {Math.round(label)}
            </span>
          ))}
        </div>

        {/* X-axis label */}
        <div className="absolute bottom-1 right-4 text-xs text-gray-500">
          30 days →
        </div>
      </div>

      {/* Growth stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Min Growth</div>
          <div className="text-lg font-bold text-yellow-500">
            +{Math.round(((projections.minProjected / projections.currentPopularity) - 1) * 100)}%
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Max Growth</div>
          <div className="text-lg font-bold text-white">
            +{Math.round(((projections.maxProjected / projections.currentPopularity) - 1) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}