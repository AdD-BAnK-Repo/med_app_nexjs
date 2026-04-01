const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allText = fs.readFileSync('all_meds_combined.txt', 'utf-8');
  const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const medications = new Map();
  let currentCategory = 'ยาเม็ด';
  
  for (let line of lines) {
    if (line === 'ยาต้านไวรัส' || line === 'ยาชง' || line === 'ยาใช้ภายนอก' || line === 'ยาจิตเวช') {
      currentCategory = line;
      continue;
    }
    
    const locMatch = line.match(/^\*\s*(.+?)\s*-\s*(.+)$/);
    if (locMatch) {
      let name = locMatch[1].trim();
      let shelf = locMatch[2].trim();
      medications.set(name.toLowerCase(), { name, category: currentCategory, shelf: shelf === 'XX' ? null : shelf });
      continue;
    }
    
    const numMatch = line.match(/^\d+\s+(.+)$/);
    if (numMatch) {
      let name = numMatch[1].trim();
      if (!medications.has(name.toLowerCase())) {
        medications.set(name.toLowerCase(), { name, category: currentCategory, shelf: null });
      }
      continue;
    }
    
    if (!line.includes('*') && !line.match(/^\d+\s+/)) {
       if (!medications.has(line.toLowerCase()) && line.length > 3 && line !== 'ส่วนตำแหน่งยาตามนี้') {
          medications.set(line.toLowerCase(), { name: line, category: currentCategory, shelf: null });
       }
    }
  }

  const values = Array.from(medications.values());
  console.log(`Parsed ${values.length} unique medications.`);

  console.log('Clearing old data...');
  await prisma.medication.deleteMany({});
  
  console.log('Inserting new data...');
  let count = 0;
  for (const med of values) {
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

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());