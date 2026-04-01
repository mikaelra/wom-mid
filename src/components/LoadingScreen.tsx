'use client';

import { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

const STYLES = `
  @keyframes wom-octa-spin {
    from { transform: rotate(45deg) rotateY(0deg) rotateX(12deg); }
    to   { transform: rotate(45deg) rotateY(360deg) rotateX(12deg); }
  }
  @keyframes wom-dot-1 {
    0%    { opacity: 1; }
    75%   { opacity: 1; }
    75.1% { opacity: 0; }
    100%  { opacity: 0; }
  }
  @keyframes wom-dot-2 {
    0%    { opacity: 0; }
    25%   { opacity: 0; }
    25.1% { opacity: 1; }
    75%   { opacity: 1; }
    75.1% { opacity: 0; }
    100%  { opacity: 0; }
  }
  @keyframes wom-dot-3 {
    0%    { opacity: 0; }
    50%   { opacity: 0; }
    50.1% { opacity: 1; }
    75%   { opacity: 1; }
    75.1% { opacity: 0; }
    100%  { opacity: 0; }
  }
`;

export default function LoadingScreen() {
  const { progress, active, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  useEffect(() => {
    if (active && total > 0) setHasStartedLoading(true);
  }, [active, total]);

  useEffect(() => {
    if (hasStartedLoading && !active && progress >= 100) {
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasStartedLoading, active, progress]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {/* 3D spinning octahedron using CSS perspective + diamond shape */}
        <div style={{ perspective: '400px', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #FFD000 0%, #FF8C00 50%, #FF4500 100%)',
              animation: 'wom-octa-spin 2s linear infinite',
              boxShadow: '0 0 30px rgba(255, 140, 0, 0.55)',
            }}
          />
        </div>

        {/* Loading text with animated dots */}
        <p
          style={{
            color: '#888888',
            fontSize: '1.1rem',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-geist-sans, sans-serif)',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          Loading
          <span style={{ animation: 'wom-dot-1 2s linear infinite', marginLeft: 1 }}>.</span>
          <span style={{ animation: 'wom-dot-2 2s linear infinite' }}>.</span>
          <span style={{ animation: 'wom-dot-3 2s linear infinite' }}>.</span>
        </p>
      </div>
    </>
  );
}
