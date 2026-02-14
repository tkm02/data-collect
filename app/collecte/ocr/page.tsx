"use client";

import {
    AlertCircle,
    ArrowRight,
    Bot,
    Check,
    ChevronLeft,
    Database,
    FileText,
    Loader,
    ScanLine,
    Upload,
    Wifi,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Step = "upload" | "extract" | "format" | "done";

interface ExtractionResult {
  text: string;
  pages: number;
  fileName: string;
  fileSize: number;
}

interface FormatResult {
  consultation: Record<string, unknown>;
  aiExtracted: Record<string, unknown>;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

interface ConnectionStatus {
  success: boolean;
  status: string;
  message?: string;
  data?: {
    model: string;
    latencyMs: number;
  };
  error?: string;
}

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Résultats
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [formatResult, setFormatResult] = useState<FormatResult | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setStep("upload");
      setExtraction(null);
      setFormatResult(null);
    }
  };

  // Test connexion Perplexity
  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await fetch("/api/test-perplexity");
      const data = await res.json();
      setConnectionStatus(data);
    } catch {
      setConnectionStatus({
        success: false,
        status: "NETWORK_ERROR",
        error: "Impossible de joindre le serveur",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Étape 1: Extraction du texte
  const handleExtract = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier PDF");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de l'extraction");
        return;
      }

      setExtraction(data.data);
      setStep("extract");
    } catch {
      setError("Erreur réseau lors de l'extraction");
    } finally {
      setIsProcessing(false);
    }
  };

  // Étape 2: Formatage IA
  const handleFormat = async () => {
    if (!extraction?.text) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extraction.text }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors du formatage IA");
        if (data.rawResponse) {
          console.log("Réponse brute de l'IA:", data.rawResponse);
        }
        return;
      }

      setFormatResult(data.data);
      setStep("done");
    } catch {
      setError("Erreur réseau lors du formatage IA");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setStep("upload");
    setExtraction(null);
    setFormatResult(null);
    setError(null);
  };

  const steps = [
    { key: "upload", label: "Upload", icon: Upload },
    { key: "extract", label: "Extraction", icon: FileText },
    { key: "format", label: "IA", icon: Bot },
    { key: "done", label: "Sauvegardé", icon: Database },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

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
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800">
            Scanner PDF & Extraction IA
          </h1>
          <p className="text-xs text-slate-500">
            Upload → Extraction texte → Formatage Perplexity Sonar → MongoDB
          </p>
        </div>
        <button
          onClick={testConnection}
          disabled={testingConnection}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {testingConnection ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}
          Tester API
        </button>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto space-y-6">
        {/* Résultat test connexion */}
        {connectionStatus && (
          <div
            className={`p-4 rounded-xl border ${
              connectionStatus.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {connectionStatus.success ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span
                className={`font-medium ${
                  connectionStatus.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {connectionStatus.message || connectionStatus.error}
              </span>
            </div>
            {connectionStatus.data && (
              <div className="mt-2 ml-7 text-sm text-green-700">
                <p>Modèle: {connectionStatus.data.model}</p>
                <p>Latence: {connectionStatus.data.latencyMs}ms</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Stepper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${
                        isDone || isActive ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-5 ${
                        isDone ? "bg-green-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ÉTAPE 1: Upload */}
        {step === "upload" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
            <div className="text-center">
              <ScanLine className="w-12 h-12 mx-auto text-blue-500 mb-3" />
              <h2 className="text-xl font-bold text-slate-800">
                Étape 1 : Uploader un PDF
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Sélectionnez un document de consultation paludisme
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-input"
              />
              <label htmlFor="pdf-input" className="cursor-pointer block">
                <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="font-semibold text-slate-800 mb-1">
                  {file ? file.name : "Cliquez pour sélectionner un PDF"}
                </p>
                {file && (
                  <p className="text-sm text-slate-500">
                    {(file.size / 1024).toFixed(1)} Ko
                  </p>
                )}
                {!file && (
                  <p className="text-sm text-slate-400">PDF uniquement</p>
                )}
              </label>
            </div>

            <button
              onClick={handleExtract}
              disabled={!file || isProcessing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Extraction en cours...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Extraire le texte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ÉTAPE 2: Texte extrait — Revue et envoi à l'IA */}
        {step === "extract" && extraction && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Étape 2 : Texte extrait
              </h2>
              <p className="text-sm text-slate-500">
                {extraction.pages} page(s) • {extraction.fileName} •{" "}
                {(extraction.fileSize / 1024).toFixed(1)} Ko
              </p>
            </div>

            {/* Aperçu du texte */}
            <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-200">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {extraction.text}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Recommencer
              </button>
              <button
                onClick={handleFormat}
                disabled={isProcessing}
                className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Formatage IA...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5" />
                    Formater avec Sonar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3: Résultat final */}
        {step === "done" && formatResult && (
          <div className="space-y-6">
            {/* Succès */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-900">
                    Consultation sauvegardée !
                  </h2>
                  <p className="text-sm text-green-700">
                    Modèle: {formatResult.model} • Tokens:{" "}
                    {formatResult.usage?.prompt_tokens +
                      formatResult.usage?.completion_tokens}
                  </p>
                </div>
              </div>
            </div>

            {/* Données extraites */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Données extraites par l&apos;IA
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(formatResult.aiExtracted, null, 2)}
                </pre>
              </div>
            </div>

            {/* Consultation sauvegardée */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-500" />
                Enregistrement MongoDB
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(formatResult.consultation, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Traiter un autre document
            </button>
          </div>
        )}

        {/* Aide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Comment ça marche
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              Uploadez un PDF de consultation paludisme
            </li>
            <li>
              Le texte est extrait automatiquement (pdf-parse)
            </li>
            <li>
              Perplexity Sonar formate les données au format ConsultationPaludismeCI
            </li>
            <li>
              Les données structurées sont sauvegardées en base MongoDB
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
