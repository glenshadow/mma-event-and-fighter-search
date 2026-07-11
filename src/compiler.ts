import * as fs from 'fs';
import * as path from 'path';

const START_ID = 1;
const BATCH_SIZE = 50;
const CACHE_DIR = path.join(process.cwd(), 'src/data/raw');
const OUTPUT_DIR = path.join(process.cwd(), 'public/data');

// Ensure directories exist
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

interface EventSummary {
  id: number;
  name: string;
  date: string | null;
  status: string;
  location: string;
  fightsCount: number;
}

interface Accolade {
  Type: string;
  Name: string;
}

interface WorkerFight {
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

interface EventDetailed {
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

interface FighterProfile {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string | null;
  fullName: string;
  born: {
    city: string;
    state: string;
    country: string;
  } | null;
  fightingOutOf: {
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
  dob: string | null;
  age: number | null;
  stance: string | null;
  height: number | null; // in inches
  reach: number | null; // in inches
  weight: number | null; // in lbs
  ufcLink: string | null;
  headshot?: string | null;
  bodyShot?: string | null;
  fightsParticipated: Array<{
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
  }>;
}

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await fetch(url);
      if (resp.status === 404) {
        return null; // Don't retry for 404
      }
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
  return null;
}

async function compile() {
  console.log(`Starting MMA Data Compiler (Dynamic Auto-increment Mode)`);
  
  const eventsDataList: any[] = [];
  const missingIds: number[] = [];
  const loadedEventIds = new Set<number>();
  let maxLocalId = 0;

  // 1. Scan and parse files in the raw folder
  console.log(`Scanning all local files in cache directory ${CACHE_DIR}...`);
  if (fs.existsSync(CACHE_DIR)) {
    const localFiles = fs.readdirSync(CACHE_DIR).filter(file => file.endsWith('.json'));
    console.log(`Found ${localFiles.length} files in raw cache folder.`);
    
    for (const file of localFiles) {
      const idMatch = file.match(/^(\d+)\.json$/);
      if (!idMatch) continue;
      const fileId = Number(idMatch[1]);
      if (fileId > maxLocalId) {
        maxLocalId = fileId;
      }

      const cachePath = path.join(CACHE_DIR, file);
      try {
        const raw = fs.readFileSync(cachePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.LiveEventDetail) {
          const eventId = Number(parsed.LiveEventDetail.EventId);
          if (eventId) {
            // Check if the event needs to be re-downloaded
            // Rule: Any event that has not happened yet (is in the future, or is not Final/Over)
            const eventStatus = parsed.LiveEventDetail.Status;
            const startTimeStr = parsed.LiveEventDetail.StartTime;
            const eventDate = startTimeStr ? new Date(startTimeStr) : null;
            const isFuture = eventDate ? eventDate.getTime() > Date.now() : false;
            const isUpcoming = eventStatus === 'Upcoming' || eventStatus === 'Live' || isFuture;

            if (isUpcoming) {
              console.log(`Event #${eventId} ("${parsed.LiveEventDetail.Name}") has not happened yet or is upcoming. Will re-download.`);
              // Do NOT add to loadedEventIds or eventsDataList so it gets re-downloaded
            } else {
              eventsDataList.push(parsed.LiveEventDetail);
              loadedEventIds.add(eventId);
            }
          }
        }
      } catch (e: any) {
        console.warn(`Failed to parse local file ${file}:`, e.message);
      }
    }
  }

  // 2. Identify missing standard range IDs and fetch/update them if needed
  const idsToDownload: number[] = [];
  for (let id = START_ID; id <= maxLocalId; id++) {
    if (!loadedEventIds.has(id)) {
      idsToDownload.push(id);
    }
  }

  if (idsToDownload.length > 0) {
    console.log(`Downloading/updating ${idsToDownload.length} events up to ID ${maxLocalId}...`);
    for (let i = 0; i < idsToDownload.length; i += BATCH_SIZE) {
      const chunk = idsToDownload.slice(i, i + BATCH_SIZE);
      console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(idsToDownload.length / BATCH_SIZE)}...`);
      await Promise.all(chunk.map(async (id) => {
        const cachePath = path.join(CACHE_DIR, `${id}.json`);
        const url = `https://d29dxerjsp82wz.cloudfront.net/api/v3/event/live/${id}.json`;
        try {
          const data = await fetchWithRetry(url);
          if (data && data.LiveEventDetail && data.LiveEventDetail.EventId) {
            const isEmpty = Object.keys(data.LiveEventDetail).length === 0;
            if (!isEmpty) {
              fs.writeFileSync(cachePath, JSON.stringify(data), 'utf8');
              eventsDataList.push(data.LiveEventDetail);
              loadedEventIds.add(id);
            } else {
              // Read local fallback if possible, else mark as missing
              let localFallbackLoaded = false;
              if (fs.existsSync(cachePath)) {
                try {
                  const raw = fs.readFileSync(cachePath, 'utf8');
                  const parsed = JSON.parse(raw);
                  if (parsed && parsed.LiveEventDetail && parsed.LiveEventDetail.EventId) {
                    eventsDataList.push(parsed.LiveEventDetail);
                    loadedEventIds.add(id);
                    localFallbackLoaded = true;
                    console.log(`Fetched empty response for ID ${id}, using cached local fallback.`);
                  }
                } catch (fallbackErr) {}
              }
              if (!localFallbackLoaded) {
                missingIds.push(id);
              }
            }
          } else {
            // Read local fallback if possible, else mark as missing
            let localFallbackLoaded = false;
            if (fs.existsSync(cachePath)) {
              try {
                const raw = fs.readFileSync(cachePath, 'utf8');
                const parsed = JSON.parse(raw);
                if (parsed && parsed.LiveEventDetail && parsed.LiveEventDetail.EventId) {
                  eventsDataList.push(parsed.LiveEventDetail);
                  loadedEventIds.add(id);
                  localFallbackLoaded = true;
                  console.log(`Download failed for ID ${id}, using cached local fallback.`);
                }
              } catch (fallbackErr) {}
            }
            if (!localFallbackLoaded) {
              missingIds.push(id);
            }
          }
        } catch (e: any) {
          console.error(`Failed to fetch event ID ${id}:`, e.message);
          let localFallbackLoaded = false;
          if (fs.existsSync(cachePath)) {
            try {
              const raw = fs.readFileSync(cachePath, 'utf8');
              const parsed = JSON.parse(raw);
              if (parsed && parsed.LiveEventDetail && parsed.LiveEventDetail.EventId) {
                eventsDataList.push(parsed.LiveEventDetail);
                loadedEventIds.add(id);
                localFallbackLoaded = true;
                console.log(`Failed to download ID ${id}, using cached local fallback.`);
              }
            } catch (fallbackErr) {}
          }
          if (!localFallbackLoaded) {
            missingIds.push(id);
          }
        }
      }));
    }
  }

  // 3. Keep incrementing the ID beyond maxLocalId to download new events
  let nextId = maxLocalId + 1;
  if (nextId < START_ID) {
    nextId = START_ID;
  }
  console.log(`Starting dynamic download of new events from ID ${nextId}...`);
  
  while (true) {
    const url = `https://d29dxerjsp82wz.cloudfront.net/api/v3/event/live/${nextId}.json`;
    console.log(`Checking for new event at ID ${nextId}...`);
    try {
      const data = await fetchWithRetry(url);
      if (!data || !data.LiveEventDetail || Object.keys(data.LiveEventDetail).length === 0 || !data.LiveEventDetail.EventId) {
        console.log(`Reached end of available events on CDN. Event ID ${nextId} returned empty or invalid.`);
        break;
      }
      
      const cachePath = path.join(CACHE_DIR, `${nextId}.json`);
      fs.writeFileSync(cachePath, JSON.stringify(data), 'utf8');
      eventsDataList.push(data.LiveEventDetail);
      loadedEventIds.add(nextId);
      console.log(`Successfully downloaded new event ID ${nextId}: "${data.LiveEventDetail.Name}"`);
      
      nextId++;
    } catch (e: any) {
      console.log(`Failed to fetch or parse ID ${nextId}: ${e.message}. Treating as end of available events.`);
      break;
    }
  }
  
  console.log(`Processing complete. Found ${eventsDataList.length} valid events. Missing/404 standard events count: ${missingIds.length}`);
  
  // Now, compile and construct indices
  const eventsSummary: EventSummary[] = [];
  const eventsDetailed: EventDetailed[] = [];
  const fightersMap = new Map<number, FighterProfile>();
  
  // Sort events by date / ID
  eventsDataList.sort((a, b) => {
    const dateA = a.StartTime ? new Date(a.StartTime).getTime() : 0;
    const dateB = b.StartTime ? new Date(b.StartTime).getTime() : 0;
    return dateA - dateB; // Chronological order
  });
  
  for (const event of eventsDataList) {
    const eventId = Number(event.EventId);
    if (!eventId) continue;
    
    const eventName = event.Name || `Event #${eventId}`;
    const startTime = event.StartTime || null;
    const isLiveOrUpcoming = event.Status !== 'Final';
    
    const city = event.Location?.City || '';
    const state = event.Location?.State || '';
    const country = event.Location?.Country || '';
    const venue = event.Location?.Venue || '';
    const locationStr = [city, state, country].filter(Boolean).join(', ');
    
    const fightCardRaw = event.FightCard || [];
    
    // Add to summary
    eventsSummary.push({
      id: eventId,
      name: eventName,
      date: startTime,
      status: event.Status || 'Final',
      location: locationStr || venue || 'TBA',
      fightsCount: fightCardRaw.length
    });
    
    // Add to detailed
    const fightsDetailed: WorkerFight[] = [];
    
    for (const fight of fightCardRaw) {
      const fightId = Number(fight.FightId);
      const fightersArray = fight.Fighters || [];
      const weightClassStr = fight.WeightClass?.Description || 'Catchweight';
      
      const briefFighters = fightersArray.map((f: any) => {
        const firstName = f.Name?.FirstName || '';
        const lastName = f.Name?.LastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const wins = f.Record?.Wins ?? 0;
        const losses = f.Record?.Losses ?? 0;
        const draws = f.Record?.Draws ?? 0;
        const recordStr = `${wins}-${losses}-${draws}`;
        
        return {
          fighterId: Number(f.FighterId),
          name: fullName,
          corner: f.Corner || 'Blue',
          outcome: f.Outcome?.Outcome || 'Unknown',
          recordStr
        };
      });
      
      const resultObj = fight.Result ? {
        method: fight.Result.Method || 'N/A',
        endingRound: fight.Result.EndingRound ? Number(fight.Result.EndingRound) : null,
        endingTime: fight.Result.EndingTime || null,
        endingNotes: fight.Result.EndingNotes || null
      } : null;
      
      fightsDetailed.push({
        fightId,
        fightOrder: Number(fight.FightOrder) || 0,
        status: fight.Status || 'Upcoming',
        cardSegment: fight.CardSegment || 'Main',
        weightClass: weightClassStr,
        fighters: briefFighters,
        result: resultObj,
        accolades: fight.Accolades || []
      });
      
      // Update fighter profile database
      for (const f of fightersArray) {
        const fighterId = Number(f.FighterId);
        if (!fighterId) continue;
        
        const firstName = f.Name?.FirstName || '';
        const lastName = f.Name?.LastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Find opponent in this fight
        const opponent = fightersArray.find((o: any) => Number(o.FighterId) !== fighterId);
        const opponentId = opponent ? Number(opponent.FighterId) : 0;
        const opponentFirstName = opponent?.Name?.FirstName || '';
        const opponentLastName = opponent?.Name?.LastName || '';
        const opponentFullName = opponent ? `${opponentFirstName} ${opponentLastName}`.trim() : 'Unknown Fighter';
        
        const outcomeStr = f.Outcome?.Outcome || 'Unknown';
        
        const fightRecord = {
          eventId,
          eventName,
          eventDate: startTime,
          fightId,
          opponentId,
          opponentName: opponentFullName,
          outcome: outcomeStr,
          weightClass: weightClassStr,
          method: fight.Result?.Method || 'N/A',
          endingRound: fight.Result?.EndingRound ? Number(fight.Result.EndingRound) : null,
          endingTime: fight.Result?.EndingTime || null
        };
        
        if (!fightersMap.has(fighterId)) {
          // Initialize fighter profile
          fightersMap.set(fighterId, {
            id: fighterId,
            firstName,
            lastName,
            nickName: f.Name?.NickName || null,
            fullName,
            born: f.Born ? {
              city: f.Born.City || '',
              state: f.Born.State || '',
              country: f.Born.Country || ''
            } : null,
            fightingOutOf: f.FightingOutOf ? {
              city: f.FightingOutOf.City || '',
              state: f.FightingOutOf.State || '',
              country: f.FightingOutOf.Country || ''
            } : null,
            record: {
              wins: Number(f.Record?.Wins) || 0,
              losses: Number(f.Record?.Losses) || 0,
              draws: Number(f.Record?.Draws) || 0,
              noContests: Number(f.Record?.NoContests) || 0
            },
            dob: f.DOB || null,
            age: Number(f.Age) || null,
            stance: f.Stance || null,
            height: Number(f.Height) || null,
            reach: Number(f.Reach) || null,
            weight: Number(f.Weight) || null,
            ufcLink: f.UFCLink || null,
            fightsParticipated: [fightRecord]
          });
        } else {
          // Fighter already exists, append fight to history if not duplicate
          const existing = fightersMap.get(fighterId)!;
          
          // Overwrite biographical details if current entry is newer/more complete
          if (f.Record) {
            existing.record = {
              wins: Math.max(existing.record.wins, Number(f.Record.Wins) || 0),
              losses: Math.max(existing.record.losses, Number(f.Record.Losses) || 0),
              draws: Math.max(existing.record.draws, Number(f.Record.Draws) || 0),
              noContests: Math.max(existing.record.noContests, Number(f.Record.NoContests) || 0),
            };
          }
          if (f.Age && (!existing.age || f.Age > existing.age)) existing.age = f.Age;
          if (f.Height) existing.height = f.Height;
          if (f.Reach) existing.reach = f.Reach;
          if (f.Weight) existing.weight = f.Weight;
          if (f.Stance) existing.stance = f.Stance;
          if (f.Born?.Country && !existing.born?.country) {
            existing.born = {
              city: f.Born.City || '',
              state: f.Born.State || '',
              country: f.Born.Country || ''
            };
          }
          if (f.FightingOutOf?.Country && !existing.fightingOutOf?.country) {
            existing.fightingOutOf = {
              city: f.FightingOutOf.City || '',
              state: f.FightingOutOf.State || '',
              country: f.FightingOutOf.Country || ''
            };
          }
          
          // Only add fight if not already in fightsParticipated
          const hasFight = existing.fightsParticipated.some(p => p.fightId === fightId);
          if (!hasFight) {
            existing.fightsParticipated.push(fightRecord);
          }
        }
      }
    }
    
    eventsDetailed.push({
      id: eventId,
      name: eventName,
      date: startTime,
      status: event.Status || 'Final',
      timezone: event.TimeZone || 'UTC',
      location: {
        city,
        state,
        country,
        venue
      },
      fights: fightsDetailed
    });
  }
  
  // Sort fightsParticipated in fighter profiles chronologically
  for (const [_, profile] of fightersMap) {
    profile.fightsParticipated.sort((a, b) => {
      const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      return dateB - dateA; // Descending (recent fights first)
    });
  }
  
  // Save files to public/data/
  let imageMap: Record<number, { headshot: string | null; bodyShot: string | null }> = {};
  const IMAGES_CACHE_PATH = path.join(process.cwd(), 'src/data/fighter-images.json');
  if (fs.existsSync(IMAGES_CACHE_PATH)) {
    try {
      imageMap = JSON.parse(fs.readFileSync(IMAGES_CACHE_PATH, 'utf8'));
      console.log(`Loaded ${Object.keys(imageMap).length} fighter image mappings.`);
    } catch (e: any) {
      console.warn('Failed to load fighter images cache:', e.message);
    }
  }

  const fighterProfilesList = Array.from(fightersMap.values()).map(profile => {
    const images = imageMap[profile.id] || { headshot: null, bodyShot: null };
    return {
      ...profile,
      headshot: images.headshot || null,
      bodyShot: images.bodyShot || null
    };
  });
  
  // Ensure individual directories exist
  const EVENTS_DIR = path.join(OUTPUT_DIR, 'events');
  const FIGHTERS_DIR = path.join(OUTPUT_DIR, 'fighters');
  fs.mkdirSync(EVENTS_DIR, { recursive: true });
  fs.mkdirSync(FIGHTERS_DIR, { recursive: true });
  
  console.log(`Writing ${eventsSummary.length} summaries to public/data/events-summary.json...`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'events-summary.json'), JSON.stringify(eventsSummary), 'utf8');
  
  console.log(`Writing individual detailed events to public/data/events/...`);
  for (const event of eventsDetailed) {
    fs.writeFileSync(path.join(EVENTS_DIR, `${event.id}.json`), JSON.stringify(event), 'utf8');
  }
  
  // Also write an empty array to the deprecated events-detailed.json for compatibility
  console.log(`Writing fallback events-detailed.json...`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'events-detailed.json'), '[]', 'utf8');
  
  console.log(`Writing individual detailed fighters to public/data/fighters/...`);
  for (const profile of fighterProfilesList) {
    fs.writeFileSync(path.join(FIGHTERS_DIR, `${profile.id}.json`), JSON.stringify(profile), 'utf8');
  }
  
  console.log(`Writing summarized fighter profiles index to public/data/fighters.json...`);
  const summarizedFighters = fighterProfilesList.map(profile => ({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickName: profile.nickName,
    fullName: profile.fullName,
    record: profile.record,
    age: profile.age,
    stance: profile.stance,
    height: profile.height,
    weight: profile.weight,
    headshot: profile.headshot || null,
    fightsCount: profile.fightsParticipated.length
  }));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'fighters.json'), JSON.stringify(summarizedFighters), 'utf8');

  // Pre-calculate statistics (such as finish methods distribution) to keep index tiny and fast
  console.log(`Writing precomputed statistics to public/data/stats-summary.json...`);
  const finishes: Record<string, number> = {};
  let totalWinsWithHist = 0;
  for (const profile of fighterProfilesList) {
    for (const fight of profile.fightsParticipated) {
      if (fight.outcome === 'Win' && fight.method && fight.method !== 'N/A') {
        const methodGroup = fight.method.split(' ')[0].split('/')[0].split('(')[0].trim();
        finishes[methodGroup] = (finishes[methodGroup] || 0) + 1;
        totalWinsWithHist++;
      }
    }
  }
  const finishList = Object.entries(finishes)
    .map(([name, count]) => ({
      name: name === 'Decision' ? 'Decision (U/M/S/D)' : name,
      count,
      percentage: totalWinsWithHist ? Math.round((count / totalWinsWithHist) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const statsSummary = {
    finishList
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'stats-summary.json'), JSON.stringify(statsSummary), 'utf8');

  // Pre-calculate champions/kings dataset dynamically from historical event logs
  console.log(`Analyzing title fights chronologically to compile active Divisional Champions...`);
  
  const DIVISION_ORDER = [
    "Heavyweight",
    "Light Heavyweight",
    "Middleweight",
    "Welterweight",
    "Lightweight",
    "Featherweight",
    "Bantamweight",
    "Flyweight",
    "Women's Featherweight",
    "Women's Bantamweight",
    "Women's Flyweight",
    "Women's Strawweight"
  ];

  const DIVISION_TITLE_MAP: Record<string, string> = {
    "Heavyweight": "Heavyweight Champion",
    "Light Heavyweight": "Light Heavyweight Champion",
    "Middleweight": "Middleweight Champion",
    "Welterweight": "Welterweight Champion",
    "Lightweight": "Lightweight Champion",
    "Featherweight": "Featherweight Champion",
    "Bantamweight": "Bantamweight Champion",
    "Flyweight": "Flyweight Champion",
    "Women's Featherweight": "Women's Featherweight Champion",
    "Women's Bantamweight": "Women's Bantamweight Champion",
    "Women's Flyweight": "Women's Flyweight Champion",
    "Women's Strawweight": "Women's Strawweight Champion"
  };

  const latestChampions: Record<string, {
    id: number;
    fullName: string;
    nickName: string | null;
  }> = {};

  // Find all title fights chronologically (eventsDataList is already sorted chronologically)
  for (const event of eventsDataList) {
    const fightCard = event.FightCard || [];
    for (const fight of fightCard) {
      const accolades = fight.Accolades || [];
      const isTitleFight = accolades.some((acc: any) => 
        acc.Type === 'Belt' && 
        acc.Name && 
        acc.Name.includes('Title')
      );
      
      if (isTitleFight && fight.Status === 'Final' && fight.Fighters) {
        const winner = fight.Fighters.find((f: any) => f.Outcome && f.Outcome.Outcome === 'Win');
        if (winner) {
          const fid = Number(winner.FighterId);
          const weightClassDesc = fight.WeightClass?.Description;
          if (fid && weightClassDesc) {
            const firstName = winner.Name?.FirstName || '';
            const lastName = winner.Name?.LastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            latestChampions[weightClassDesc] = {
              id: fid,
              fullName,
              nickName: winner.Name?.NickName || null
            };
          }
        }
      }
    }
  }

  // Fallbacks just in case a division has no title fights recorded
  const fallbacks: Record<string, any> = {
    "Heavyweight": { id: 1409, fullName: "Daniel Cormier", nickName: "DC" },
    "Light Heavyweight": { id: 1139, fullName: "Alexander Gustafsson", nickName: "The Mauler" },
    "Middleweight": { id: 1294, fullName: "Luke Rockhold", nickName: "Strike Legend" },
    "Welterweight": { id: 1386, fullName: "Tyron Woodley", nickName: "The Chosen One" },
    "Lightweight": { id: 1069, fullName: "Anthony Pettis", nickName: "Showtime" },
    "Featherweight": { id: 1052, fullName: "Jose Aldo", nickName: "The King of Rio" },
    "Bantamweight": { id: 1057, fullName: "Dominick Cruz", nickName: "The Dominator" },
    "Flyweight": { id: 1091, fullName: "Ian McCall", nickName: "Uncle Creepy" },
    "Women's Featherweight": { id: 1194, fullName: "Cristiane Justino", nickName: "Cyborg" },
    "Women's Strawweight": { id: 1347, fullName: "Michelle Waterson-Gomez", nickName: "The Karate Hottie" }
  };

  const compiledChampions = DIVISION_ORDER.map(weightClass => {
    const champ = latestChampions[weightClass] || fallbacks[weightClass];
    if (!champ) return null;

    const fighter = fightersMap.get(champ.id);
    const images = imageMap[champ.id] || { headshot: null, bodyShot: null };
    
    const wins = fighter ? fighter.record.wins : 0;
    const losses = fighter ? fighter.record.losses : 0;
    const draws = fighter ? fighter.record.draws : 0;
    const recordStr = `${wins}-${losses}-${draws}`;

    return {
      id: champ.id,
      fullName: fighter ? fighter.fullName : champ.fullName,
      nickName: (fighter && fighter.nickName) ? fighter.nickName : champ.nickName,
      bodyShot: images.bodyShot || images.headshot || null,
      weightClass: DIVISION_TITLE_MAP[weightClass] || `${weightClass} Champion`,
      record: recordStr,
      theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
    };
  }).filter(Boolean);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'champions.json'), JSON.stringify(compiledChampions), 'utf8');
  console.log(`Successfully compiled and wrote ${compiledChampions.length} champions to public/data/champions.json.`);
  
  console.log("Success! Compiled MMA searchable static database files.");
}

compile().catch(e => {
  console.error("Compilation error:", e);
});
