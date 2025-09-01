import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { Dashboard } from './components/Dashboard';
import { CampaignInitialization } from './components/CampaignInitialization';
import { Navbar } from './components/Navbar';
import DeliverableTable from './components/DeliverableTable';
import { MediaSummary } from './components/MediaSummary';
import { PriceTransparencyPanel } from './components/PriceTransparencyPanel';
import { useMediaSummaryData } from './hooks/useMediaSummaryData';
import { calculateScenarioMetrics, formatCurrency } from './utils/calculations';
import { exportToCsv } from './utils/export';
import { Campaign } from './types/campaign';
import { sampleDeliverables, sampleCampaigns } from './utils/mockData';

function App() {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>(sampleCampaigns);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [isCreatingNewCampaign, setIsCreatingNewCampaign] = useState(false);
  const [isEditingActiveCampaign, setIsEditingActiveCampaign] = useState(false);
  const [isMediaSummaryOpen, setIsMediaSummaryOpen] = useState(true);

  const activeCampaign = activeCampaignId 
    ? allCampaigns.find(c => c.id === activeCampaignId) 
    : null;

  const handleDeliverablesChange = React.useCallback((newDeliverables: DeliverableRow[]) => {
    if (activeCampaignId) {
      setAllCampaigns(prev => prev.map(campaign => 
        campaign.id === activeCampaignId 
          ? { ...campaign, deliverables: newDeliverables, updatedAt: new Date() }
          : campaign
      ));
    }
  }, [activeCampaignId]);

  const handlePlanningModeChange = React.useCallback((newMode: PlanningMode) => {
    if (activeCampaignId) {
      setAllCampaigns(prev => prev.map(campaign => 
        campaign.id === activeCampaignId 
          ? { ...campaign, planningMode: newMode, updatedAt: new Date() }
          : campaign
      ));
    }
  }, [activeCampaignId]);

  const {
    deliverables,
    planningMode,
    selectedRowId,
    selectedRowIds,
    setPlanningMode,
    updateDeliverable,
    toggleExpanded,
    addDeliverable,
    addChildDeliverable,
    deleteDeliverable,
    toggleRowSelection,
    clearSelection,
    bulkEditDeliverables,
    materializeGenericCohort,
  } = useMediaSummaryData(
    activeCampaign?.deliverables || [],
    activeCampaign?.planningMode || 'blended',
    handleDeliverablesChange,
    handlePlanningModeChange
  );
  
  const metrics = calculateScenarioMetrics(deliverables);
  const selectedRow = selectedRowId 
    ? deliverables.find(d => d.id === selectedRowId) || 
      deliverables.flatMap(d => d.children || []).find(c => c.id === selectedRowId)
    : null;

  const handleCreateNewCampaign = () => {
    setIsCreatingNewCampaign(true);
  };

  const handleSelectCampaign = (campaignId: string) => {
    setActiveCampaignId(campaignId);
  };

  const handleBackToDashboard = () => {
    setActiveCampaignId(null);
  };

  const handleEditActiveCampaign = () => {
    setIsEditingActiveCampaign(true);
  };

  const handleExport = () => {
    if (activeCampaign) {
      exportToCsv(deliverables, metrics, activeCampaign.name);
    }
  };

  const handleCampaignInitializationComplete = (campaign: Campaign) => {
    if (isCreatingNewCampaign) {
      // Creating new campaign
      const newCampaign: Campaign = {
        ...campaign,
        deliverables: sampleDeliverables,
        planningMode: 'blended',
      };
      setAllCampaigns(prev => [...prev, newCampaign]);
      setActiveCampaignId(newCampaign.id);
      setIsCreatingNewCampaign(false);
    } else if (isEditingActiveCampaign && activeCampaignId) {
      // Editing existing campaign
      setAllCampaigns(prev => prev.map(c => 
        c.id === activeCampaignId ? { ...campaign, updatedAt: new Date() } : c
      ));
      setIsEditingActiveCampaign(false);
    }
  };

  // Show dashboard if no active campaign
  if (!activeCampaignId && !isCreatingNewCampaign && !isEditingActiveCampaign) {
    return (
      <Dashboard
        campaigns={allCampaigns}
        onCreateNew={handleCreateNewCampaign}
        onSelectCampaign={handleSelectCampaign}
      />
    );
  }

  // Show campaign initialization for new or editing
  if (isCreatingNewCampaign || isEditingActiveCampaign) {
    return (
      <ErrorBoundary>
        <CampaignInitialization 
          onComplete={handleCampaignInitializationComplete}
          existingCampaign={isEditingActiveCampaign ? activeCampaign : undefined}
        />
      </ErrorBoundary>
    );
  }

  // Show main campaign interface
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          onExport={handleExport}
          planningMode={planningMode}
          onPlanningModeChange={setPlanningMode}
          onBackToDashboard={handleBackToDashboard}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">{activeCampaign?.name}</h2>
                <button
                  onClick={handleEditActiveCampaign}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Edit campaign details"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                  {activeCampaign?.client} • {activeCampaign?.brand}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {deliverables.length} deliverables • {planningMode} planning mode • {activeCampaign?.markets.join(', ')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <DeliverableTable
                deliverables={deliverables}
                onUpdate={updateDeliverable}
                onToggleExpanded={toggleExpanded}
                onAddChild={addChildDeliverable}
                onAddRow={addDeliverable}
                onDeleteRow={deleteDeliverable}
                selectedRowIds={selectedRowIds}
                onToggleRowSelection={toggleRowSelection}
                onClearSelection={clearSelection}
                onBulkEdit={bulkEditDeliverables}
                onMaterializeCohort={materializeGenericCohort}
              />
              
              <PriceTransparencyPanel selectedRow={selectedRow} />
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Overview
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Investment</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(metrics.totalCost)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium">Organic</p>
                      <p className="text-lg font-bold text-green-800">
                        {formatCurrency(metrics.organicCost)}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium">Paid</p>
                      <p className="text-lg font-bold text-blue-800">
                        {formatCurrency(metrics.paidCost)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Tips
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Use cohorts for flexible budget planning, then materialize into specific creators
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Rights and pricing cascade from parent to child deliverables
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Use bulk edit to apply changes to multiple deliverables at once
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <MediaSummary
          isOpen={isMediaSummaryOpen}
          onClose={() => setIsMediaSummaryOpen(false)}
          onToggle={() => setIsMediaSummaryOpen(!isMediaSummaryOpen)}
          metrics={metrics}
          deliverables={deliverables}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;