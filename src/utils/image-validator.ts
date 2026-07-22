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
    lowerUrl.includes('placeholder') ||
    lowerUrl.includes('shadow') ||
    lowerUrl.includes('default') ||
    lowerUrl.includes('no-image') ||
    lowerUrl.includes('no_image')
  ) {
    return false;
  }

  const parts = lowerUrl.split('/');
  const filename = parts[parts.length - 1].split('?')[0];

  const cleanFirstName = (firstName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanLastName = (lastName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanFullName = (fullName || `${firstName || ''} ${lastName || ''}`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  if (cleanLastName && cleanLastName.length > 2 && filename.includes(cleanLastName)) return true;
  if (cleanFirstName && cleanFirstName.length > 2 && filename.includes(cleanFirstName)) return true;
  if (cleanFullName && cleanFullName.length > 3 && filename.includes(cleanFullName)) return true;

  const nameParts = (fullName || `${firstName || ''} ${lastName || ''}`)
    .toLowerCase()
    .split(/[\s\-_]+/)
    .map(p => p.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(p => p.length > 2);

  for (const part of nameParts) {
    if (filename.includes(part)) {
      return true;
    }
  }

  return false;
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
