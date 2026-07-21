import { useState } from 'react';
import { FighterProfile } from '../../types';
import ImageWithLoader from '../ImageWithLoader';
import { getFighterHeadshotUrl } from '../../utils/image-validator';

/**
 * FighterHeadshotProps defines the input configuration for the FighterHeadshot component.
 * @property {FighterProfile} fighter - The database profile object of the athlete including name and metadata.
 * @property {string} [className] - Optional custom Tailwind CSS classes to override dimensions or styling.
 */
interface FighterHeadshotProps {
  fighter: FighterProfile;
  className?: string;
}

/**
 * FighterHeadshot component displays a validated athlete photo.
 * Features a multi-tiered resilience system:
 * 1. Tries to resolve verified URL from local master imagery database or the profile itself.
 * 2. Falls back to official UFC Silhouette image if load fails.
 * 3. Safely renders a stylish CSS-rendered initials badge if all network imagery fails.
 */
export default function FighterHeadshot({ fighter, className = "w-9 h-9" }: FighterHeadshotProps) {
  const [error, setError] = useState(false);
  const [evenFallbackFails, setEvenFallbackFails] = useState(false);
  const initials = `${fighter.firstName?.[0] || ""}${fighter.lastName?.[0] || ""}`.toUpperCase();

  // Official silhouette headshot as fallback
  const defaultHeadshot = "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2019-04/SILHOUETTE.png?itok=YsYQ-PdM";
  
  // Resolve from both fighter object and the master fighter-images list
  const validatedHeadshot = getFighterHeadshotUrl(fighter);
  const headshotUrl = validatedHeadshot || defaultHeadshot;

  if (evenFallbackFails) {
    return (
      <div className={`${className} rounded-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-300/30 text-slate-700 font-mono text-[10px] font-bold shadow-inner shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <ImageWithLoader
      src={error ? defaultHeadshot : headshotUrl}
      alt={fighter.fullName}
      className={`${className} rounded-full object-cover border border-white/10 bg-black/40 shrink-0`}
      onError={() => {
        if (!error) {
          setError(true);
        } else {
          setEvenFallbackFails(true);
        }
      }}
      referrerPolicy="no-referrer"
    />
  );
}
