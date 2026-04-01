const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const meds = await prisma.medication.findMany({ select: { name: true, category: true, shelf: true } });
  console.log(`Total Meds: ${meds.length}`);
  
  // Show first 20 for sampling
  console.log('Sample Meds:');
  meds.slice(0, 20).forEach(m => console.log(`- [${m.category}] ${m.name} (Shelf: ${m.shelf})`));
  
  const ext = await prisma.fireExtinguisher.count();
  const light = await prisma.emergencyLight.count();
  console.log(`Fire Extinguishers: ${ext}`);
  console.log(`Emergency Lights: ${light}`);
}

main().finally(() => prisma.$disconnect());