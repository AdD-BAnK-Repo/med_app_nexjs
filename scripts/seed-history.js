const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching locations...');
  const fires = await prisma.fireExtinguisher.findMany();
  const lights = await prisma.emergencyLight.findMany();

  const fireMap = {};
  fires.forEach(f => fireMap[f.location] = f.id);

  const lightMap = {};
  lights.forEach(l => lightMap[l.location] = l.id);

  console.log('Seeding Jan 2026 Fire...');
  const janFires = [
    { loc: 'ประตูเข้า OPD', i: 'พงศ์ภพ' },
    { loc: 'หน้าห้องฉีดยา OPD', i: 'พงศ์ภพ' },
    { loc: 'ประตูทางเข้า ER', i: 'พงศ์ภพ' },
    { loc: 'หน้าห้องการเงิน ER', i: 'พงศ์ภพ' }
  ];
  for (let f of janFires) {
    if (fireMap[f.loc]) {
      await prisma.fireInspection.upsert({
        where: { extinguisherId_month_year: { extinguisherId: fireMap[f.loc], month: 1, year: 2026 } },
        update: {},
        create: {
          extinguisherId: fireMap[f.loc], month: 1, year: 2026,
          nozzleStatus: 'ปกติ', pinStatus: 'ปกติ', invertStatus: 'ปกติ', gaugeStatus: 'ปกติ',
          overallStatus: 'พร้อมใช้งาน', inspector: f.i, checkedAt: new Date('2026-01-31T10:00:00Z')
        }
      });
    }
  }

  console.log('Seeding Jan 2026 Lights...');
  const janLights = [
    { loc: 'ห้องประชุม OPD', i: 'พงศ์ภพ', c: 'ทำงาน', t: 'ปกติ', o: 'พร้อมใช้งาน' },
    { loc: 'คลังยาย่อย OPD', i: 'พงศ์ภพ', c: 'ไม่ทำงาน', t: 'ไม่เก็บไฟ', o: 'ชำรุด' },
    { loc: 'หน้าห้องน้ำ OPD', i: 'พงศ์ภพ', c: 'ไม่ทำงาน', t: 'ไม่เก็บไฟ', o: 'ชำรุด' },
    { loc: 'กลางห้องจัดยา OPD', i: 'พงศ์ภพ', c: 'ทำงาน', t: 'ปกติ', o: 'พร้อมใช้งาน' },
    { loc: 'ช่องจ่ายยาเบอร์ 9', i: 'พงศ์ภพ', c: 'ทำงาน', t: 'ปกติ', o: 'พร้อมใช้งาน' },
    { loc: 'ในห้องเจนคิว', i: 'พงศ์ภพ', c: 'ไม่ทำงาน', t: 'ไม่เก็บไฟ', o: 'ชำรุด' },
    { loc: 'หน้าห้องฉีดยา', i: 'พงศ์ภพ', c: 'ทำงาน', t: 'ปกติ', o: 'พร้อมใช้งาน' },
    { loc: 'ในห้องจ่ายยา ER', i: 'พงศ์ภพ', c: 'ทำงาน', t: 'ปกติ', o: 'พร้อมใช้งาน' },
    { loc: 'คลังยาย่อย ER', i: 'พงศ์ภพ', c: 'ไม่ทำงาน', t: 'ไม่เก็บไฟ', o: 'ชำรุด' }
  ];
  for (let l of janLights) {
    if (lightMap[l.loc]) {
      await prisma.lightInspection.upsert({
        where: { lightId_month_year: { lightId: lightMap[l.loc], month: 1, year: 2026 } },
        update: {},
        create: {
          lightId: lightMap[l.loc], month: 1, year: 2026,
          ledStatus: 'แสดงปกติ', chargeStatus: l.c, testStatus: l.t,
          overallStatus: l.o, inspector: l.i, checkedAt: new Date('2026-01-31T10:00:00Z')
        }
      });
    }
  }

  console.log('Seeding Feb 2026 Fire...');
  const febFires = [
    { loc: 'ประตูเข้า OPD', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'หน้าห้องฉีดยา OPD', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'ประตูทางเข้า ER', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'หน้าห้องการเงิน ER', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' }
  ];
  for (let f of febFires) {
    if (fireMap[f.loc]) {
      await prisma.fireInspection.upsert({
        where: { extinguisherId_month_year: { extinguisherId: fireMap[f.loc], month: 2, year: 2026 } },
        update: {},
        create: {
          extinguisherId: fireMap[f.loc], month: 2, year: 2026,
          nozzleStatus: 'ปกติ', pinStatus: 'ปกติ', invertStatus: 'ปกติ', gaugeStatus: 'ปกติ',
          overallStatus: 'พร้อมใช้งาน', inspector: f.i, checkedAt: new Date(f.d)
        }
      });
    }
  }

  console.log('Seeding Feb 2026 Lights...');
  const febLights = [
    { loc: 'ห้องประชุม OPD', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'คลังยาย่อย OPD', i: 'พงศ์ภพ', d: '2026-02-18T10:00:00Z' },
    { loc: 'หน้าห้องน้ำ OPD', i: 'พงศ์ภพ', d: '2026-02-18T10:00:00Z' },
    { loc: 'กลางห้องจัดยา OPD', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'ช่องจ่ายยาเบอร์ 9', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'ในห้องเจนคิว', i: 'พงศ์ภพ', d: '2026-02-18T10:00:00Z' },
    { loc: 'หน้าห้องฉีดยา', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'ในห้องจ่ายยา ER', i: 'ณัตพล', d: '2026-02-01T10:00:00Z' },
    { loc: 'คลังยาย่อย ER', i: 'พงศ์ภพ', d: '2026-02-18T10:00:00Z' }
  ];
  for (let l of febLights) {
    if (lightMap[l.loc]) {
      await prisma.lightInspection.upsert({
        where: { lightId_month_year: { lightId: lightMap[l.loc], month: 2, year: 2026 } },
        update: {},
        create: {
          lightId: lightMap[l.loc], month: 2, year: 2026,
          ledStatus: 'แสดงปกติ', chargeStatus: 'ทำงาน', testStatus: 'ปกติ',
          overallStatus: 'พร้อมใช้งาน', inspector: l.i, checkedAt: new Date(l.d)
        }
      });
    }
  }

  console.log('Seeding Mar 2026 Fire...');
  const marFires = [
    { loc: 'ประตูเข้า OPD', i: 'พงศ์ภพ', pin: 'ปกติ', noz: 'ปกติ', inv: 'ไม่ปกติ', gau: 'เกจตก', over: 'ไม่พร้อมใช้งาน', d: '2026-03-13T10:00:00Z' },
    { loc: 'หน้าห้องฉีดยา OPD', i: 'พงศ์ภพ', pin: 'ปกติ', noz: 'ปกติ', inv: 'ปกติ', gau: 'ปกติ', over: 'พร้อมใช้งาน', d: '2026-03-13T10:00:00Z' },
    { loc: 'ประตูทางเข้า ER', i: 'พงศ์ภพ', pin: 'ปกติ', noz: 'ปกติ', inv: 'ปกติ', gau: 'ปกติ', over: 'พร้อมใช้งาน', d: '2026-03-13T10:00:00Z' },
    { loc: 'หน้าห้องการเงิน ER', i: 'พงศ์ภพ', pin: 'ปกติ', noz: 'ปกติ', inv: 'ปกติ', gau: 'ปกติ', over: 'พร้อมใช้งาน', d: '2026-03-13T10:00:00Z' }
  ];
  for (let f of marFires) {
    if (fireMap[f.loc]) {
      await prisma.fireInspection.upsert({
        where: { extinguisherId_month_year: { extinguisherId: fireMap[f.loc], month: 3, year: 2026 } },
        update: {},
        create: {
          extinguisherId: fireMap[f.loc], month: 3, year: 2026,
          nozzleStatus: f.noz, pinStatus: f.pin, invertStatus: f.inv === 'ไม่ปกติ' ? 'ไม่ได้ทำ' : f.inv, gaugeStatus: f.gau,
          overallStatus: f.over, inspector: f.i, checkedAt: new Date(f.d)
        }
      });
    }
  }

  console.log('Seeding Mar 2026 Lights...');
  const marLights = [
    { loc: 'ห้องประชุม OPD', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'คลังยาย่อย OPD', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'หน้าห้องน้ำ OPD', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'กลางห้องจัดยา OPD', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'ช่องจ่ายยาเบอร์ 9', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'ในห้องเจนคิว', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'หน้าห้องฉีดยา', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'ในห้องจ่ายยา ER', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' },
    { loc: 'คลังยาย่อย ER', i: 'พงศ์ภพ', d: '2026-03-13T10:00:00Z' }
  ];
  for (let l of marLights) {
    if (lightMap[l.loc]) {
      await prisma.lightInspection.upsert({
        where: { lightId_month_year: { lightId: lightMap[l.loc], month: 3, year: 2026 } },
        update: {},
        create: {
          lightId: lightMap[l.loc], month: 3, year: 2026,
          ledStatus: 'แสดงปกติ', chargeStatus: 'ทำงาน', testStatus: 'ปกติ',
          overallStatus: 'พร้อมใช้งาน', inspector: l.i, checkedAt: new Date(l.d)
        }
      });
    }
  }

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());