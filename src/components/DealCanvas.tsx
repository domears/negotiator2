import React from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { DeliverableRow, BulkEditOptions } from '../types/campaign';
import { DeliverableCard } from './DeliverableCard';
import { BulkEditModal } from './BulkEditModal';

interface DealCanvasProps {
  deliverables: DeliverableRow[];
  onUpdate: (id: string, updates: Partial<DeliverableRow>) => void;
  onToggleExpanded: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  selectedRowIds: string[];
  onToggleRowSelection: (id: string) => void;
  onClearSelection: () => void;
  onBulkEdit: (updates: BulkEditOptions) => void;
  onMaterializeCohort: (cohortId: string) => void;
}

const DealCanvas: React.FC<DealCanvasProps> = ({
  deliverables,
  onUpdate,
  onToggleExpanded,
  onAddChild,
  onAddRow,
  onDeleteRow,
  selectedRowIds,
  onToggleRowSelection,
  onClearSelection,
  onBulkEdit,
  onMaterializeCohort,
}) => {
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [editingDeliverableId, setEditingDeliverableId] = React.useState<string | null>(null);
  const hasSelection = selectedRowIds.length > 0;

  const handleEditDeliverable = (id: string) => {
    setEditingDeliverableId(id);
    // TODO: Open inline editor or modal for editing deliverable details
    console.log('Edit deliverable:', id);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Campaign Deliverables
              </h2>
              {hasSelection && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-200">
                    <span className="font-medium">{selectedRowIds.length} selected</span>
                    <button
                      onClick={onClearSelection}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {hasSelection && (
                <button
                  onClick={() => setIsBulkEditOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bulk Edit ({selectedRowIds.length})
                </button>
              )}
              
              <button
                onClick={onAddRow}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </button>
            </div>
          </div>
        </div>
        
        {/* Deal Canvas */}
        <div className="p-6">
          {deliverables.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliverables yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start building your campaign by adding your first deliverable. You can create cohorts, select specific creators, or use archetypes.
              </p>
              <button
                onClick={onAddRow}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Deliverable
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="animate-fade-in">
                  <DeliverableCard
                    deliverable={deliverable}
                    onEdit={handleEditDeliverable}
                    onAddPaid={onAddChild}
                    onMaterialize={onMaterializeCohort}
                    onDelete={onDeleteRow}
                    isSelected={selectedRowIds.includes(deliverable.id)}
                    onToggleSelection={onToggleRowSelection}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <BulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        selectedCount={selectedRowIds.length}
        onApply={onBulkEdit}
      />
    </>
  );
};

export default React.memo(DealCanvas);