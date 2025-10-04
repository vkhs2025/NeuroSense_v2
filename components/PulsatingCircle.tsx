import React from 'react';

export default function PulsatingCircle() {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="w-16 h-16 rounded-full bg-white/80 animate-pulseGlow shadow-2xl" />
      <div className="absolute w-24 h-24 rounded-full border-2 border-white/40 animate-pulseGlow" />
    </div>
  );
}
