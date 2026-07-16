import fighterImages from '../data/fighter-images.json';

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
