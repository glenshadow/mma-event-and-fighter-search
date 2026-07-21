import { describe, it, expect, vi } from 'vitest';
import {
  isLegitimateFighterImage,
  getFighterHeadshotUrl,
  getFighterBodyShotUrl,
} from './image-validator';

// Mock the fighterImages JSON module to have predictable test data
vi.mock('../data/fighter-images.json', () => {
  return {
    default: {
      100: {
        headshot: 'https://example.com/cached_headshot_100.png',
        bodyShot: 'https://example.com/cached_bodyshot_100.png',
      },
      200: {
        headshot: 'https://example.com/silhouette_placeholder.png',
        bodyShot: null,
      },
    },
  };
});

describe('Image Validator Utility', () => {
  describe('isLegitimateFighterImage', () => {
    it('should return false for null, undefined, or empty URLs', () => {
      expect(isLegitimateFighterImage(null, 'Jon', 'Jones')).toBe(false);
      expect(isLegitimateFighterImage(undefined, 'Jon', 'Jones')).toBe(false);
      expect(isLegitimateFighterImage('', 'Jon', 'Jones')).toBe(false);
    });

    it('should return true for valid URLs', () => {
      expect(isLegitimateFighterImage('https://example.com/jon_jones.png', 'Jon', 'Jones')).toBe(true);
    });

    it('should allow generic silhouette placeholders', () => {
      expect(isLegitimateFighterImage('https://example.com/silhouette.png', 'Jon', 'Jones')).toBe(true);
      expect(isLegitimateFighterImage('https://example.com/comingsoon.png', 'Jon', 'Jones')).toBe(true);
      expect(isLegitimateFighterImage('https://example.com/placeholder.png', 'Jon', 'Jones')).toBe(true);
    });
  });

  describe('getFighterHeadshotUrl', () => {
    it('should return direct headshot if provided and valid', () => {
      const fighter = {
        id: 999,
        firstName: 'Jon',
        lastName: 'Jones',
        fullName: 'Jon Jones',
        headshot: 'https://example.com/jon_jones.png',
      };
      expect(getFighterHeadshotUrl(fighter)).toBe('https://example.com/jon_jones.png');
    });

    it('should fall back to cached headshot if direct is not provided', () => {
      const fighter = {
        id: 100,
        firstName: 'Georges',
        lastName: 'St-Pierre',
        fullName: 'Georges St-Pierre',
      };
      expect(getFighterHeadshotUrl(fighter)).toBe('https://example.com/cached_headshot_100.png');
    });

    it('should return null if no direct or cached headshot is found', () => {
      const fighter = {
        id: 555,
        firstName: 'Unknown',
        lastName: 'Fighter',
        fullName: 'Unknown Fighter',
      };
      expect(getFighterHeadshotUrl(fighter)).toBeNull();
    });
  });

  describe('getFighterBodyShotUrl', () => {
    it('should return direct bodyShot if provided and valid', () => {
      const fighter = {
        id: 999,
        firstName: 'Jon',
        lastName: 'Jones',
        fullName: 'Jon Jones',
        bodyShot: 'https://example.com/jon_jones_body.png',
      };
      expect(getFighterBodyShotUrl(fighter)).toBe('https://example.com/jon_jones_body.png');
    });

    it('should fall back to cached bodyShot if direct is not provided', () => {
      const fighter = {
        id: 100,
        firstName: 'Georges',
        lastName: 'St-Pierre',
        fullName: 'Georges St-Pierre',
      };
      expect(getFighterBodyShotUrl(fighter)).toBe('https://example.com/cached_bodyshot_100.png');
    });

    it('should return null if no direct or cached bodyShot is found', () => {
      const fighter = {
        id: 555,
        firstName: 'Unknown',
        lastName: 'Fighter',
        fullName: 'Unknown Fighter',
      };
      expect(getFighterBodyShotUrl(fighter)).toBeNull();
    });
  });
});
