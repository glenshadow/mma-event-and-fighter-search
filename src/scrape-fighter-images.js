import * as fs from 'fs';
import * as path from 'path';

const FIGHTERS_DIR = path.join(process.cwd(), 'public/data/fighters');
const IMAGES_CACHE_PATH = path.join(process.cwd(), 'src/data/fighter-images.json');

async function scrapeAll() {
  console.log('Starting UFC fighter image scraper...');
  
  if (!fs.existsSync(FIGHTERS_DIR)) {
    console.error('Fighters directory not found at ' + FIGHTERS_DIR);
    return;
  }
  
  const files = fs.readdirSync(FIGHTERS_DIR).filter(file => file.endsWith('.json'));
  const fighters = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(FIGHTERS_DIR, file), 'utf8'));
      fighters.push(data);
    } catch (e) {}
  }
  console.log(`Loaded ${fighters.length} fighters from detailed profiles.`);
  
  let cache = {};
  if (fs.existsSync(IMAGES_CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(IMAGES_CACHE_PATH, 'utf8'));
      console.log(`Loaded ${Object.keys(cache).length} cached fighter images.`);
    } catch (e) {
      console.warn('Failed to parse cache, starting fresh:', e.message);
    }
  }
  
  const toScrape = fighters.filter(f => f.ufcLink && !cache[f.id]);
  console.log(`Need to scrape images for ${toScrape.length} fighters.`);
  
  if (toScrape.length === 0) {
    console.log('No new fighters to scrape.');
    return;
  }
  
  const BATCH_SIZE = 25;
  for (let i = 0; i < toScrape.length; i += BATCH_SIZE) {
    const chunk = toScrape.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(toScrape.length / BATCH_SIZE)}...`);
    
    await Promise.all(chunk.map(async (f) => {
      try {
        const ufcUrl = f.ufcLink.startsWith('http://') ? f.ufcLink.replace('http://', 'https://') : f.ufcLink;
        const resp = await fetch(ufcUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!resp.ok) {
          cache[f.id] = { headshot: null, bodyShot: null };
          return;
        }
        
        const html = await resp.text();
        
        // Extract all headshot image candidates
        const headshotRegex = /src="([^"]*event_results_athlete_headshot[^"]*)"/g;
        let matches = [];
        let m;
        while ((m = headshotRegex.exec(html)) !== null) {
          matches.push(m[1]);
        }
        
        let headshot = null;
        const cleanLastName = f.lastName.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const cleanFirstName = f.firstName.replace(/[^a-zA-Z]/g, '').toLowerCase();
        
        // Try to find a headshot that matches the fighter's name
        for (const url of matches) {
          const lowerUrl = url.toLowerCase();
          if (lowerUrl.includes(cleanLastName) || lowerUrl.includes(cleanFirstName)) {
            headshot = url;
            break;
          }
        }
        
        // Fallback to the first headshot found if none matches the name directly
        if (!headshot && matches.length > 0) {
          headshot = matches[0];
        }
        
        // Match full body image
        const bodyRegex = /src="([^"]*athlete_bio_full_body[^"]*)"/;
        const bodyMatch = html.match(bodyRegex);
        const bodyShot = bodyMatch ? bodyMatch[1] : null;
        
        // Decode HTML entities if any
        const cleanHeadshot = headshot ? headshot.replace(/&amp;/g, '&') : null;
        const cleanBodyShot = bodyShot ? bodyShot.replace(/&amp;/g, '&') : null;
        
        cache[f.id] = {
          headshot: cleanHeadshot,
          bodyShot: cleanBodyShot
        };
      } catch (err) {
        // Silently fail and cache as null to prevent infinite retries
        cache[f.id] = { headshot: null, bodyShot: null };
      }
    }));
    
    // Save cache incrementally
    fs.writeFileSync(IMAGES_CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
  }
  
  console.log('Finished scraping all fighters.');
}

scrapeAll().catch(e => console.error('Error in scraper:', e));
