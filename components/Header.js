'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { CAMPAIGN_TIERS } from '@/app/lib/stripe';

export default function Header() {
  const { selectedSongs, campaignTiers, updateCampaignTier, setCurrentStep } = useOrder();
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tooltipRef = useRef(null);

  const handleCartClick = () => {
    if (selectedSongs.length === 0) {
      setShowCartTooltip(true);
    } else {
      // Auto-apply Pro tier to any songs without a tier
      selectedSongs.forEach((song) => {
        if (!campaignTiers[song.instanceId]) {
          updateCampaignTier(song.instanceId, CAMPAIGN_TIERS.pro);
        }
      });

      setCurrentStep(3); // Go to payment step
    }
  };

  const handleAddSongsClick = () => {
    setShowCartTooltip(false);
    setCurrentStep(1); // Go to add songs step
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setCurrentStep(0); // Go to landing page
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowCartTooltip(false);
      }
    };

    if (showCartTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCartTooltip]);

  return (
    <>
      {/* Full-screen blur overlay when menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-gray-300 cursor-pointer relative z-[70]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link href="/" onClick={handleLogoClick} className="flex items-center flex-shrink-0 cursor-pointer">
            <span className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">boost collective</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="https://growmylabel.com/" className="text-white hover:text-gray-300">
              for labels
            </Link>
            <Link href="https://www.boost-collective.com/reviews" className="text-white hover:text-gray-300">
              reviews
            </Link>
            <div className="relative group">
              <button className="text-white hover:text-gray-300 flex items-center">
                promotion
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <Link href="https://www.boost-collective.com/music-distribution" className="text-white hover:text-gray-300">
              distribution
            </Link>
            <Link href="https://www.boost-collective.com/about-us" className="text-white hover:text-gray-300">
              about us
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a href="https://www.instagram.com/boostcollective/" target="_blank" rel="noopener noreferrer" className="hidden sm:block text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/c/RonanBoost" target="_blank" rel="noopener noreferrer" className="hidden sm:block text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@boostcollective" target="_blank" rel="noopener noreferrer" className="hidden sm:block text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>

            {/* Shopping Cart with Tooltip */}
            <div className="relative" ref={tooltipRef}>
              <button
                onClick={handleCartClick}
                className="relative text-white translate-y-1 hover:text-gray-300 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {selectedSongs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-boost-cream text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedSongs.length}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              {showCartTooltip && (
                <div className="absolute right-0 top-full mt-2 bg-white text-black rounded-lg shadow-lg p-3 whitespace-nowrap z-50">
                  <button
                    onClick={handleAddSongsClick}
                    className="text-sm hover:text-gray-600 cursor-pointer underline"
                  >
                    add some songs
                  </button>
                </div>
              )}
            </div>

            <button className="bg-boost-cream text-black px-3 sm:px-6 py-2 rounded-full font-medium hover:bg-yellow-100 text-sm sm:text-base whitespace-nowrap cursor-pointer">
              sign up
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-[73px] left-0 bottom-0 w-64 border-r border-white/10 transform transition-transform duration-300 ease-in-out z-[100] md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-6 space-y-6">
          {/* Navigation Links */}
          <Link
            href="https://growmylabel.com/"
            className="text-white hover:text-gray-300 text-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            for labels
          </Link>
          <Link
            href="https://www.boost-collective.com/reviews"
            className="text-white hover:text-gray-300 text-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            reviews
          </Link>
          <div className="text-white text-lg">
            promotion
          </div>
          <Link
            href="https://www.boost-collective.com/music-distribution"
            className="text-white hover:text-gray-300 text-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            distribution
          </Link>
          <Link
            href="https://www.boost-collective.com/about-us"
            className="text-white hover:text-gray-300 text-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            about us
          </Link>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-gray-400 text-sm mb-4">follow us</p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/boostcollective/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/c/RonanBoost"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@boostcollective"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}