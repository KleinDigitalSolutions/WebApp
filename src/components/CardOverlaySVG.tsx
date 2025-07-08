import React from 'react';

// Ein dezentes, halbtransparentes SVG-Overlay für Feature-Karten
const CardOverlaySVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="cardGradient" x1="0" y1="0" x2="120" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a7f3d0" stopOpacity="0.18" />
        <stop offset="1" stopColor="#38bdf8" stopOpacity="0.12" />
      </linearGradient>
    </defs>
    <path
      d="M0,20 Q30,0 60,20 T120,20 V60 H0 Z"
      fill="url(#cardGradient)"
    />
    <ellipse
      cx="90"
      cy="50"
      rx="22"
      ry="10"
      fill="#f472b6"
      fillOpacity="0.08"
    />
    <ellipse
      cx="30"
      cy="10"
      rx="18"
      ry="7"
      fill="#34d399"
      fillOpacity="0.10"
    />
  </svg>
);

export default CardOverlaySVG;
