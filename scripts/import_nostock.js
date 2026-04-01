const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const noStockMeds = [
  { name: "Aspirin tab 325 mg", category: "ยาเม็ด" },
  { name: "Azithromycin 250 mg", category: "ยาเม็ด" },
  { name: "Brompheniramine 4mg+Phenylephrine HCl 10mg", category: "ยาเม็ด" },
  { name: "Captopril tab 25 mg", category: "ยาเม็ด" },
  { name: "Clotrimazole troche tab 10 mg", category: "ยาเม็ด" },
  { name: "Deferiprone 100 mg", category: "ยาเม็ด" },
  { name: "Ergotamine 1mg+Caffeine 100mg tab", category: "ยาเม็ด" },
  { name: "Fluconazole cap 200 mg", category: "ยาเม็ด" },
  { name: "Gliclazide 80 mg", category: "ยาเม็ด" },
  { name: "Itraconazole cap 100 mg", category: "ยาเม็ด" },
  { name: "Lanthanum 500 mg", category: "ยาเม็ด" },
  { name: "Lamivudine 3TC 150 mg ( ซื้อ )", category: "ยาเม็ด" },
  { name: "Levodopa 100 mg+Carbidopa 25 mg tab", category: "ยาเม็ด" },
  { name: "Levonorgestrel 0.15mg+Ethinylestradiol 0.03mg", category: "ยาเม็ด" },
  { name: "Mefenamic acid cap 250 mg", category: "ยาเม็ด" },
  { name: "Micronized Progesterone ง .VG 200 mg", category: "ยาเม็ด" },
  { name: "Minoxidil 5 mg", category: "ยาเม็ด" },
  { name: "Midorine 2.5 mg", category: "ยาเม็ด" },
  { name: "Nifedipine SR tab 20 mg", category: "ยาเม็ด" },
  { name: "Nifedipine SR tab 10 mg", category: "ยาเม็ด" },
  { name: "Norethisterone tab 5 mg", category: "ยาเม็ด" },
  { name: "Paracetamol tab 325 mg", category: "ยาเม็ด" },
  { name: "Potassium chloride 500 mg", category: "ยาเม็ด" },
  { name: "Roxithromycin tab 150 mg", category: "ยาเม็ด" },
  { name: "Tenoforvir (TDF) 300 mg ( ซื้อ )", category: "ยาเม็ด" },
  { name: "Tenofovir Alafenamide (TAF) 25 mg tab", category: "ยาเม็ด" },
  { name: "Vitamin D2 20,000 iu.(Vit.D2)", category: "ยาเม็ด" },
  { name: "Favipiravir tab 200 mg", category: "ยาเม็ด" },
  { name: "Molnupirivir 200 mg", category: "ยาเม็ด" },
  { name: "นม Lactose-Free Infant Food 400 กรัม", category: "ยาเม็ด" }, // Or others? Let's leave as ยาเม็ด for simplicity
  { name: "Albendazole susp 100mg/5ml", category: "ยาน้ำ" },
  { name: "Co-trimoxazole susp (SMX200+TMP40/5ml", category: "ยาน้ำ" },
  { name: "Benzyl benzoate 60 ml", category: "ยาใช้ภายนอก" },
  { name: "POVIDONE SOLUTION (30 ml) 10 %", category: "ยาใช้ภายนอก" },
  { name: "Salicylic acid 25gm+Liquefied phenol 1.5m", category: "ยาใช้ภายนอก" },
  { name: "Terramycin eye ointment 3.5 gm", category: "ยาใช้ภายนอก" },
  { name: "Triamcinolone oral paste 1 g", category: "ยาใช้ภายนอก" },
  { name: "Xylocaine HCL 2% viscous solution 100ml", category: "ยาใช้ภายนอก" },
  { name: "Zinc oxide 0.375 gm/5gm", category: "ยาใช้ภายนอก" }
];

async function main() {
  console.log('Starting No Stock import...');
  let updated = 0;
  let created = 0;

  for (const item of noStockMeds) {
    // Try to find if medication already exists (fuzzy search on name)
    const existingMeds = await prisma.medication.findMany({
      where: {
        name: {
          contains: item.name.split(' ')[0], // check first word just in case
        }
      }
    });

    let found = false;
    for (const em of existingMeds) {
      if (em.name.trim().toLowerCase() === item.name.trim().toLowerCase()) {
        await prisma.medication.update({
          where: { id: em.id },
          data: { isNoStock: true }
        });
        updated++;
        found = true;
        break;
      }
    }

    if (!found) {
      const id = `${item.category}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await prisma.medication.create({
        data: {
          id,
          name: item.name,
          category: item.category,
          isNoStock: true,
          shelf: "NO-STOCK"
        }
      });
      created++;
    }
  }

  console.log(`Finished. Updated: ${updated}, Created: ${created}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });