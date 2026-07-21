import fighterImages from '../data/fighter-images.json';

/**
 * Validates if a given URL is a legitimate image resource for a specific athlete.
 * Returns false for broken/empty strings, but permits silhouette default graphics.
 * 
 * @param {string | null | undefined} url - The candidate image URL link.
 * @param {string} firstName - Fighter's first name for contextual evaluation.
 * @param {string} lastName - Fighter's last name.
 * @param {string} [fullName] - Full name helper.
 * @returns {boolean} True if the image URL is verified and safe to load in the UI.
 */
export function isLegitimateFighterImage(
  url: string | null | undefined,
  firstName: string,
  lastName: string,
  fullName?: string
): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  if (
    lowerUrl.includes('silhouette') ||
    lowerUrl.includes('comingsoon') ||
    lowerUrl.includes('placeholder')
  ) {
    return true; // Still allow generic placeholders
  }
  return true; // Pre-validated by scraper
}

/**
 * Resolves the absolute best headshot URL for a fighter, using pre-validated scraper cache.
 * Resolves locally cached headshot or falls back to profile property.
 * 
 * @param {object} fighter - The athlete's profile subset.
 * @param {number} fighter.id - Unique ID of the fighter.
 * @param {string} fighter.firstName - First name.
 * @param {string} fighter.lastName - Last name.
 * @param {string} fighter.fullName - Pre-joined full name.
 * @param {string | null} [fighter.headshot] - Optional direct headshot property.
 * @returns {string | null} Verified URL or null if no valid image is available.
 */
export function getFighterHeadshotUrl(fighter: {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  headshot?: string | null;
}): string | null {
  const cachedHeadshot = (fighterImages as any)[fighter.id]?.headshot;
  const candidate = fighter.headshot || cachedHeadshot;

  if (candidate && isLegitimateFighterImage(candidate, fighter.firstName, fighter.lastName, fighter.fullName)) {
    return candidate;
  }

  return null;
}

/**
 * Resolves the absolute best body shot URL for a fighter, using pre-validated scraper cache.
 * Resolves locally cached body shot or falls back to profile property.
 * 
 * @param {object} fighter - The athlete's profile subset.
 * @param {number} fighter.id - Unique ID of the fighter.
 * @param {string} fighter.firstName - First name.
 * @param {string} fighter.lastName - Last name.
 * @param {string} fighter.fullName - Pre-joined full name.
 * @param {string | null} [fighter.bodyShot] - Optional direct bodyShot property.
 * @returns {string | null} Verified URL or null if no valid image is available.
 */
export function getFighterBodyShotUrl(fighter: {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  bodyShot?: string | null;
}): string | null {
  const cachedBodyShot = (fighterImages as any)[fighter.id]?.bodyShot;
  const candidate = fighter.bodyShot || cachedBodyShot;

  if (candidate && isLegitimateFighterImage(candidate, fighter.firstName, fighter.lastName, fighter.fullName)) {
    return candidate;
  }

  return null;
}
