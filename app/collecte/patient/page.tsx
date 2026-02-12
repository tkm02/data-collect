"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  Heart,
  Save,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PatientPortalPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    symptoms: [] as string[],
    duration: "",
    severity: "mild",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const symptomOptions = [
    { id: "fever", label: "Fièvre" },
    { id: "chills", label: "Frissons" },
    { id: "fatigue", label: "Fatigue" },
    { id: "headache", label: "Maux de tête" },
    { id: "muscle_pain", label: "Douleurs musculaires" },
    { id: "nausea", label: "Nausées" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(symptomId);
      return {
        ...prev,
        symptoms: exists
          ? prev.symptoms.filter((s) => s !== symptomId)
          : [...prev.symptoms, symptomId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.symptoms.length === 0) {
      setResult({
        success: false,
        message: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulation envoi
    setTimeout(() => {
      setIsSubmitting(false);
      setResult({
        success: true,
        message: `Merci ${formData.name}! Votre déclaration a été reçue. Un professionnel vous contactera bientôt.`,
      });
      setFormData({
        name: "",
        email: "",
        symptoms: [],
        duration: "",
        severity: "mild",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Portail Patient</h1>
          <p className="text-xs text-slate-500">
            Auto-déclaration des symptômes
          </p>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-50 bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
              <UserCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Vos informations
            </h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email (optionnel)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean@example.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>

            {/* Symptômes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Symptômes *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {symptomOptions.map((symptom) => (
                  <label
                    key={symptom.id}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.symptoms.includes(symptom.id)}
                      onChange={() => handleSymptomToggle(symptom.id)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-sm text-slate-700">
                      {symptom.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Depuis combien de temps? (jours)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="3"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>

            {/* Sévérité */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Niveau de sévérité
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              >
                <option value="mild">Léger</option>
                <option value="moderate">Modéré</option>
                <option value="severe">
                  Grave - Nécessite assistance immédiate
                </option>
              </select>
            </div>

            {/* Résultat */}
            {result && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  result.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {result.success ? (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={result.success ? "text-green-800" : "text-red-800"}
                >
                  {result.message}
                </p>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Envoi..." : "Soumettre mon dossier"}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="font-semibold text-teal-900 mb-2">
            🔒 Confidentialité
          </h3>
          <p className="text-sm text-teal-800">
            Vos données sont chiffrées et conformes RGPD. Un code de suivi vous
            sera envoyé.
          </p>
        </div>
      </main>
    </div>
  );
}
