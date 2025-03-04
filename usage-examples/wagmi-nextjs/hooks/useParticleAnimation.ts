import { useState, useEffect } from 'react';
import { ANIMATION_SETTINGS } from '@/lib/constants';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  scale: number;
  opacity: number;
}

export function useParticleAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const initialParticles = Array.from(
      { length: ANIMATION_SETTINGS.PARTICLE_COUNT }, 
      (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: ANIMATION_SETTINGS.EMOJIS[
          Math.floor(Math.random() * ANIMATION_SETTINGS.EMOJIS.length)
        ],
        speed: 0.5 + Math.random() * 1.5,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.3,
      })
    );

    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y <= 0 ? 100 : particle.y - particle.speed,
        x: particle.x + Math.sin(particle.y / 30) * 0.2,
      })));
    }, ANIMATION_SETTINGS.UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return particles;
}