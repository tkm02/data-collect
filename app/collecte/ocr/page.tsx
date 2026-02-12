"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  Loader,
  ScanLine,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setResult({ success: false, message: "Veuillez sélectionner un PDF" });
      return;
    }

    setIsProcessing(true);
    // Simulation OCR avec délai
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        success: true,
        message: "Extraction OCR réussie",
        data: {
          pages: 3,
          textBlocks: 15,
          tables: 2,
        },
      });
      setFile(null);
    }, 2500);
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
            Scanner PDF & OCR
          </h1>
          <p className="text-xs text-slate-500">
            Extraction intelligente via IA
          </p>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
        >
          {/* Zone de dépôt */}
          <div className="border-2 border-dashed border-red-300 rounded-xl p-12 text-center hover:border-red-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-input"
            />
            <label htmlFor="pdf-input" className="cursor-pointer block">
              <ScanLine className="w-12 h-12 mx-auto text-red-400 mb-4" />
              <p className="font-semibold text-slate-800 mb-1">
                {file ? file.name : "Déposez votre rapport ici"}
              </p>
              <p className="text-sm text-slate-500">PDF, images supportés</p>
            </label>
          </div>

          {/* Résultat */}
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
                  <p>📄 Pages : {result.data.pages}</p>
                  <p>📝 Blocs de texte : {result.data.textBlocks}</p>
                  <p>📊 Tableaux détectés : {result.data.tables}</p>
                </div>
              )}
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={!file || isProcessing}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Traitement OCR...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyser le document
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">
            ⚠️ En développement
          </h3>
          <p className="text-sm text-amber-800">
            L'OCR utilisera Tesseract.js ou une API cloud (AWS Textract, Azure
            Document Intelligence)
          </p>
        </div>
      </main>
    </div>
  );
}
