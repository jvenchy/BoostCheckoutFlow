'use client';

import { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import FaultyTerminal from '@/components/FaultyTerminal';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');

  const gridMul = useMemo(() => [2, 1], []);

  useEffect(() => {
    const redirectStatus = searchParams.get('redirect_status');

    if (redirectStatus === 'succeeded') setStatus('success');
    else if (redirectStatus === 'failed') setStatus('failed');
    else setStatus('processing');
  }, [searchParams]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background FaultyTerminal */}
      <div className="absolute inset-0 z-0">
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

      {/* Foreground content */}
      <div className="relative z-10 pt-20">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          {status === 'success' && (
            <div>
              <div className="mb-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">payment successful!</h1>

              <p className="text-xl text-gray-300 mb-8">
                thank you for your order. we've received your payment and your campaign will begin shortly.
              </p>

              <div className="bg-black/30 backdrop-blur-md border border-white/10  rounded-2xl p-6 mb-8">
                <p className="text-white mb-4">
                  A confirmation email has been sent to your inbox with all the details.
                </p>
                <p className="text-gray-400 text-sm">
                  Your PRO subscription free trial has also been activated.
                </p>
              </div>

              <a
                href="/"
                className="inline-block bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl text-lg hover:bg-white/30 transition-colors"
              >
                return to home
              </a>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div className="mb-6">
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">Payment Failed</h1>

              <p className="text-xl text-gray-400 mb-8">
                We couldn't process your payment. Please try again.
              </p>

              <a
                href="/"
                className="inline-block bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-cyan-300 transition-colors"
              >
                Try Again
              </a>
            </div>
          )}

          {(status === 'processing' || status === 'verifying') && (
            <div>
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-12 h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0
                    c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">Processing Payment...</h1>

              <p className="text-xl text-gray-400">Please wait while we confirm your payment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
