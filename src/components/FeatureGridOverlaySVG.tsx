import React from 'react';

// Großes, zentrales Kreis-/Blob-Overlay für das 2x2 Feature-Grid
const FeatureGridOverlaySVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '120%', height: '120%', pointerEvents: 'none', zIndex: 0 }}
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient id="featureGridCircle" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.18" />
        <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.06" />
      </radialGradient>
    </defs>
    <circle
      cx="200"
      cy="200"
      r="170"
      fill="url(#featureGridCircle)"
    />
    <ellipse
      cx="120"
      cy="120"
      rx="40"
      ry="18"
      fill="#f472b6"
      fillOpacity="0.08"
    />
    <ellipse
      cx="280"
      cy="260"
      rx="32"
      ry="14"
      fill="#34d399"
      fillOpacity="0.10"
    />
  </svg>
);

export default FeatureGridOverlaySVG;
