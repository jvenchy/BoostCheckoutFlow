'use client';

import { useState, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import StripePaymentForm from './StripePaymentForm';

const popularAddons = [
  {
    id: 'apple-music',
    name: 'Promote on Apple Music (50% OFF)',
    features: [
      '- Get added to an Apple Music playlist',
      '- Apple Music add-on refunded if not placed in 7 days',
    ],
    originalPrice: 129.00,
    price: 64.50,
    gradient: 'from-pink-500 via-pink-400 to-pink-300',
  },
  {
    id: 'campaign-upgrade',
    name: 'Campaign upgrade (80% OFF)',
    features: [
      '- Pitch to 2x more playlists ($150 value)',
      '- Stay on playlists 2x longer ($100 value)',
      '- Priority placements in 48 hours',
    ],
    originalPrice: 400.00,
    price: 67.99,
    gradient: 'from-purple-500 via-blue-500 to-cyan-400',
  },
];

export default function PaymentStep() {
  const { selectedSongs, campaignTiers, userDetails, updateUserDetails, calculateTotal } = useOrder();
  const [discountCode, setDiscountCode] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [error, setError] = useState('');

  // Calculate subtotal before discount
  const subtotalBeforeDiscount = selectedSongs.reduce((total, song) => {
    const tier = campaignTiers[song.instanceId];
    return total + (tier?.price || 0);
  }, 0);

  // Calculate discount amount
  const hasMultiSongDiscount = selectedSongs.length >= 2;
  const discountAmount = hasMultiSongDiscount ? subtotalBeforeDiscount * 0.2 : 0;

  // Final subtotal after discount
  const subtotal = calculateTotal();

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = popularAddons.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  const total = subtotal + addonsTotal;

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  // Create payment intent when user details are complete
  useEffect(() => {
    const createPaymentIntent = async () => {
      // Validate user details before creating intent
      if (!userDetails.email || !userDetails.firstName || !userDetails.lastName) {
        setClientSecret('');
        setPaymentIntentId('');
        return;
      }

      if (total <= 0) {
        setClientSecret('');
        setPaymentIntentId('');
        return;
      }

      setIsLoadingIntent(true);
      setError('');

      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to cents
            selectedSongs,
            campaignTiers,
            selectedAddons: selectedAddons.map(addonId => {
              const addon = popularAddons.find(a => a.id === addonId);
              return addon;
            }).filter(Boolean),
            userDetails,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        console.error('Payment intent creation error:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
      } finally {
        setIsLoadingIntent(false);
      }
    };

    createPaymentIntent();
  }, [userDetails.email, userDetails.firstName, userDetails.lastName]);

  // Update payment intent amount when total changes (without recreating the form)
  useEffect(() => {
    const updatePaymentIntent = async () => {
      if (!paymentIntentId || !clientSecret) return;
      if (total <= 0) return;

      try {
        const response = await fetch('/api/stripe/update-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            amount: Math.round(total * 100), // Convert to cents
          }),
        });

        if (!response.ok) {
          console.error('Failed to update payment amount');
        }
      } catch (err) {
        console.error('Payment intent update error:', err);
      }
    };

    updatePaymentIntent();
  }, [total, paymentIntentId, clientSecret]);

  const addons = [
    {
      id: 'music-blog',
      name: '1,000+ Music Blog Contact list',
      checked: true,
    },
    {
      id: 'gift-card',
      name: '$15 Boost Collective Gift Card (Halloween Sale Bonus)',
      checked: true,
    },
    {
      id: 'playlist-curator',
      name: '7,000+ Playlist Curator Contact List',
      checked: true,
    },
  ];

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-screen">
          {/* Left side - Payment Form (Scrollable) */}
          <div className="lg:h-screen lg:overflow-y-auto border-r border-gray-500">
            <div className="p-6 lg:p-12 max-w-2xl mx-auto">

              {/* Contact Form */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">contact</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => updateUserDetails({ email: e.target.value })}
                        className="w-full px-4 py-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">
                          First name
                        </label>
                        <input
                          type="text"
                          value={userDetails.firstName}
                          onChange={(e) => updateUserDetails({ firstName: e.target.value })}
                          className="w-full px-4 py-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">
                          Last name
                        </label>
                        <input
                          type="text"
                          value={userDetails.lastName}
                          onChange={(e) => updateUserDetails({ lastName: e.target.value })}
                          className="w-full px-4 py-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">payment</h3>
                  <p className="text-sm text-gray-200 mb-6">
                    all transactions are secure and encrypted.
                  </p>

                  {error && (
                    <div className="mb-4 text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      {error}
                    </div>
                  )}

                  {isLoadingIntent ? (
                    <div className="text-center text-gray-400 py-8">
                      Initializing payment...
                    </div>
                  ) : !userDetails.email || !userDetails.firstName || !userDetails.lastName ? (
                    <div className="text-center text-gray-400 py-8">
                      Please fill in your contact information to continue
                    </div>
                  ) : clientSecret ? (
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      total={total}
                      onSuccess={() => {
                        // Handle success if needed
                        console.log('Payment successful');
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      Unable to load payment form. Please refresh the page.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Order Summary (Scrollable) */}
          <div className="lg:h-screen lg:overflow-y-auto">
            <div className="p-6 lg:p-12">
              <div className="max-w-xl mx-auto">
                {/* Selected Songs */}
                {selectedSongs.map((song) => {
                  const tier = campaignTiers[song.instanceId];
                  return (
                    <div key={song.instanceId} className="mb-6 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {song.image && (
                              <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-lg mb-1">{song.name}</h4>
                            <p className="text-gray-400 text-sm">{tier?.name} tier</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 line-through text-sm mb-1">${tier?.originalPrice}</p>
                          <p className="text-green-300 font-bold text-xl">${tier?.price}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* PRO Subscription */}
                <div className="mb-6 pb-6 border-b border-gray-500">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                      <div>
                        <h4 className="text-cyan-400 font-bold text-lg mb-1">
                          PRO<sup className="text-xs">+</sup>
                        </h4>
                        <p className="text-white text-sm">14-day free trial</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <button className="text-gray-400 hover:text-white mb-2 cursor-pointer">×</button>
                      <p className="text-white font-bold text-xl">FREE</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Your payment method will be charged $19.99/mo USD after the 14-day free trial. You can cancel at any time.
                  </p>
                </div>

                {/* Discount Code */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Gift card or discount code"
                      className="flex-1 px-4 py-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                    <button
                      type="button"
                      className="px-6 py-4 bg-gray-700 text-gray-400 rounded-xl hover:bg-gray-600 hover:text-white transition-colors font-semibold cursor-pointer"
                    >
                      apply
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="mb-6 pb-6 border-b border-gray-500 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-lg">subtotal</span>
                    <span className="text-white font-semibold text-lg">${subtotalBeforeDiscount.toFixed(2)}</span>
                  </div>

                  {hasMultiSongDiscount && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-300 text-sm">20% off for purchasing 2+ promotions</span>
                        <span className="bg-yellow-300/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">
                          -20%
                        </span>
                      </div>
                      <span className="text-yellow-300 font-semibold text-lg">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Add-ons */}
                <div className="mb-6 space-y-3">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white text-sm">{addon.name}</span>
                      </div>
                      <button className="text-gray-400 hover:text-white text-xl cursor-pointer">×</button>
                    </div>
                  ))}
                </div>

                {/* Selected Popular Add-ons */}
                {selectedAddons.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-500">
                    <h4 className="text-white font-semibold mb-3">Added Upgrades</h4>
                    <div className="space-y-3">
                      {selectedAddons.map((addonId) => {
                        const addon = popularAddons.find(a => a.id === addonId);
                        if (!addon) return null;
                        return (
                          <div key={addonId} className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{addon.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-green-300 font-bold">${addon.price.toFixed(2)}</p>
                              <button
                                onClick={() => toggleAddon(addonId)}
                                className="text-gray-400 hover:text-white text-xl cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-700">
                      <span className="text-gray-300">Add-ons subtotal</span>
                      <span className="text-white font-semibold">${addonsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-6 pb-8 border-t border-gray-500">
                  <span className="text-2xl font-bold text-white">total</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-400 mr-2">CAD</span>
                    <span className="text-3xl font-bold text-white">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Popular Add-ons */}
                <div className="pt-6 border-t border-gray-800">
                  <h4 className="text-white font-bold text-xl mb-6">
                    popular add-ons 🔥
                  </h4>
                  <div className="space-y-4">
                    {popularAddons.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          className={`relative bg-gradient-to-br ${addon.gradient} p-[2px] rounded-2xl`}
                        >
                          <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex justify-between items-start mb-4">
                              <h5 className="text-white text-lg pr-4">{addon.name}</h5>
                              <button
                                onClick={() => toggleAddon(addon.id)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-white text-black hover:bg-gray-100'
                                }`}
                              >
                                {isSelected ? (
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          
                          <div className="space-y-2 mb-4">
                            {addon.features.map((feature, idx) => (
                              <p key={idx} className="text-white text-sm">{feature}</p>
                            ))}
                          </div>
                          
                          <div className="flex items-baseline">
                            <span className="text-gray-200 text-sm mr-2">for only</span>
                            <span className="text-gray-200 line-through text-lg mr-2">
                              ${addon.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-green-300 font-bold text-2xl">
                              ${addon.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}