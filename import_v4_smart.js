const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, '');
}

async function main() {
  const allText = fs.readFileSync('all_meds_combined.txt', 'utf-8');
  const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const medications = [];
  const locations = [];
  let currentCategory = 'ยาเม็ด';
  
  for (let line of lines) {
    if (['ยาเม็ด', 'ยาต้านไวรัส', 'ยาชง', 'ยาใช้ภายนอก', 'ยาจิตเวช'].includes(line)) {
      currentCategory = line;
      continue;
    }
    
    // Check if it's a location line like "* Acyclovir tab 400 mg - B15"
    const locMatch = line.match(/^\*\s*(.+?)\s*-\s*(.+)$/);
    if (locMatch) {
      let name = locMatch[1].trim();
      let shelf = locMatch[2].trim();
      locations.push({ name, shelf: shelf === 'XX' ? null : shelf, category: currentCategory, norm: normalize(name) });
      continue;
    }
    
    // Check if it's a numbered list line like "1 Acyclovir tab 400 mg"
    const numMatch = line.match(/^\d+\s+(.+)$/);
    if (numMatch) {
      let name = numMatch[1].trim();
      medications.push({ name, category: currentCategory, shelf: null, norm: normalize(name) });
      continue;
    }
  }

  console.log(`Parsed ${medications.length} numbered medications.`);
  console.log(`Parsed ${locations.length} location items.`);

  // Merge locations into medications
  for (let loc of locations) {
    // Try to find exact match on normalized name
    let match = medications.find(m => m.norm === loc.norm);
    
    // If no exact match, try fuzzy match (if one contains the other)
    if (!match) {
        match = medications.find(m => m.norm.includes(loc.norm) || loc.norm.includes(m.norm));
    }
    
    if (match) {
        match.shelf = loc.shelf;
    } else {
        // Only add as new medication if it's not matched (e.g. ยาจิตเวช which has no numbered list)
        medications.push({ name: loc.name, category: loc.category, shelf: loc.shelf, norm: loc.norm });
    }
  }
  
  // Deduplicate final medications list by normalized name
  const finalMeds = [];
  const seen = new Set();
  for (let m of medications) {
      if (!seen.has(m.norm)) {
          seen.add(m.norm);
          finalMeds.push(m);
      }
  }

  console.log(`Total final unique medications: ${finalMeds.length}`);

  console.log('Clearing old data...');
  await prisma.medication.deleteMany({});
  
  console.log('Inserting new data...');
  let count = 0;
  for (const med of finalMeds) {
    try {
      await prisma.medication.create({
        data: {
          id: med.name.replace(/[^a-zA-Z0-9ก-ฮ]/g, '').substring(0, 30) + Math.random().toString(36).substring(2,7),
          name: med.name,
          category: med.category,
          shelf: med.shelf,
          isNoStock: false
        }
      });
      count++;
    } catch(e) {}
  }
  
  console.log(`Successfully imported ${count} medications!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());