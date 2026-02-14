/**
 * Script pour générer des PDFs de test avec des données de consultation paludisme
 * Usage: node scripts/generate-test-pdfs.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const testCases = [
  {
    filename: "consultation_cas_simple.pdf",
    title: "FICHE DE CONSULTATION — PALUDISME",
    content: [
      "CENTRE DE SANTÉ COMMUNAUTAIRE DE BOUAKÉ",
      "Région : Gbêkê | District : Bouaké Nord-Est",
      "Commune : Bouaké | Code centre : CSC-BKE-012",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "IDENTIFICATION DU PATIENT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "ID Patient : PAT_2024_00542",
      "Âge : 7 ans, 3 mois",
      "Sexe : Masculin",
      "Date de consultation : 15/01/2025",
      "Heure : 09:30",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "SYMPTÔMES RAPPORTÉS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "- Fièvre : OUI (depuis 3 jours, T° ressentie élevée)",
      "- Céphalées : OUI",
      "- Nausées / Vomissements : OUI",
      "- Fatigue / Asthénie : OUI",
      "- Douleurs articulaires : NON",
      "- Frissons : OUI",
      "- Diarrhée : NON",
      "- Troubles de la conscience : NON",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "SIGNES VITAUX",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Température : 39.2°C",
      "Fréquence cardiaque : 110 bpm",
      "Fréquence respiratoire : 22 /min",
      "PA : 100/65 mmHg",
      "SpO2 : 97%",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "EXAMENS DE LABORATOIRE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TDR Paludisme : POSITIF",
      "Date TDR : 15/01/2025",
      "Espèce : Plasmodium falciparum",
      "Parasitémie : 2.5%",
      "Hémoglobine : 10.2 g/dL",
      "Hématocrite : 31%",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONTEXTE ÉPIDÉMIOLOGIQUE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Saison : Pluies",
      "Incidence régionale : 185 pour 1000 habitants",
      "Taux de positivité TDR : 42%",
      "Antécédents palustres (30j) : 1",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "COMORBIDITÉS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Anémie légère",
      "Patient vulnérable : NON",
      "Enfant < 5 ans : NON",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TRAITEMENT PRESCRIT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Médicament : Artéméther-Luméfantrine (ACT)",
      "Posologie : 2 comprimés x 2/jour",
      "Durée : 3 jours",
      "Observance : OUI (supervisée)",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONCLUSION",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Diagnostic : Paludisme simple à P. falciparum",
      "Statut : En traitement",
      "Suivi prévu le : 18/01/2025",
      "",
      "Médecin : Dr. KONÉ Amadou",
      "Signature : _______________",
    ],
  },
  {
    filename: "consultation_cas_grave.pdf",
    title: "RAPPORT DE CONSULTATION — CAS SÉVÈRE",
    content: [
      "HÔPITAL GÉNÉRAL D'ABIDJAN",
      "Région : Abidjan | District : Cocody-Bingerville",
      "Commune : Cocody | Code centre : HGA-COC-001",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "IDENTIFICATION DU PATIENT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "ID Patient : PAT_2024_01187",
      "Âge : 2 ans, 8 mois",
      "Sexe : Féminin",
      "Date de consultation : 22/03/2025",
      "Heure : 14:15",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "SYMPTÔMES RAPPORTÉS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "- Fièvre : OUI (depuis 5 jours, T° > 40°C)",
      "- Céphalées : NON (enfant en bas âge)",
      "- Nausées / Vomissements : OUI (vomissements répétés)",
      "- Fatigue / Asthénie : OUI (prostration)",
      "- Douleurs articulaires : NON",
      "- Frissons : OUI",
      "- Diarrhée : OUI",
      "- Troubles de la conscience : OUI (somnolence anormale, convulsions)",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "SIGNES VITAUX",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Température : 40.5°C",
      "Fréquence cardiaque : 145 bpm",
      "Fréquence respiratoire : 38 /min",
      "PA : 80/50 mmHg",
      "SpO2 : 91%",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "EXAMENS DE LABORATOIRE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TDR Paludisme : POSITIF",
      "Date TDR : 22/03/2025",
      "Espèce : Plasmodium falciparum",
      "Parasitémie : 12.8%",
      "Hémoglobine : 5.4 g/dL",
      "Hématocrite : 16%",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONTEXTE ÉPIDÉMIOLOGIQUE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Saison : Pluies",
      "Incidence régionale : 220 pour 1000 habitants",
      "Taux de positivité TDR : 55%",
      "Antécédents palustres (30j) : 0",
      "Alertes communautaires : OUI (épidémie locale)",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "COMORBIDITÉS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Anémie sévère, Malnutrition aiguë modérée",
      "Patient vulnérable : OUI",
      "Enfant < 5 ans : OUI",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TRAITEMENT PRESCRIT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Médicament : Artésunate injectable IV",
      "Posologie : 2.4 mg/kg à H0, H12, H24 puis toutes les 24h",
      "Durée : 7 jours (relais oral ACT après stabilisation)",
      "Observance : OUI (hospitalisation)",
      "Transfusion sanguine : OUI (culot globulaire)",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONCLUSION",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Diagnostic : PALUDISME GRAVE à P. falciparum",
      "Critères de gravité : Anémie sévère, troubles de conscience, hyperparasitémie",
      "Statut : En traitement (hospitalisation USI)",
      "Pronostic : Réservé",
      "Suivi prévu le : 25/03/2025",
      "",
      "Médecin : Dr. DIALLO Fatou",
      "Signature : _______________",
    ],
  },
  {
    filename: "consultation_negatif.pdf",
    title: "FICHE DE CONSULTATION — TDR NÉGATIF",
    content: [
      "CENTRE DE SANTÉ URBAIN DE MAN",
      "Région : Tonkpi | District : Man",
      "Commune : Man | Code centre : CSU-MAN-005",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "IDENTIFICATION DU PATIENT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "ID Patient : PAT_2024_02301",
      "Âge : 35 ans",
      "Sexe : Féminin",
      "Date de consultation : 10/12/2024",
      "Heure : 11:00",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "SYMPTÔMES RAPPORTÉS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "- Fièvre : OUI (depuis 2 jours)",
      "- Céphalées : OUI",
      "- Nausées / Vomissements : NON",
      "- Fatigue / Asthénie : OUI",
      "- Douleurs articulaires : OUI",
      "- Frissons : NON",
      "- Diarrhée : NON",
      "- Troubles de la conscience : NON",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "SIGNES VITAUX",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Température : 38.1°C",
      "Fréquence cardiaque : 88 bpm",
      "Fréquence respiratoire : 18 /min",
      "PA : 120/80 mmHg",
      "SpO2 : 98%",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "EXAMENS DE LABORATOIRE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TDR Paludisme : NÉGATIF",
      "Date TDR : 10/12/2024",
      "Espèce : N/A",
      "Hémoglobine : 12.1 g/dL",
      "Hématocrite : 37%",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONTEXTE ÉPIDÉMIOLOGIQUE",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Saison : Sèche",
      "Incidence régionale : 95 pour 1000 habitants",
      "Taux de positivité TDR : 18%",
      "Antécédents palustres (30j) : 0",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "COMORBIDITÉS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Aucune",
      "Patient vulnérable : NON",
      "Enfant < 5 ans : NON",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TRAITEMENT PRESCRIT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Médicament : Paracétamol (traitement symptomatique)",
      "Posologie : 1g x 3/jour",
      "Durée : 3 jours",
      "Orientation : Bilan complémentaire si persistance fièvre",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "CONCLUSION",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Diagnostic : Syndrome fébrile — TDR paludisme négatif",
      "Orientation : Rechercher autre étiologie (grippe, infection urinaire)",
      "Statut : Suivi ambulatoire",
      "",
      "Médecin : Dr. TOURÉ Ibrahim",
      "Signature : _______________",
    ],
  },
];

async function generatePDF(testCase) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();
  let y = height - 50;
  const marginLeft = 50;
  const lineHeight = 14;

  // Title
  page.drawText(testCase.title, {
    x: marginLeft,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.5),
  });
  y -= 30;

  // Separator
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  for (const line of testCase.content) {
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    }

    const isSection = line.startsWith("━");
    const isSectionTitle =
      line === line.toUpperCase() &&
      line.length > 3 &&
      !line.startsWith("-") &&
      !line.startsWith("━");

    if (isSection) {
      y -= 5;
    } else if (isSectionTitle && line.trim() !== "") {
      page.drawText(line, {
        x: marginLeft,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.15, 0.15, 0.45),
      });
      y -= lineHeight;
    } else {
      page.drawText(line, {
        x: marginLeft + (line.startsWith("-") ? 10 : 0),
        y,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function main() {
  mkdirSync("test-docs", { recursive: true });

  for (const tc of testCases) {
    const bytes = await generatePDF(tc);
    writeFileSync(`test-docs/${tc.filename}`, Buffer.from(bytes));
    console.log(`✅ Généré: test-docs/${tc.filename} (${bytes.length} octets)`);
  }

  console.log("\n📁 3 PDFs de test générés dans le dossier test-docs/");
}

main().catch(console.error);
