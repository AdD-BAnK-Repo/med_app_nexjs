import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawData = `ยาเม็ด
1 Acyclovir tab 400 mg
2 Albendazole tab 200 mg
3 Allopurinol tab 100 mg
4 Amitriptyline tab 10 mg
5 Amitriptyline tab 25 mg
6 Amlodipine tab 5 mg
7 Amoxicillin 875mg + Clavulanate 125mg tab
8 Amoxicillin cap 500 mg
9 Apixaban 5 mg
10 Ascorbic acid 100 mg (Vit C)
11 Aspirin tab 325 mg
12 Aspirin tab 81 mg
13 Atenolol tab 50 mg
14 Atorvastatin tab 40 mg
15 Azithromycin 250 mg
16 Baclofen 10 mg tab
17 Benzhexol tab 2 mg
18 Benzhexol tab 5 mg
19 Betahistine mesylate 6 mg
20 Bromhexine tab 8 mg
21 Brompheniramine 4mg+Phenylephrine HCl ...
22 Calcitriol (Vit D3) tab 0.25 mcg.
23 CALCIUM CARBONATE TAB 1.5 G.
24 Calcium carbonate tab 600 mg
25 Captopril tab 25 mg
26 Carbamazepine tab 200 mg
27 CARVEDILOL 25 MG TAB
28 Carvedilol 6.25 mg tab
29 Cetirizine tab 10 mg
30 Chloroquine tab 250 mg
31 Chlorpheniramine tab 4 mg
32 Chlorpromazine tab 100 mg
33 Chlorpromazine tab 50 mg
34 Ciprofloxacin 500 mg tab
35 Clindamycin HCl cap 300 mg
36 Clonazepam tab 0.5 mg
37 Clonazepam tab 2 mg
38 Clopidogrel bisulfate 75 mg
39 Clotrimazole troche tab 10 mg
40 Clozapine tab 100 mg
41 Colchicine tab 0.6 mg
42 Co-trimoxazole tab (SMX400+TMP80)
43 Cyproheptadine HCl tab 4 mg
44 CYTISINICLINE 1.5 mg tab
45 Dapagliflozin 10 mg
46 Dextromethorphan tab 15 mg
47 Deferiprone 100 mg
48 Diazepam tab 2 mg
49 Diazepam tab 5 mg
50 Dicloxacillin cap 250 mg
51 Digoxin tab 0.25 mg
52 Dimenhydrinate tab 50 mg
53 Dipotassium clorazepate cap 5 mg
54 Domperidone tab 10 mg
55 Doxazosin mesylate tab 2 mg
56 Doxycycline cap 100 mg
57 Enalapril tab 20 mg
58 Enalapril tab 5 mg
59 Ergotamine 1mg+Caffeine 100mg tab
60 Ezetimibe 10 mg
61 Famotidine tab 20 mg
62 Ferrous fumarate 200 mg
63 Febuxostat 80 mg
64 Finasteride 5 mg
65 Fluconazole cap 200 mg
66 Fluoxetine tab 20 mg
67 Folic acid tab 5 mg
68 Furosemide tab 40 mg
69 Furosemide tab 500 MG
70 Gabapentin 100 mg
71 GABAPENTIN 300 mg
72 Gemfibrozil tab 600 mg
73 Glipizide tab 5 mg
74 Glyceryl guaiacolate tab 100 mg
75 Gliclazide 80 mg
76 Haloperidol tab 2 mg
77 Haloperidol tab 5 mg
78 Hydralazine tab 25 mg
79 Hydrochlorothiazide tab 25 mg
80 Hydroxyzine tab 10 mg
81 Hyoscine-n-butyl br tab 10 mg
82 Isosorbide Dinitrate SL tab 5 mg
83 Isosorbide Mononitrate tab 20 mg
84 Itraconazole cap 100 mg
85 Lamivudine 3TC 150 mg (ซื้อ)
86 Levodopa 100 mg+Carbidopa 25 mg tab
87 Levonorgestrel 0.15mg+Ethinylestradiol 0.03mg
88 Lorazepam tab 0.5 mg
89 Lorazepam tab 2 mg
90 Losartan potassium 50 mg
91 Manidipine tab 20 mg
92 Mefenamic acid cap 250 mg
93 Metformin HCl tab 500 mg
94 Methimazole 5 mg
95 Metoprolol tab 100 mg
96 Metronidazole tab 400 mg
97 Methotrexate 2.5 mg
98 Micronized Progesterone ง.VG 200 mg
99 Minoxidil 5 mg
100 Montelukast 10 mg
101 NaCl: Sodium chloride tab 300 mg
102 Naproxen tab 250 mg
103 Nifedipine SR tab 20 mg
104 Norethisterone tab 5 mg
105 Norfloxacin tab 400 mg
106 Nortriptyline HCl 25 mg
107 Ofloxacin tab 200 mg
108 Omeprazole cap 20 mg
109 Orphenadrine 35mg+paracetamol 450mg tab
110 Paracetamol tab 325 mg
111 PARACETAMOL tab 500 mg
112 Perphenazine tab 4 mg
113 Perphenazine tab 8 mg
114 Phenobarbital tab 30 mg
115 Phenobarbital tab 60 mg
116 Phenytoin sodium cap 100 mg
117 Pioglitazone tab 30 mg
118 Prednisolone tab 5 mg
119 Propranolol tab 10 mg
120 Propylthiouracil tab 50 mg (PTU)
121 Ptassium chloride 500 mg
122 Risperidone tab 1 mg
123 Risperidone tab 2 mg
124 Roxithromycin tab 150 mg
125 Salbutamol tab 2 mg
126 Sertraline tab 50 mg
127 Senna leaf (ใบมะขามแขก)
128 Simethicone tab 80 mg
129 Simvastatin tab 20 mg
130 Sodium bicarbonate tab 300 mg
131 Sodium Valproate tab 200 mg CR
132 Sodium Valproate tab 500 mg CR
133 Spironolactone tab 25 mg
134 Theophylline 200 mg CR
135 Tenoforvir (TDF) 300 mg (ซื้อ)
136 Tenofovir Alafenamide (TAF) 25 mg tab
137 Thyroxine sodium tab 0.1 mg
138 Tramadol cap 50 mg
139 Trazodone tab 50 mg
140 Triferdine 61.37 mg.
141 Varenicline STARTER 0.5 mg and 1 mg (53เม็ด/กล่อง)
142 VARENICLINE 1 mg tab
143 Vildaglitin 50 mg
144 Vitamin B complex tab
145 Vitamin B1 tab 100 mg
146 Vitamin D2 20,000 iu.(Vit.D2)
147 Warfarin sodium tab 2 mg
148 Warfarin sodium tab 3 mg
149 Warfarin sodium tab 5 mg
ยาต้านไวรัส
1 Favipiravir tab 200 mg
2 OSELTAMIVIR cap 75 mg
3 Molnupirivir 200 mg
ยาชง
1 Acetylcysteine powder 200 mg/5g
2 Calcium polystyrene sulfonate 5 gm
3 ORS 3.075 g.
4 นม Lactose-Free Infant Food 400 กรัม
ยาใช้ภายนอก
1 Chlorhexidine mouth wash 120mg/100 ml (180ml)
2 Chlorhexidine mouth wash 120mg/100 ml (180ml)
3 Clotrimazole cream 1% 15 gm
4 Clotrimazole vaginal tab 0.1 gm
5 Dex-oph Eye drop
6 Fluticasone Furoate Nasal Spray
7 Fusidic acid 2% w/w
8 Hydroxypropyl methylcellulose 0.3% 10 ml
9 Hista-oph Eye drop
10 Poly-oph Eye drop
11 POVIDONE SOLUTION (30 ml) 10 %
12 Salicylic acid 25gm+Liquefied phenol 1.5ml solution
13 Silver sulfadiazine cream 1% 25 gm
14 Terramycin eye ointment 3.5 gm
15 Triamcinolone acetonide cream 0.02% 5 gm
16 Triamcinolone acetonide cream 0.1% 5 gm
17 Triamcinolone lotion 0.1% 30 ml
18 Triamcinolone oral paste 1 g
19 Urea cream 10% 30 gm
20 Unison enema 15 g/100 ml
21 Xylocaine HCL 2% viscous solution 100ml
22 Zinc oxide 0.375 gm/5gm`;

async function main() {
  console.log('Clearing old data...');
  await prisma.medication.deleteMany({});
  
  const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);
  let currentCategory = "Uncategorized";
  let count = 0;

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.*)$/);
    if (match) {
      const idNum = match[1];
      const name = match[2];
      
      // Skip empty names
      if (!name || name.trim() === "") continue;

      const medId = `${currentCategory}-${idNum}`;
      
      try {
        await prisma.medication.create({
          data: {
            id: medId,
            name,
            category: currentCategory,
          }
        });
        count++;
      } catch (err) {
        console.error(`Failed to insert ${medId}: ${err}`);
      }
    } else {
      currentCategory = line;
      console.log('Category changed to:', currentCategory);
    }
  }

  console.log(`✅ Seeded ${count} medications.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());