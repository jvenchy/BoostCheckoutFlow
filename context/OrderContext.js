'use client';

import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [campaignTiers, setCampaignTiers] = useState({});
  const [userDetails, setUserDetails] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [currentStep, setCurrentStep] = useState(0); // 0: landing, 1: songs, 2: campaign, 3: payment

  const addSong = (song) => {
    setSelectedSongs((prev) => [...prev, song]);
  };

  const removeSong = (instanceId) => {
    setSelectedSongs((prev) => prev.filter((song) => song.instanceId !== instanceId));
    // Also remove campaign tier for this song instance
    setCampaignTiers((prev) => {
      const newTiers = { ...prev };
      delete newTiers[instanceId];
      return newTiers;
    });
  };

  const updateCampaignTier = (instanceId, tier) => {
    setCampaignTiers((prev) => ({
      ...prev,
      [instanceId]: tier,
    }));
  };

  const updateUserDetails = (details) => {
    setUserDetails((prev) => ({
      ...prev,
      ...details,
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    selectedSongs.forEach((song) => {
      const tier = campaignTiers[song.instanceId];
      if (tier) {
        total += tier.price;
      }
    });

    // Apply 20% discount if 2 or more songs
    if (selectedSongs.length >= 2) {
      total = total * 0.8;
    }

    return total;
  };

  const resetOrder = () => {
    setSelectedSongs([]);
    setCampaignTiers({});
    setUserDetails({ email: '', firstName: '', lastName: '' });
    setCurrentStep(0);
  };

  const value = {
    selectedSongs,
    campaignTiers,
    userDetails,
    currentStep,
    addSong,
    removeSong,
    updateCampaignTier,
    updateUserDetails,
    setCurrentStep,
    calculateTotal,
    resetOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}