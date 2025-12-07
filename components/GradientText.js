// components/GradientText.js
import React from 'react';

const GradientText = ({ children, size = '3xl' }) => {
  // Map sizes to Tailwind utilities for consistency
  const sizeClass = {
    'xl': 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-5xl lg:text-6xl', // Used for the main header
  }[size];

  return (
    <h1 
      className={`
        ${sizeClass} 
        font-extrabold 
        tracking-tight 
        inline-block
        /* Custom gradient using arbitrary values - You must ensure this maps to your exact colors */
        bg-clip-text 
        text-transparent
        bg-linear-to-r 
        from-yellow-500 via-emerald-500 to-[#4C6EF5] 
      `}
    >
      {children}
    </h1>
  );
};

export default GradientText;