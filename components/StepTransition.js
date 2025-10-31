'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const StepTransition = ({
  children,
  stepKey,
  direction = 'right', // 'right' or 'left'
  duration = 0.6,
  ease = 'power3.inOut',
  distance = 100
}) => {
  const ref = useRef(null);
  const prevStepKey = useRef(stepKey);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only animate if step actually changed
    if (prevStepKey.current !== stepKey) {
      const offset = direction === 'right' ? distance : -distance;
      
      // Set initial state (off-screen to the right)
      gsap.set(el, {
        x: offset,
        opacity: 0
      });

      // Animate in
      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration,
        ease,
        clearProps: 'all' // Clean up inline styles after animation
      });

      prevStepKey.current = stepKey;
    }

    return () => {
      gsap.killTweensOf(el);
    };
  }, [stepKey, direction, duration, ease, distance]);

  return (
    <div ref={ref} className="w-full">
      {children}
    </div>
  );
};

export default StepTransition;