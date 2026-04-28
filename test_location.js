const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const meds = await prisma.medication.findMany({ 
    take: 2, 
    include: { 
      inspections: { 
        where: { month: 4, year: 2026 } 
      } 
    } 
  });
  
  const formatted = meds.map(med => {
    const inspection = med.inspections[0] || null;
    return {
      id: med.id,
      location: med.location || null,
      name: med.name
    };
  });
  
  console.log('formatted:', JSON.stringify(formatted, null, 2));
  await prisma.$disconnect();
})();