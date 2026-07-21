import React, { useState } from 'react';

interface ImageWithLoaderProps {
  src: string;
  alt?: string;
  className?: string;
  skeletonClassName?: string;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export default function ImageWithLoader({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  referrerPolicy = "no-referrer",
  style,
  onError,
  onLoad,
}: ImageWithLoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true); // Stop loading indicator on error
    setError(true);
    if (onError) onError(e);
  };

  // Determine skeleton styling
  const isCircle = className.includes('rounded-full');
  const skeletonShape = isCircle ? 'rounded-full' : 'rounded-xl';

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Skeleton placeholder */}
      {!loaded && (
        <div 
          className={`absolute inset-0 animate-pulse bg-white/5 border border-white/10 flex items-center justify-center ${skeletonShape} ${skeletonClassName}`}
        >
          {/* A tiny subtle spinning indicator */}
          <div className="w-4 h-4 border border-red-500/25 border-t-red-500/80 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy={referrerPolicy}
      />
    </div>
  );
}
