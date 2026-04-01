const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const extinguishers = [
    { location: 'ประตูเข้า OPD' },
    { location: 'หน้าห้องฉีดยา OPD' },
    { location: 'ประตูทางเข้า ER' },
    { location: 'หน้าห้องการเงิน ER' }
  ];

  const lights = [
    { location: 'ห้องประชุม OPD', assetCode: null },
    { location: 'คลังยาย่อย OPD', assetCode: '6350-008-0001/089' },
    { location: 'หน้าห้องน้ำ OPD', assetCode: '6350-008-0001/052' },
    { location: 'กลางห้องจัดยา OPD', assetCode: '6350-008-0001/085' },
    { location: 'ช่องจ่ายยาเบอร์ 9', assetCode: null },
    { location: 'ในห้องเจนคิว', assetCode: '6350-008-0001/091' },
    { location: 'หน้าห้องฉีดยา', assetCode: null },
    { location: 'ในห้องจ่ายยา ER', assetCode: null },
    { location: 'คลังยาย่อย ER', assetCode: '6320-005-0003/39' }
  ];

  for (const item of extinguishers) {
    await prisma.fireExtinguisher.create({ data: item });
  }

  for (const item of lights) {
    await prisma.emergencyLight.create({ data: item });
  }

  console.log('Seeded safety equipment data.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
