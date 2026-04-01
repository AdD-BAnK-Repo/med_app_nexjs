import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';

const prisma = new PrismaClient();

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1puYD9BaPyAJw9kiwHnpEISMDDOT3y8iOfCqy6r0DXtw/export?format=csv";

async function main() {
  console.log('Fetching CSV from Google Sheets...');
  const response = await fetch(SHEET_CSV_URL);
  const csvText = await response.text();

  console.log('Parsing CSV data...');
  const results = await new Promise<any[]>((resolve) => {
    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
    });
  });
  
  console.log('Seeding database... This might take a moment.');
  let currentCategory = "ยาเม็ด";
  let count = 0;

  for (const row of results as any[]) {
    // Check for category header row
    if (!row[0] && row[1] && isNaN(parseInt(row[1]))) {
      const potentialCategory = row[1].trim();
      if (potentialCategory.length > 0 && !potentialCategory.includes('รายชื่อยา')) {
        currentCategory = potentialCategory;
        console.log(`Switched to category: ${currentCategory}`);
      }
    }

    const id = row[0];
    const name = row[1];

    if (id && !isNaN(parseInt(id)) && name) {
      const medId = `${currentCategory}-${id}`;
      
      try {
        await prisma.medication.upsert({
          where: { id: medId },
          update: {
            name,
            category: currentCategory,
          },
          create: {
            id: medId,
            name,
            category: currentCategory,
          }
        });
        count++;
      } catch (e: any) {
        console.error(`Failed to upsert ${medId}: ${e.message}`);
      }
    }
  }

  console.log(`✅ Successfully seeded ${count} medications into the SQLite database!`);
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
