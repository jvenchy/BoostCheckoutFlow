'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOrder } from '@/context/OrderContext';
import { CAMPAIGN_TIERS } from '../app/lib/stripe';
import CampaignTierCard from './CampaignTierCard';
import SongCard from './SongCard';
import TextType from './TextType';
import Stack from './Stack';
import PopularityProjection from './PopularityProjection';

export default function ChooseCampaignStep() {
  const { selectedSongs, campaignTiers, updateCampaignTier, setCurrentStep } = useOrder();

  // Reverse songs so first song is on top of stack - memoize to prevent recomputation
  const reversedSongs = useMemo(() => [...selectedSongs].reverse(), [selectedSongs]);

  const [currentSong, setCurrentSong] = useState(selectedSongs[0] || null);
  const [selectedTier, setSelectedTier] = useState(null);
  const stackRef = useRef(null);
  const prevSongRef = useRef(null);
  const prevTierRef = useRef(null);

  const currentSongIndex = selectedSongs.findIndex(song => song.instanceId === currentSong?.instanceId);
  const isLastSong = currentSongIndex === selectedSongs.length - 1;
  const isFirstSong = currentSongIndex === 0;
  const discount = selectedSongs.length >= 2 ? 0.2 : 0; // 20% OFF (matches OrderContext)

  // Ensure currentSong is valid when selectedSongs changes
  useEffect(() => {
    if (selectedSongs.length > 0 && !currentSong) {
      setCurrentSong(selectedSongs[0]);
    }
  }, [selectedSongs, currentSong]);

  // Save previous song's tier when switching songs (for drag navigation)
  useEffect(() => {
    if (prevSongRef.current && prevTierRef.current && currentSong?.instanceId !== prevSongRef.current.instanceId) {
      // Save the previous song's tier to context
      updateCampaignTier(prevSongRef.current.instanceId, CAMPAIGN_TIERS[prevTierRef.current]);
    }

    // Update refs for next time
    prevSongRef.current = currentSong;
    prevTierRef.current = selectedTier;
  }, [currentSong, selectedTier, updateCampaignTier]);

  // Load existing tier selection if available
  useEffect(() => {
    if (currentSong && campaignTiers[currentSong.instanceId]) {
      setSelectedTier(campaignTiers[currentSong.instanceId].id);
    } else {
      setSelectedTier('pro'); // Default to Pro
    }
  }, [currentSongIndex, currentSong, campaignTiers]);

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  const handleActiveCardChange = useCallback((song) => {
    setCurrentSong(song);
  }, []);

  const handleStackReady = useCallback((methods) => {
    stackRef.current = methods;
  }, []);

  // Save current tier to context
  const saveCurrentTier = useCallback(() => {
    if (selectedTier && currentSong) {
      updateCampaignTier(currentSong.instanceId, CAMPAIGN_TIERS[selectedTier]);
    }
  }, [selectedTier, currentSong, updateCampaignTier]);

  const handleNavigateForward = () => {
    // Save current tier before navigating
    saveCurrentTier();

    if (stackRef.current) {
      stackRef.current.sendTopToBack();
    }
  };

  const handleNavigateBack = () => {
    // Save current tier before navigating
    saveCurrentTier();

    if (stackRef.current) {
      stackRef.current.sendBottomToTop();
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedTier && currentSong && isLastSong) {
      saveCurrentTier();

      // Auto-apply Pro tier to any songs without a tier (edge case safeguard)
      selectedSongs.forEach((song) => {
        if (!campaignTiers[song.instanceId]) {
          updateCampaignTier(song.instanceId, CAMPAIGN_TIERS.pro);
        }
      });

      setCurrentStep(3);
    }
  };

  const handleChangeSongs = () => {
    setCurrentStep(1);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="min-h-screen pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          <TextType
            text={["choose your campaigns"]}
            as="span"
            typingSpeed={75}
            pauseDuration={5000}
            showCursor={true}
            cursorCharacter="_"
            className="text-white"
          /> 
        </h1>

        <div className="mt-4 bg-cyan-400 text-black px-4 py-2 rounded-lg inline-flex items-center">
          <span className="font-bold mr-2">BONUS</span>
          <span>All campaigns include a 14-day free trial of </span>
          <span className="font-bold ml-1">PRO</span>
          <button className="ml-2 w-5 h-5 border border-black rounded-full flex items-center justify-center text-xs">
            i
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.values(CAMPAIGN_TIERS).map((tier) => (
                <div
                  key={tier.id}
                  className="transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    card.style.transform = `translateY(-8px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
                  }}
                >
                  <CampaignTierCard
                    tier={tier}
                    isSelected={selectedTier === tier.id}
                    onSelect={() => handleTierSelect(tier.id)}
                  />
                </div>
              ))}
            </div>

            <PopularityProjection 
              currentSong={currentSong} 
              selectedTier={selectedTier} 
            />
          </div>

          <div className="space-y-4 -mt-20">
            <div className="flex justify-center items-start">
              <Stack
                cardsData={reversedSongs}
                cardDimensions={{ width: 280, height: 320 }}
                sensitivity={150}
                randomRotation={false}
                sendToBackOnClick={false}
                onActiveCardChange={handleActiveCardChange}
                onStackReady={handleStackReady}
                renderCard={(song) => (
                  <div className="w-full h-full">
                    <SongCard song={song} showRemove={false} />
                  </div>
                )}
              />
            </div>

            {/* Navigation Buttons */}
            {selectedSongs.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={handleNavigateBack}
                  disabled={isFirstSong}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors flex items-center justify-center ${
                    isFirstSong
                      ? 'bg-white/10 text-gray-500 backdrop-blur-xl cursor-not-allowed'
                      : 'bg-boost-cream text-black hover:bg-yellow-200 cursor-pointer'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  previous
                </button>
                <button
                  onClick={handleNavigateForward}
                  disabled={isLastSong}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors flex items-center justify-center ${
                    isLastSong
                      ? 'bg-white/10 text-gray-500 backdrop-blur-xl cursor-not-allowed'
                      : 'bg-boost-cream text-black hover:bg-yellow-200 cursor-pointer'
                  }`}
                >
                  next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              disabled={!selectedTier || !isLastSong}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-between px-6 ${
                !selectedTier || !isLastSong
                  ? 'bg-white/10 text-gray-500 backdrop-blur-xl cursor-not-allowed'
                  : 'bg-boost-cream text-black hover:bg-yellow-200 cursor-pointer'
              }`}
            >
              <span>proceed to checkout</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleChangeSongs}
              className="w-full bg-boost-cream text-black py-4 rounded-2xl font-bold text-lg hover:bg-yellow-200 transition-colors flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              change songs
            </button>

            {currentSongIndex >= 0 && currentSongIndex < selectedSongs.length && (
              <div className="text-center text-gray-400 text-sm">
                Song {currentSongIndex + 1} of {selectedSongs.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}