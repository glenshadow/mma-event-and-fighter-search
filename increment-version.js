import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appFilePath = path.join(__dirname, 'src', 'App.tsx');

try {
  if (fs.existsSync(appFilePath)) {
    let content = fs.readFileSync(appFilePath, 'utf8');
    
    // Pattern to match version in footer
    const regex = /StandardMMA DATA FEEDS • v(\d+)\.(\d+)\.(\d+)/;
    const match = content.match(regex);
    
    if (match) {
      let major = parseInt(match[1], 10);
      let minor = parseInt(match[2], 10);
      let patch = parseInt(match[3], 10);
      
      const oldVersion = `v${major}.${minor}.${patch}`;
      
      // Carry-over incrementation rules:
      // Keep single digits for minor and patch. Roll up to next when > 9
      patch++;
      if (patch > 9) {
        patch = 0;
        minor++;
      }
      if (minor > 9) {
        minor = 0;
        major++;
      }
      
      const newVersion = `v${major}.${minor}.${patch}`;
      const oldStr = `StandardMMA DATA FEEDS • ${oldVersion}`;
      const newStr = `StandardMMA DATA FEEDS • ${newVersion}`;
      
      content = content.replace(oldStr, newStr);
      fs.writeFileSync(appFilePath, content, 'utf8');
      
      console.log(`[Version Incrementer] Successfully incremented version from ${oldVersion} to ${newVersion} in src/App.tsx`);
    } else {
      console.error('[Version Incrementer] Error: Could not find version string pattern in src/App.tsx');
    }
  } else {
    console.error(`[Version Incrementer] Error: src/App.tsx not found at ${appFilePath}`);
  }
} catch (err) {
  console.error('[Version Incrementer] Error updating version:', err);
}
