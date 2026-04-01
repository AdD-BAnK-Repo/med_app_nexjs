const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const meds = await prisma.medication.findMany();
  let deleted = 0;
  for (const m of meds) {
    if (m.id.includes('-1774')) {
      await prisma.medication.delete({ where: { id: m.id } });
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} medications.`);
}
main().finally(() => prisma.$disconnect());
