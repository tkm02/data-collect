"use client";

import {
  Activity,
  AlertCircle,
  BriefcaseMedical,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader,
  Save,
  Stethoscope,
  TestTube,
  User
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STEPS = [
  { id: 1, title: "Identification", icon: User },
  { id: 2, title: "Symptômes", icon: Activity },
  { id: 3, title: "Signes Vitaux", icon: Stethoscope },
  { id: 4, title: "Laboratoire", icon: TestTube },
  { id: 5, title: "Contexte", icon: ClipboardList },
  { id: 6, title: "Traitement", icon: BriefcaseMedical },
];

export default function KioskPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    consultationId: `CONS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    patientId: "",
    ageYears: "",
    ageMonths: "",
    gender: "F",
    region: "",
    district: "",
    commune: "",
    gpsLatitude: "",
    gpsLongitude: "",
    dateConsultation: new Date().toISOString().split("T")[0],
    heureConsultation: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),

    // Symptômes
    fievre: false,
    fievreTempC: "",
    fievreJours: "",
    cephalees: false,
    nauseesVomissements: false,
    fatigue: false,
    douleursArticulaires: false,
    frissons: false,
    diarhee: false,
    troublesConscience: false,

    // Signes vitaux
    temperatureC: "",
    fcBpm: "",
    frPm: "",
    paSystolique: "",
    paDiastolique: "",
    spo2Pct: "",

    // Laboratoire
    tdrPaludisme: "", // "positif", "négatif", "inconcluant"
    resultat_palu: false,
    parasitemiaPct: "",
    especePaludisme: "",
    hemoglobineGDl: "",

    // Contexte
    saison: "pluies",
    incidenceRegion: "",
    positiviteTdr: "",
    antecedentsPalustres30j: "",
    antecedentsCommunautaires: false,
    patientVulnerable: false,
    comorbidites: [] as string[],

    // Traitement & Issue
    traitementPrimaryName: "",
    traitementPrimaryDose: "",
    traitementPrimaryDuree: "",
    traitementPrimaryAdherence: false,
    outcomeStatus: "en traitement",
    outcomeDeces: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const val = type === "checkbox" ? e.target.checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:4000/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ageYears: formData.ageYears ? Number(formData.ageYears) : null,
          ageMonths: formData.ageMonths ? Number(formData.ageMonths) : null,
          temperatureC: formData.temperatureC ? Number(formData.temperatureC) : null,
          fievreTempC: formData.fievreTempC ? Number(formData.fievreTempC) : null,
          fievreJours: formData.fievreJours ? Number(formData.fievreJours) : null,
          fcBpm: formData.fcBpm ? Number(formData.fcBpm) : null,
          frPm: formData.frPm ? Number(formData.frPm) : null,
          paSystolique: formData.paSystolique ? Number(formData.paSystolique) : null,
          paDiastolique: formData.paDiastolique ? Number(formData.paDiastolique) : null,
          spo2Pct: formData.spo2Pct ? Number(formData.spo2Pct) : null,
          parasitemiaPct: formData.parasitemiaPct ? Number(formData.parasitemiaPct) : null,
          hemoglobineGDl: formData.hemoglobineGDl ? Number(formData.hemoglobineGDl) : null,
          traitementPrimaryDuree: formData.traitementPrimaryDuree ? Number(formData.traitementPrimaryDuree) : null,
          sourceType: 'kiosque'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: "Consultation enregistrée avec succès !" });
        setTimeout(() => window.location.href = "/", 3000);
      } else {
        setResult({ success: false, message: data.message || "Erreur lors de l'enregistrement" });
      }
    } catch (error) {
      setResult({ success: false, message: "Erreur de connexion au serveur" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // @ts-ignore
  const isSevere = formData.troublesConscience || (formData.temperatureC && Number(formData.temperatureC) > 40);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-white border-b border-slate-200 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Collecte de Données</h1>
            <p className="text-xs text-slate-500 font-medium">Kiosque Intelligent • Côte d'Ivoire</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isSevere ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
          <span className="text-xs font-bold text-slate-500 uppercase">
            {isSevere ? "Alerte Sévérité" : "Statut Normal"}
          </span>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="fixed top-[73px] left-0 w-full h-1.5 bg-slate-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="pt-32 pb-32 px-4 max-w-3xl mx-auto">
        {/* Step Indicator Desktop */}
        <div className="hidden md:flex justify-between mb-8">
          {STEPS.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center gap-2 group cursor-pointer transition-all ${currentStep === step.id ? "opacity-100" : "opacity-40"}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className={`p-3 rounded-2xl ${currentStep === step.id ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 group-hover:bg-slate-100"}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{step.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Identification */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><User className="w-6 h-6"/></div>
                Identification du Patient
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">ID Patient (Anonymisé)</label>
                  <input 
                    name="patientId" 
                    value={formData.patientId} 
                    onChange={handleInputChange}
                    placeholder="ex: PAT_anon_001"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Âge (Ans)</label>
                    <input type="number" name="ageYears" value={formData.ageYears} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Mois</label>
                    <input type="number" name="ageMonths" value={formData.ageMonths} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Sexe</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none">
                    <option value="F">Femme</option>
                    <option value="M">Homme</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">District Sanitaire</label>
                  <input name="district" value={formData.district} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none"/>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Symptômes */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl"><Activity className="w-6 h-6"/></div>
                  Symptômes Présents
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "fievre", label: "Fièvre", icon: "🔥" },
                    { id: "cephalees", label: "Maux de tête", icon: "🤕" },
                    { id: "nauseesVomissements", label: "Nausées / Vomissements", icon: "🤮" },
                    { id: "fatigue", label: "Fatigue intense", icon: "😫" },
                    { id: "frissons", label: "Frissons", icon: "🥶" },
                    { id: "diarhee", label: "Diarrhée", icon: "🚽" },
                    { id: "douleursArticulaires", label: "Douleurs Articulaires", icon: "🦴" },
                    { id: "troublesConscience", label: "Troubles Conscience", icon: "🧠", danger: true },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      // @ts-ignore
                      onClick={() => setFormData(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                      // @ts-ignore
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                        // @ts-ignore
                        formData[s.id] 
                        ? (s.danger ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100" : "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100") 
                        : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="font-bold text-sm">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Signes Vitaux */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Stethoscope className="w-6 h-6"/></div>
                Signes Vitaux
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Température (°C)</label>
                  <input type="number" step="0.1" name="temperatureC" value={formData.temperatureC} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-black focus:bg-white outline-none transition-all"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">FC (BPM)</label>
                  <input type="number" name="fcBpm" value={formData.fcBpm} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-black focus:bg-white outline-none transition-all"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">SPO2 (%)</label>
                  <input type="number" name="spo2Pct" value={formData.spo2Pct} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-black focus:bg-white outline-none transition-all"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">PA Systolique</label>
                  <input type="number" name="paSystolique" value={formData.paSystolique} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-black focus:bg-white outline-none transition-all"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">PA Diastolique</label>
                  <input type="number" name="paDiastolique" value={formData.paDiastolique} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-black focus:bg-white outline-none transition-all"/>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Lab */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><TestTube className="w-6 h-6"/></div>
                Laboratoire / TDR
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Résultat TDR</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["positif", "négatif", "inconcluant"].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tdrPaludisme: r }))}
                        className={`p-4 rounded-2xl font-bold uppercase text-xs transition-all ${
                          formData.tdrPaludisme === r 
                          ? "bg-purple-600 text-white shadow-lg" 
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Parasitémie (%)</label>
                    <input type="number" name="parasitemiaPct" value={formData.parasitemiaPct} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Espèce</label>
                    <select name="especePaludisme" value={formData.especePaludisme} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none">
                      <option value="">Sélectionner</option>
                      <option value="P. falciparum">P. falciparum</option>
                      <option value="P. malariae">P. malariae</option>
                      <option value="P. ovale">P. ovale</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Contexte */}
          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><ClipboardList className="w-6 h-6"/></div>
                Contexte & Antécédents
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><User className="w-4 h-4 text-orange-500"/></div>
                    <div>
                      <p className="font-bold text-sm">Patient Vulnérable</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Enceinte / Malnutrition / VIH</p>
                    </div>
                  </div>
                  <input type="checkbox" name="patientVulnerable" checked={formData.patientVulnerable} onChange={handleInputChange} className="w-6 h-6 accent-orange-500"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Épisodes de Paludisme (30 derniers jours)</label>
                  <input type="number" name="antecedentsPalustres30j" value={formData.antecedentsPalustres30j} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white transition-all"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Saison Actuelle</label>
                  <select name="saison" value={formData.saison} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none">
                    <option value="pluies">Saison des Pluies</option>
                    <option value="sèche">Saison Sèche</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Traitement */}
          {currentStep === 6 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><BriefcaseMedical className="w-6 h-6"/></div>
                Traitement & Issue
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Traitement Prescrit (Molécule)</label>
                  <input name="traitementPrimaryName" value={formData.traitementPrimaryName} onChange={handleInputChange} placeholder="ex: CTA (Artéméther + Luméfantrine)" className="w-full p-4 bg-slate-50 rounded-2xl focus:bg-white outline-none transition-all"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Dose</label>
                    <input name="traitementPrimaryDose" value={formData.traitementPrimaryDose} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Durée (Jours)</label>
                    <input type="number" name="traitementPrimaryDuree" value={formData.traitementPrimaryDuree} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Issue de Consultation</label>
                  <select name="outcomeStatus" value={formData.outcomeStatus} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none">
                    <option value="en traitement">En traitement</option>
                    <option value="guéris">Guéris</option>
                    <option value="référé">Référé (CHU/Hôpital)</option>
                    <option value="décès">Décès</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {result && (
            <div className={`p-6 rounded-3xl shadow-lg border-l-8 animate-in zoom-in-95 ${result.success ? "bg-green-50 border-green-500 text-green-800" : "bg-red-50 border-red-500 text-red-800"}`}>
              <div className="flex items-center gap-4">
                {result.success ? <Check className="w-8 h-8"/> : <AlertCircle className="w-8 h-8"/>}
                <p className="font-black">{result.message}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4 shadow-xl z-40">
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="p-5 rounded-2xl bg-slate-100 text-slate-600 font-black disabled:opacity-30 transition-all hover:bg-slate-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{currentStep} / {STEPS.length}</span>
              </div>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-5 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200 hover:scale-105 transition-all flex items-center gap-3"
                >
                  Suivant
                  <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  Finaliser
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
