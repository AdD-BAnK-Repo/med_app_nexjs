const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const meds = await prisma.medication.findMany({
    where: { isNoStock: true }
  });
  
  for (const m of meds) {
    console.log(`ID: ${m.id} | Name: ${m.name}`);
  }
}

main().finally(() => prisma.$disconnect());
