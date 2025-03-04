"use client";

import { useParticleAnimation } from '@/hooks/useParticleAnimation';
import { cn } from "@/lib/utils";

export function AnimatedBackground() {
  const particles = useParticleAnimation();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-950/30 via-red-950/20 to-black/50" />
      {particles.map(particle => (
        <div
          key={particle.id}
          className={cn(
            "absolute text-2xl transition-transform duration-100 select-none",
            "animate-float"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: `scale(${particle.scale})`,
            opacity: particle.opacity,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}