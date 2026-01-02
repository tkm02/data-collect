import Link from 'next/link';
import { 
  TabletSmartphone, 
  FileSpreadsheet, 
  ScanLine, 
  FileText, 
  Server, 
  UserCircle, 
  Activity, 
  Database,
  CheckCircle2
} from 'lucide-react'; // Import des icônes

export default function Home() {
  
  const sources = [
    {
      id: 'kiosk',
      title: 'Formulaire Kiosque',
      description: 'Saisie manuelle patient en temps réel (Tablette/Mobile)',
      icon: <TabletSmartphone className="w-8 h-8" />, // Icône Lucide
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      href: '/collecte/kiosque'
    },
    {
      id: 'excel',
      title: 'Import Excel / CSV',
      description: 'Chargement en masse de fichiers structurés',
      icon: <FileSpreadsheet className="w-8 h-8" />,
      color: 'text-green-600 bg-green-50 border-green-200',
      href: '/collecte/import-fichier'
    },
    {
      id: 'pdf',
      title: 'Scanner PDF & OCR',
      description: 'Extraction intelligente depuis rapports scannés',
      icon: <ScanLine className="w-8 h-8" />,
      color: 'text-red-600 bg-red-50 border-red-200',
      href: '/collecte/ocr'
    },
    {
      id: 'markdown',
      title: 'Texte Libre (Markdown)',
      description: 'Notes médicales non structurées',
      icon: <FileText className="w-8 h-8" />,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
      href: '/collecte/markdown'
    },
    {
      id: 'api',
      title: 'Connexion API Externe',
      description: 'Sync automatique avec autres hôpitaux',
      icon: <Server className="w-8 h-8" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      href: '/collecte/api'
    },
    {
      id: 'patient',
      title: 'Portail Patient',
      description: 'Auto-déclaration des symptômes',
      icon: <UserCircle className="w-8 h-8" />,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      href: '/collecte/patient'
    }
  ];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* En-tête */}
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg mb-6">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Plateforme de Collecte Paludisme
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Sélectionnez une source pour ingérer, normaliser et analyser les données médicales.
          Architecture centralisée conforme aux normes OMS.
        </p>
      </header>

      {/* Grille des Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <Link 
            key={source.id} 
            href={source.href}
            className="group block p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-500/30 relative overflow-hidden"
          >
            <div className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 transition-colors ${source.color}`}>
              {source.icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
              {source.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {source.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Footer Statut */}
      <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Système v1.0
        </span>
        <div className="flex gap-6">
          <span className="flex items-center gap-2 text-green-600">
            <Database className="w-4 h-4" />
            Base de données Connectée
          </span>
          <span className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            API En ligne
          </span>
        </div>
      </div>
    </main>
  );
}