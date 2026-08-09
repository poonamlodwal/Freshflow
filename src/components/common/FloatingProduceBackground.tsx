'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const produceItems = [
  { emoji: '🥭', name: 'Indian Alphonso Mango', size: 'text-5xl sm:text-6xl md:text-7xl', left: '5%', duration: 11, delay: 0 },
  { emoji: '🍎', name: 'Kashmiri Red Apple', size: 'text-6xl sm:text-7xl', left: '20%', duration: 9, delay: 1 },
  { emoji: '🥑', name: 'Mexican Hass Avocado', size: 'text-5xl sm:text-6xl', left: '35%', duration: 13, delay: 2.5 },
  { emoji: '🍓', name: 'Wild Strawberry', size: 'text-5xl sm:text-6xl', left: '50%', duration: 10, delay: 0.5 },
  { emoji: '🥦', name: 'Fresh Broccoli', size: 'text-6xl sm:text-7xl', left: '65%', duration: 14, delay: 3 },
  { emoji: '🐉', name: 'Thai Dragon Fruit', size: 'text-5xl sm:text-6xl', left: '78%', duration: 12, delay: 1.5 },
  { emoji: '🍍', name: 'Golden Pineapple', size: 'text-6xl sm:text-7xl', left: '90%', duration: 15, delay: 4 },
  { emoji: '🥝', name: 'NZ Gold Kiwi', size: 'text-5xl sm:text-6xl', left: '12%', duration: 10.5, delay: 3.5 },
  { emoji: '🍊', name: 'Nagpur Orange', size: 'text-5xl sm:text-6xl', left: '58%', duration: 11.5, delay: 2 },
  { emoji: '🫑', name: 'Bell Pepper', size: 'text-5xl sm:text-6xl', left: '42%', duration: 13.5, delay: 4.5 },
];

export function FloatingProduceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
      {produceItems.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size} opacity-50 dark:opacity-40 filter drop-shadow-lg`}
          style={{ left: item.left, top: '-12%' }}
          animate={{
            y: ['0vh', '120vh'],
            rotate: [0, 360],
            x: ['0px', index % 2 === 0 ? '45px' : '-45px', '0px'],
            scale: [0.95, 1.15, 0.95],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: item.delay,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}

export default FloatingProduceBackground;
