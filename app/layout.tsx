import type { Metadata } from "next";
import { Inter } from "next/font/google"; // On utilise Inter, très lisible pour la data
import "./globals.css";

// Configuration de la police avec les sous-ensembles latins
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Collecte Analytics Paludisme",
  description: "Plateforme de collecte et d'analyse de données médicales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}