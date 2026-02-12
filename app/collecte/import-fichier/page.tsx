"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ImportFichierPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setResult({
        success: false,
        message: "Veuillez sélectionner un fichier",
      });
      return;
    }

    setIsLoading(true);
    // Simulation d'upload
    setTimeout(() => {
      setIsLoading(false);
      setResult({
        success: true,
        message: `${file.name} importé avec succès. ${
          Math.floor(Math.random() * 100) + 10
        } lignes traitées.`,
      });
      setFile(null);
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
          <h1 className="text-lg font-bold text-slate-800">
            Import Excel / CSV
          </h1>
          <p className="text-xs text-slate-500">Chargement en masse</p>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
        >
          {/* Zone de dépôt */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="font-semibold text-slate-800 mb-1">
                {file ? file.name : "Déposez votre fichier ici"}
              </p>
              <p className="text-sm text-slate-500">
                CSV, Excel (.xlsx, .xls) acceptés
              </p>
            </label>
          </div>

          {/* Message d'erreur/succès */}
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
              <p className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
              </p>
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {isLoading ? "Traitement..." : "Importer"}
          </button>
        </form>

        {/* Aide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Format attendu</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • En-têtes : patientId, age, gender, temperature, symptoms,
              rdtResult
            </li>
            <li>• Séparateur : virgule ou tabulation</li>
            <li>• Max 5000 lignes par fichier</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
