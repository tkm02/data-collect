"use client";

import { AlertCircle, Check, ChevronLeft, FileText, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function MarkdownPage() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setResult({ success: false, message: "Veuillez saisir du contenu" });
      return;
    }

    setIsLoading(true);
    // Simulation traitement
    setTimeout(() => {
      setIsLoading(false);
      const lineCount = content.split("\n").length;
      setResult({
        success: true,
        message: `Notes sauvegardées (${lineCount} lignes). Analyse sémantique en cours...`,
      });
      setContent("");
    }, 1200);
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
            Texte Libre (Markdown)
          </h1>
          <p className="text-xs text-slate-500">
            Notes médicales non structurées
          </p>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
        >
          {/* Éditeur */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes du patient
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saisir les observations médicales...&#10;- Fièvre depuis 3 jours&#10;- Vomissements fréquents&#10;- RDT paludisme : positif&#10;&#10;Recommandation : traitement ACT..."
              className="w-full h-80 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">
              Supporte Markdown basique : **gras**, *italique*, - listes
            </p>
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
              <p className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
              </p>
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-600 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isLoading ? "Enregistrement..." : "Enregistrer les notes"}
          </button>
        </form>

        {/* Guide */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-800 mb-2">💡 Conseils</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Incluez date/heure de consultation</li>
            <li>• Détaillez symptômes et signes vitaux</li>
            <li>• Mentionnez résultats tests diagnostiques</li>
            <li>• Proposez diagnostic et traitement</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
