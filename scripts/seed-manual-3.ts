import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawData = `ยาเม็ด
* Acyclovir tab 400 mg - B15
* Albendazole tab 200 mg - B10
* Allopurinol tab 100 mg - E13
* Amlodipine tab 5 mg - C16
* Amoxicillin cap 250 mg - XX
* Amoxicillin cap 500 mg - B1
* Amoxicillin(875)+Clavulanic (125) 1g - B11
* Aspirin tab 325 mg - K6
* Aspirin tab 81 mg - D12
* Atenolol tab 50 mg - C5
* Atorvastatin 40 mg - D4
* Baclofen 10 mg - C4
* Betahistine mesylate 6 mg - A14
* Bisacodyl tab 5 mg - XX
* Bromhexine tab 8 mg - A3
* Brompheniramine 4 mg - +Phenylephrine 10 mg - A1
* Cafergot-Ergotamine+Caffeine tab 100 mg - E10
* Calcium carbonate tab 600 mg - B20
* Calcium carbonate tab 1.5 mg - B9
* Calcitriol (Vit D3) 0.25 mg - F6
* Captopril tab 25 mg - C1
* Carvedilol 6.25 mg - F9
* Carvedilol 25 mg - F5
* Carbamazepine tab 200 mg - E6
* Cetirizine 10 mg - A7
* Chloroquine tab 250 mg - B14
* Chlorpheniramine tab 4 mg - A6
* Ciprofloxacin 500 mg - E12
* Clindamycin HCL cap 300 mg - B5
* Clopidogrel 75 mg - D11
* Clotrimazole troche tab 10 mg - B13
* Colchicine tab 0.6 mg - E14
* Co-trimoxazole tab 400:80 - B6
* Cyproheptadine HCL tab 4 mg - A9
* Dextromethorphan tab 15 mg - A21
* Dicloxacillin cap 250 mg - B3
* Digoxin tab 0.25 mg - D2
* Dimenhydrinate tab 50 mg - A10
* Diosmine 450 mg - + Hesperidine 50 mg - XX
* Domperidone tab 10 mg - A5
* Doxazosin 2 mg - C7
* Doxycycline cap 100 mg - B4
* Enalapril tab 20 mg - C8
* Enalapril tab 5 mg - C17
* Famotidine 20 mg - A13
* favipiravir 200 mg - K4
* Ferrous fumarate tab 200 mg - B19
* Finasterride 5 mg - F3
* Fluconazole cap 200 mg - E9
* Folic acid tab 5 mg - B18
* Furosemide tab 40 mg - C6
* Furosemide tab 500 mg - F8
* Gabapentin 100 mg - F7
* Gabapentin 300 mg - F4
* Gemfibrozil cap 600 mg - D13
* Glipizide tab 5 mg - D16
* Glyceryl guaiacolate - A20
* Gliclazide 80 mg - D19
* Hydralazine tab 25 mg - C15
* Hydrochlorothiazide tab 25 mg - C11
* Hydroxyzine tab 10 mg - A8
* Hyoscine-n-butyl Br.tab - A19
* Isosorbide mononitrate 20 mg - D1
* Isosorbide SL tab 5 mg - D9
* Itraclonazole 100 mg - K7
* LAMIVUDINE(3TC) (ชือ) 150 mg - K3
* Levodopa 100 mg - + Carbidopa 25 mg - E11
* Losartan Potassium 50 mg - C14
* Manidipine 20 mg - C12
* Mefenamic acid cap 250 mg - A2
* Metformin HCL tab 500 mg - D17
* Methimazole 5 mg - D3
* Metoprolol 100 mg - C13
* Metronidazole tab 400 mg - B16
* Methyldopa 125 mg - C3
* MICRONized PROGESTERONE ง. VG 200 mg - K8
* Molnupiravir 200 mg - K4
* Naproxen 250 mg - A24
* Nifedipine cap 20 mg - C2
* Norethisterone tab 5 mg - E2
* Norfloxacin tab 400 mg - B12
* Ofloxacin 200 mg - B7
* Omeprazole cab 20 mg - A22
* Oseltamivir 75 mg - E7
* Orphenadrine + Paracetamol / Norgesic tab - A12
* Paracetamol tab 325 mg - A4
* Paracetamol tab 500 mg - A23
* Phenobarbitone tab 30 mg - E8
* Phenobarbitone tab 60 mg - E3
* Phenytoin sod. cap 100 mg - E5
* Pioglitazone 30 mg - D15
* Potassium chloride 500 mg - F1
* Prednisolone tab 5 mg - E16
* Propranolol tab 10 mg - C9
* Propylthiouracil tab 50 mg - D10
* R-den tab(levonorgestrel 0.15 mg - ) - E4
* Roxithromycin tab 150 mg - B8
* Salbutamol tab 2 mg - D5
* Simethicone tab 80 mg - A16
* Simvastatin tab 20 mg - D18
* Sodamint tab 300 mg - D7
* Sodium chloride 300 mg - F10
* Spironolactone tab 25 mg - C10
* Theophylline tab 200 mg - D6
* Thyroxine sodium tab 0.1 mg - D8
* Tramadol HCL cap 50 mg - A17
* Triferdine 150 mg - A15
* Tenofovir (TDF) (ชือ) 300 mg - K2
* Tenofovir Alafenamide 25 mg - K1
* Vitamin B complex tab - B17
* Vitamin C tab 100 mg - A11
* Vitamin D2 20,000 units - F2
* Varenicline (เลิกบุหรี่) STARTER0.5 mg and 1 mg - K15
* VARENICLINE (เลิกบุหรี่) 1 mg - K1
* Warfarin 2 mg - H19
* Warfarin 3 mg - H20
* Warfarin 5 mg - H21
* นม Free lactose - K5

ยาใช้ภายนอก
* (opsil tears)Hydroxypropyl Methylcellulose 0.5% - K13
* Aromatic ammonia spirit - XX
* Benzyl Benzoate - H1
* Berodual MDI - O3
* Budesonide MDI - O4
* Calamine lotion - O2
* Chlorhexidine gluconate scrub 4% - XX
* Clobetasol propionate cream - H3
* Clotrimazole cream 1% - H12
* Clotrimazole vaginal tab 0.1 g - H5
* Collomack solution (Con Con) - H6
* Dexoph eye drops - K11
* Alcohol 70% - O1
* Histaoph eye drops - K10
* Polyoph eye drops - K12
* Povidone iodine solution 10%(30ml) - O8
* Salbutamol MDI - O5
* Salmeterol+Fluticasone 25/125mcg(serflo) - O6
* Silver sulfadiazine cream 1% - H9
* Special Mouth Wash - H10
* Terramycin eye ointment - K14
* Triamcinolone acetonide cream0.02% - H11
* Triamcinolone acetonide cream0.1 - H12
* Triamcinolone lotion 0.1 % - H16
* Triamcinolone oral paste - H14
* Unison enema - H4
* Urea cream - H15
* Xylocaine jelly 2% tube - H7
* Zine Oxide 0.375g/5g - H17

ยาจิตเวช
* Amitriptyline HCL 10 mg - G2
* Amitriptyline HCL 25 mg - G3
* Artane-benzhexol HCL 2 mg - G4
* Artane-benzhexol HCL 5 mg - G1
* Ativan-lorazepam 0.5 mg - G20
* Chlorpromazine 100 mg - G7
* Chlorpromazine 50 mg - G25
* Clonazepam 0.5 mg - G9
* Clonazepam 2 mg - G11
* Clozapine 100 mg - G10
* Diazepam 2 mg - G6
* Diazepam 5 mg - G8
* Dipotassium Clorazepate 5 mg - G18
* Fluoxetine 20 mg - G13
* Fluprenazine Decanoate inj. 25mg/ml - 26
* Haloperidol 2 mg - G22
* Haloperidol 5 mg - G23
* Lorazepam 2 mg - G17
* Nortriptyline HCL 25 mg - G19
* Perphenazine 4 mg - G15
* Perphenazine 8 mg - G14
* Risperidone 1 mg - G5
* Risperidone 2 mg - G12
* Sertraline 50 mg - G16
* Sodium Valproate 200 mg - G24
* Sodium Valproate 500 mg - G28
* Trazodone HCL 50 mg - G21
* Vitamin B1 100 mg - G27`;

async function main() {
  console.log('Clearing old data...');
  await prisma.inspection.deleteMany({});
  await prisma.medication.deleteMany({});
  
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
  let currentCategory = "Uncategorized";
  let count = 0;
  let categoryIndex = 1;

  for (const line of lines) {
    if (line.startsWith('*')) {
      const rawName = line.replace(/^\*\s*/, '').trim();
      if (!rawName) continue;

      let name = rawName;
      let shelf = null;
      const lastDashIndex = rawName.lastIndexOf(' - ');
      if (lastDashIndex !== -1) {
        name = rawName.substring(0, lastDashIndex).trim();
        shelf = rawName.substring(lastDashIndex + 3).trim();
      }

      const medId = `${currentCategory}-${categoryIndex}`;
      
      try {
        await prisma.medication.create({
          data: {
            id: medId,
            name,
            category: currentCategory,
            shelf
          }
        });
        count++;
        categoryIndex++;
      } catch (err) {
        console.error(`Failed to insert ${medId}: ${err}`);
      }
    } else {
      currentCategory = line;
      categoryIndex = 1;
      console.log('Category changed to:', currentCategory);
    }
  }

  console.log(`✅ Seeded ${count} medications.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
