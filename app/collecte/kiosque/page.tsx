'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  AlertCircle, 
  Save, 
  Thermometer, 
  User, 
  TestTube,
  Activity,
  Check,
  LayoutDashboard
} from 'lucide-react';

export default function KioskPage() {
  const [formData, setFormData] = useState({
    patientId: '',
    age: '',
    gender: 'F',
    temperature: '',
    symptoms: [] as string[],
    rdtResult: 'negative',
  });

  const symptomsList = [
    { id: 'fever', label: 'Fièvre (> 38°C)', icon: '🔥' },
    { id: 'vomiting', label: 'Vomissements', icon: '🤮' },
    { id: 'headache', label: 'Maux de tête', icon: '🤕' },
    { id: 'anemia', label: 'Pâleur / Anémie', icon: '👀' },
    { id: 'convulsions', label: 'Convulsions', icon: '⚡', severe: true },
    { id: 'coma', label: 'Inconscience', icon: '🧠', severe: true },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData(prev => {
      const exists = prev.symptoms.includes(symptomId);
      return {
        ...prev,
        symptoms: exists 
          ? prev.symptoms.filter(s => s !== symptomId) 
          : [...prev.symptoms, symptomId]
      };
    });
  };

  // Logique OMS
  const isSevere = 
    Number(formData.temperature) > 40 || 
    formData.symptoms.includes('convulsions') || 
    formData.symptoms.includes('coma') ||
    (formData.age !== '' && Number(formData.age) < 5 && Number(formData.temperature) > 39.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi
    alert("Données transmises au pipeline.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Top Navigation Bar - Minimaliste */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Nouvelle Consultation</h1>
            <p className="text-xs text-slate-500 font-medium">Centre de Santé • Mode Connecté</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isSevere ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isSevere ? 'Alerte Active' : 'Système Prêt'}
            </span>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: IDENTIFICATION (Card Clean) */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Identité Patient</h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ID Anonyme</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    placeholder="ex: PAT-2024-889"
                    className="w-full bg-slate-50 text-slate-900 font-medium rounded-xl border-0 ring-1 ring-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Âge</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Ans"
                  className="w-full bg-slate-50 text-slate-900 font-medium rounded-xl border-0 ring-1 ring-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sexe</label>
                <div className="flex bg-slate-50 rounded-xl p-1 ring-1 ring-slate-200 h-[48px]">
                  {['F', 'M'].map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: sex }))}
                      className={`flex-1 rounded-lg text-sm font-bold transition-all ${formData.gender === sex ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {sex === 'F' ? 'Femme' : 'Homme'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: CONSTANTES (Split Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Température */}
            <section className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${Number(formData.temperature) > 38 ? 'border-red-200 shadow-red-100 ring-1 ring-red-100' : 'border-slate-100'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${Number(formData.temperature) > 38 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">Température</span>
                  </div>
                  {Number(formData.temperature) > 38 && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Fièvre</span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="37.0"
                    className="w-full text-4xl font-extrabold text-slate-800 placeholder:text-slate-200 border-none focus:ring-0 p-0 bg-transparent"
                    required
                  />
                  <span className="absolute right-0 top-2 text-slate-400 text-lg font-medium">°C</span>
                </div>
              </div>
              {/* Jauge visuelle simple */}
              <div className="h-1.5 w-full bg-slate-100">
                <div 
                  className={`h-full transition-all duration-500 ${Number(formData.temperature) > 38 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${Math.min(((Number(formData.temperature || 35) - 35) / 7) * 100, 100)}%` }}
                ></div>
              </div>
            </section>

            {/* Test TDR */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                  <TestTube className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700">Résultat TDR</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { val: 'negative', label: 'Négatif (-)', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200', active: 'bg-slate-800 text-white' },
                   { val: 'positive', label: 'Positif (+)', color: 'bg-red-50 text-red-600 hover:bg-red-100', active: 'bg-red-600 text-white' },
                   { val: 'mixed', label: 'Mixte', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', active: 'bg-purple-600 text-white' }
                 ].map((opt) => (
                   <button
                    key={opt.val}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rdtResult: opt.val }))}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${formData.rdtResult === opt.val ? opt.active + ' shadow-md scale-105' : opt.color}`}
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
            </section>
          </div>

          {/* SECTION 3: SYMPTÔMES (Interactive Grid) */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Symptômes Cliniques
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {symptomsList.map((symp) => {
                const isActive = formData.symptoms.includes(symp.id);
                return (
                  <button
                    key={symp.id}
                    type="button"
                    onClick={() => handleSymptomToggle(symp.id)}
                    className={`
                      relative group flex flex-col items-start p-5 rounded-2xl border transition-all duration-200 text-left
                      ${isActive 
                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}
                    `}
                  >
                    <div className="flex justify-between w-full mb-2">
                      <span className="text-2xl">{symp.icon}</span>
                      {isActive && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-700'}`}>
                      {symp.label}
                    </span>
                    {symp.severe && (
                      <span className={`text-[10px] uppercase font-bold mt-1 ${isActive ? 'text-red-200' : 'text-red-500'}`}>
                        Signe Grave
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* FLOATING ACTION BAR */}
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
              
              {/* Zone d'alerte dynamique */}
              <div className="flex-1 w-full md:w-auto">
                {isSevere ? (
                  <div className="flex items-center gap-3 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-in slide-in-from-bottom-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm leading-none">CAS GRAVE DÉTECTÉ</p>
                      <p className="text-xs opacity-80 mt-0.5">Hospitalisation requise (Critères OMS)</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 hidden md:block pl-2">Veuillez vérifier les données avant envoi.</p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link href="/" className="px-6 py-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors">
                  Annuler
                </Link>
                <button 
                  type="submit"
                  className={`
                    flex-1 md:flex-none px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2
                    ${isSevere ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}
                  `}
                >
                  <Save className="w-5 h-5" />
                  <span>{isSevere ? 'Enregistrer Urgence' : 'Valider le dossier'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Espace pour le footer fixe */}
          <div className="h-24"></div>

        </form>
      </main>
    </div>
  );
}