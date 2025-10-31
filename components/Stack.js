import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import './Stack.css';

function CardRotate({ children, onSendToBack, sensitivity }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cardDimensions = { width: 208, height: 208 },
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  renderCard = null,
  onActiveCardChange = null,
  onStackReady = null
}) {
  const [cards, setCards] = useState(
    cardsData.length
      ? cardsData
      : [
          { id: 1, img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format' },
          { id: 2, img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format' },
          { id: 3, img: 'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format' },
          { id: 4, img: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format' }
        ]
  );

  // Sync cards state when cardsData prop changes
  useEffect(() => {
    if (cardsData.length > 0) {
      setCards(cardsData);
    }
  }, [cardsData]);

  const sendToBack = useCallback((instanceId) => {
    setCards(prev => {
      const newCards = [...prev];
      const index = newCards.findIndex(card => card.instanceId === instanceId);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  }, []);

  // Navigate forward (send top card to back)
  const sendTopToBack = useCallback(() => {
    setCards(prev => {
      if (prev.length > 0) {
        const newCards = [...prev];
        const topCard = newCards.pop();
        newCards.unshift(topCard);
        return newCards;
      }
      return prev;
    });
  }, []);

  // Navigate backward (send bottom card to top)
  const sendBottomToTop = useCallback(() => {
    setCards(prev => {
      if (prev.length > 0) {
        const newCards = [...prev];
        const bottomCard = newCards.shift();
        newCards.push(bottomCard);
        return newCards;
      }
      return prev;
    });
  }, []);

  // Store random rotations in state to persist across renders
  const [randomRotations, setRandomRotations] = useState({});
  const prevCardsRef = useRef([]);

  // Generate random rotations for new cards only
  useEffect(() => {
    if (randomRotation) {
      setRandomRotations(prev => {
        const newRotations = { ...prev };
        let hasNewCards = false;

        cards.forEach(card => {
          const key = card.instanceId || card.id;
          if (!(key in newRotations)) {
            newRotations[key] = Math.random() * 10 - 5;
            hasNewCards = true;
          }
        });

        return hasNewCards ? newRotations : prev;
      });
    }
  }, [cards, randomRotation]);

  // Notify about active card changes when the top card changes
  useEffect(() => {
    if (cards.length > 0 && onActiveCardChange) {
      const topCard = cards[cards.length - 1];
      const prevTopCard = prevCardsRef.current[prevCardsRef.current.length - 1];

      // Notify if the top card has changed (or on initial mount when prevCards is empty)
      const topCardKey = topCard?.instanceId || topCard?.id;
      const prevTopCardKey = prevTopCard?.instanceId || prevTopCard?.id;

      if (!prevTopCard || topCardKey !== prevTopCardKey) {
        onActiveCardChange(topCard, cards.length - 1);
      }

      prevCardsRef.current = cards;
    }
  }, [cards, onActiveCardChange]);

  // Expose methods to parent
  useEffect(() => {
    if (onStackReady) {
      onStackReady({ sendTopToBack, sendBottomToTop });
    }
  }, [sendTopToBack, sendBottomToTop, onStackReady]);

  return (
    <div
      className="stack-container"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        perspective: 600
      }}
    >
      {cards.map((card, index) => {
        const cardKey = card.instanceId || card.id;
        const randomRotate = randomRotations[cardKey] || 0;

        return (
          <CardRotate key={cardKey} onSendToBack={() => sendToBack(cardKey)} sensitivity={sensitivity}>
            <motion.div
              className={`card ${!renderCard ? 'card-with-border' : ''}`}
              onClick={() => sendToBackOnClick && sendToBack(cardKey)}
              animate={{
                rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: '90% 90%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height
              }}
            >
              {renderCard ? (
                renderCard(card, index, cards.length - index - 1 === 0)
              ) : (
                <img src={card.img} alt={`card-${card.id}`} className="card-image" />
              )}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
