'use client';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'scan', label: 'Escanear', icon: '📠' },
    { id: 'upload', label: 'Subir', icon: '📤' },
    { id: 'documents', label: 'Documentos', icon: '📁' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg rounded-lg p-4">
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-gray-700 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <p className="text-sm text-blue-700">
          DocScan utiliza OCR para extraer texto de imágenes y documentos escaneados.
        </p>
      </div>
    </aside>
  );
}
