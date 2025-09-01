import React from 'react';
import { Download, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface NavbarProps {
  onExport: () => void;
  planningMode: string;
  onPlanningModeChange: (mode: string) => void;
  onBackToDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onExport, 
  planningMode, 
  onPlanningModeChange,
  onBackToDashboard
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
            >
              <img 
                src="/negotiator_logo_gradient.png" 
                alt="Negotiator Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold text-gray-900">Negotiator</h1>
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">
              Influencer Media Planner
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Planning Mode:
              </label>
              <select
                value={planningMode}
                onChange={(e) => onPlanningModeChange(e.target.value)}
                className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="generic">Generic</option>
                <option value="specific">Specific</option>
                <option value="blended">Blended</option>
              </select>
            </div>
            
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      </header>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};