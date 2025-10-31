'use client';

import { useMemo, useState, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import Header from '../components/Header';
import SongSearch from '../components/SongSearch';
import FaultyTerminal from '../components/FaultyTerminal';
import CountUp from '../components/CountUp';
import AddSongsStep from '../components/AddSongsStep';
import ChooseCampaignStep from '../components/ChooseCampaignStep';
import PaymentStep from '../components/PaymentStep';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { addSong, setCurrentStep, currentStep, selectedSongs } = useOrder();

  // Memoize the gridMul array to prevent FaultyTerminal from re-mounting
  const gridMul = useMemo(() => [2, 1], []);

  // Track animation direction based on step changes
  const [prevStep, setPrevStep] = useState(currentStep);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  useEffect(() => {
    if (currentStep > prevStep) {
      setDirection(1); // Moving forward: slide in from right, exit to left
    } else if (currentStep < prevStep) {
      setDirection(-1); // Moving backward: slide in from left, exit to right
    }
    setPrevStep(currentStep);
  }, [currentStep, prevStep]);

  const handleSongSelect = (song) => {
    // Add a unique instanceId to allow duplicate songs
    const songWithInstanceId = {
      ...song,
      instanceId: `${song.id}-${Date.now()}-${Math.random()}`
    };
    addSong(songWithInstanceId);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-page interactive background */}
      <div className="fixed inset-0 z-0">
        <FaultyTerminal
          scale={1.5}
          gridMul={gridMul}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={0}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0.5}
          dither={0}
          curvature={0.5}
          tint="#ffffff"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={0.3}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10 pt-20">
        <Header />

        {/* Navigation - only show when not on landing */}
        {currentStep > 0 && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer group"
              >
                <svg
                  className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {currentStep === 1 ? 'Back to Home' : `Back to Step ${currentStep - 1}`}
                </span>
              </button>

              {/* Next Step Button - animates with step 1 content */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && selectedSongs.length > 0 && (
                  <motion.button
                    key="promote-button"
                    initial={{ x: 80 * direction, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -80 * direction, opacity: 0 }}
                    transition={{
                      type: 'tween',
                      ease: 'easeInOut',
                      duration: 0.7
                    }}
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-base md:text-lg font-bold bg-boost-cream text-black hover:bg-yellow-200 cursor-pointer transition-all"
                  >
                    promote selected songs →
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Animated Content - Landing and All Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ x: 80 * direction, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80 * direction, opacity: 0 }}
            transition={{
              type: 'tween',
              ease: 'easeInOut',
              duration: 0.5
            }}
          >
            {currentStep === 0 && (
              /* Landing/Hero Section */
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] text-center px-4">
                <div className="max-w-4xl w-full">
                  <h1 className="text-6xl md:text-8xl font-bold mb-8">
                    <span className="bg-gradient-to-b from-orange-600 via-red-600 to-red-800 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(185,28,28,0.6)]">
                      Halloween Sale 🦇
                    </span>{' '}
                  </h1>
                  <h2 className="text-3xl md:text-5xl font-semibold text-white mb-20">
                    get your music on playlists for{' '}
                    <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                      <CountUp
                        from={0}
                        to={60}
                        separator=","
                        direction="up"
                        duration={1}
                        className="inline"
                      />% off!
                    </span>
                  </h2>

                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl px-4">
                      <SongSearch onSongSelect={handleSongSelect} />
                      
                      {/* Bonuses Section */}
                      <div className="mt-12 space-y-6">
                        {/* Bonuses List */}
                        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                          <h3 className="text-white/90 text-lg font-semibold mb-4 text-center">
                            Lowest-ever price for promo! Stock up before we sell out 🔥
                          </h3>
                          <div className="grid gap-3">
                            <div className="flex items-start gap-3 text-white/80">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span className="text-sm">Free $15 Gift Card at checkout</span>
                            </div>
                            <div className="flex items-start gap-3 text-white/80">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span className="text-sm">Free 1,000+ Blog Contact List</span>
                            </div>
                            <div className="flex items-start gap-3 text-white/80">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span className="text-sm">Free 7,000+ Playlist Curator Contact List</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && <AddSongsStep />}
            {currentStep === 2 && <ChooseCampaignStep />}
            {currentStep === 3 && <PaymentStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}