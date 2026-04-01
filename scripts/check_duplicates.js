const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const meds = await prisma.medication.findMany({
    orderBy: { name: 'asc' }
  });
  
  // Find potential duplicates (similar names)
  const names = meds.map(m => m.name);
  for (let i = 0; i < names.length - 1; i++) {
    if (names[i + 1].toLowerCase().includes(names[i].toLowerCase().split(' ')[0])) {
      // console.log(`Potential duplicate: "${names[i]}" and "${names[i+1]}"`);
    }
  }
  console.log(`Total meds: ${meds.length}`);
  
  const nostock = meds.filter(m => m.isNoStock);
  console.log(`No stock meds: ${nostock.length}`);
}

main().finally(() => prisma.$disconnect());
