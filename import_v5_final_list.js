const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, '');
}

async function main() {
  const filePath = '/home/nn/.openclaw/media/inbound/รายช_อยา_ท_ได_ร_บมอบหมายให_ตรวจ---4b36bcc8-9d75-4f8a-8a93-8557acfbd8e0.md';
  const text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let currentCategory = '';
  const newMeds = [];

  for (const line of lines) {
    if (['ยาเม็ด', 'ยาต้านไวรัส', 'ยาชง', 'ยาใช้ภายนอก', 'ยาจิตเวช'].includes(line)) {
      currentCategory = line;
      continue;
    }
    const match = line.match(/^\d+\s+(.+)$/);
    if (match) {
      const name = match[1].trim();
      newMeds.push({ name, category: currentCategory, norm: normalize(name) });
    }
  }

  console.log(`Parsed ${newMeds.length} medications from the new list.`);

  const oldMeds = await prisma.medication.findMany();
  console.log(`Found ${oldMeds.length} old medications in DB.`);

  const shelfMap = new Map();
  for (const old of oldMeds) {
    if (old.shelf) {
      shelfMap.set(normalize(old.name), old.shelf);
    }
  }

  const allText = fs.existsSync('all_meds_combined.txt') ? fs.readFileSync('all_meds_combined.txt', 'utf-8') : '';
  const allLines = allText.split('\n').map(l => l.trim());
  for (let line of allLines) {
    const locMatch = line.match(/^\*\s*(.+?)\s*-\s*(.+)$/);
    if (locMatch) {
      let n = locMatch[1].trim();
      let s = locMatch[2].trim();
      if (s !== 'XX') {
        shelfMap.set(normalize(n), s);
      }
    }
  }

  for (const med of newMeds) {
    let shelf = shelfMap.get(med.norm);
    if (!shelf) {
      for (const [oldNorm, oldShelf] of shelfMap.entries()) {
        if (oldNorm.includes(med.norm) || med.norm.includes(oldNorm)) {
          shelf = oldShelf;
          break;
        }
      }
    }
    med.shelf = shelf || null;
  }

  console.log('Clearing old data...');
  await prisma.medication.deleteMany({});

  console.log('Inserting new exact list...');
  let count = 0;
  for (const med of newMeds) {
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