const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixShelfData() {
  console.log('Starting data correction...');
  const meds = await prisma.medication.findMany();
  
  let updatedCount = 0;
  for (const med of meds) {
    if (med.location && med.location !== 'N/A' && !med.shelf) {
      await prisma.medication.update({
        where: { id: med.id },
        data: { shelf: med.location }
      });
      updatedCount++;
    }
  }
  console.log(`Successfully updated shelf data for ${updatedCount} medications.`);
}

fixShelfData()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());