import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// Données fictives pour l'exemple
const data = [
  {
    patientId: "PAT_2025_001",
    age: 25,
    gender: "F",
    temperature: 38.5,
    symptoms: "fievre,cephalees,fatigue",
    rdtResult: "positif",
    dateConsultation: "2025-02-14",
    traitement: "Artemether + Lumefantrine",
    outcome: "en traitement"
  },
  {
    patientId: "PAT_2025_002",
    age: 5,
    gender: "M",
    temperature: 39.2,
    symptoms: "fievre,frissons,vomissements",
    rdtResult: "positif",
    dateConsultation: "2025-02-14",
    traitement: "Artesunate inj.",
    outcome: "référé"
  },
  {
    patientId: "PAT_2025_003",
    age: 45,
    gender: "M",
    temperature: 37.1,
    symptoms: "toux,rhume",
    rdtResult: "négatif",
    dateConsultation: "2025-02-13",
    traitement: "Paracetamol",
    outcome: "guéris"
  },
  {
    patientId: "PAT_2025_004",
    age: 12,
    gender: "F",
    temperature: 38.0,
    symptoms: "fievre,douleurs",
    rdtResult: "positif",
    dateConsultation: "2025-02-13",
    traitement: "Artemether + Lumefantrine",
    outcome: "en traitement"
  },
  {
    patientId: "PAT_2025_005",
    age: 60,
    gender: "F",
    temperature: 36.8,
    symptoms: "fatigue",
    rdtResult: "négatif",
    dateConsultation: "2025-02-12",
    traitement: "",
    outcome: "guéris"
  }
];

// Créer le dossier public/exemples s'il n'existe pas
const outputDir = path.join(process.cwd(), 'public', 'exemples');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Générer Excel (.xlsx)
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, "Données Paludisme");
XLSX.writeFile(wb, path.join(outputDir, 'donnees_paludisme.xlsx'));
console.log('Fichier Excel généré : public/exemples/donnees_paludisme.xlsx');

// Générer CSV (.csv)
const csvContent = XLSX.utils.sheet_to_csv(ws);
fs.writeFileSync(path.join(outputDir, 'donnees_paludisme.csv'), csvContent);
console.log('Fichier CSV généré : public/exemples/donnees_paludisme.csv');
