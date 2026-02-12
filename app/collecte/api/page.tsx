"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  Loader,
  Server,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ApiPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl.trim()) {
      setResult({ success: false, message: "Veuillez entrer une URL API" });
      return;
    }

    setIsConnecting(true);
    // Simulation connexion API
    setTimeout(() => {
      setIsConnecting(false);
      const isValid = apiUrl.startsWith("http");
      setResult({
        success: isValid,
        message: isValid
          ? "Connexion établie avec succès"
          : "URL invalide (doit commencer par http)",
        data: isValid
          ? {
              endpoint: apiUrl,
              lastSync: new Date().toLocaleString(),
              records: Math.floor(Math.random() * 500) + 100,
            }
          : undefined,
      });
      if (isValid) setApiUrl("");
    }, 1800);
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
            Connexion API Externe
          </h1>
          <p className="text-xs text-slate-500">
            Sync automatique inter-hôpitaux
          </p>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
        >
          {/* Input URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Endpoint API
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.hopital-partenaire.com/v1/patients"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          {/* Statut de connexion */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {result.success ? (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={
                    result.success
                      ? "text-green-800 font-semibold"
                      : "text-red-800"
                  }
                >
                  {result.message}
                </p>
              </div>
              {result.data && (
                <div className="ml-8 text-sm text-green-700 space-y-1">
                  <p>🔗 Endpoint : {result.data.endpoint}</p>
                  <p>⏱️ Dernière sync : {result.data.lastSync}</p>
                  <p>📊 Enregistrements : {result.data.records}</p>
                </div>
              )}
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Connecter
              </>
            )}
          </button>
        </form>

        {/* Doc */}
        <div className="mt-8 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">
              📖 Format requis
            </h3>
            <p className="text-sm text-purple-800 mb-2">
              L'API doit retourner un JSON avec structure standardisée :
            </p>
            <code className="block bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
              {`{
  "patients": [
    {
      "id": "PAT001",
      "age": 25,
      "symptoms": ["fever"],
      "rdtResult": "positive"
    }
  ]
}`}
            </code>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🔐 Sécurité</h3>
            <p className="text-sm text-blue-800">
              Authentification JWT sera implémentée. Pour l'instant : test mode.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
