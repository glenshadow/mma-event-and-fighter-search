export interface EventSummary {
  id: number;
  name: string;
  date: string | null;
  status: string;
  location: string;
  fightsCount: number;
}

export interface Accolade {
  Type: string;
  Name: string;
}

export interface WorkerFight {
  fightId: number;
  fightOrder: number;
  status: string;
  cardSegment: string;
  weightClass: string;
  fighters: Array<{
    fighterId: number;
    name: string;
    corner: string;
    outcome: string;
    recordStr: string;
  }>;
  result: {
    method: string;
    endingRound: number | null;
    endingTime: string | null;
    endingNotes: string | null;
  } | null;
  accolades?: Accolade[];
}

export interface EventDetailed {
  id: number;
  name: string;
  date: string | null;
  status: string;
  timezone: string;
  location: {
    city: string;
    state: string;
    country: string;
    venue: string;
  };
  fights: WorkerFight[];
}

export interface FightHistoryItem {
  eventId: number;
  eventName: string;
  eventDate: string | null;
  fightId: number;
  opponentId: number;
  opponentName: string;
  outcome: string;
  weightClass: string;
  method: string;
  endingRound: number | null;
  endingTime: string | null;
  accolades?: Accolade[];
}

export interface FighterProfile {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string | null;
  fullName: string;
  born?: {
    city: string;
    state: string;
    country: string;
  } | null;
  fightingOutOf?: {
    city: string;
    state: string;
    country: string;
  } | null;
  record: {
    wins: number;
    losses: number;
    draws: number;
    noContests: number;
  };
  dob?: string | null;
  age: number | null;
  stance: string | null;
  height: number | null;
  reach?: number | null;
  weight: number | null;
  ufcLink?: string | null;
  headshot: string | null;
  bodyShot?: string | null;
  fightsParticipated?: FightHistoryItem[];
  fightsCount?: number;
}

export interface StatsSummary {
  finishList: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}
