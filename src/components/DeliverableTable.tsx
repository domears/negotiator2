import React from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { DeliverableRow } from '../types/campaign';
import { DeliverableTableRow } from './DeliverableTableRow';
import { BulkEditModal } from './BulkEditModal';

interface DeliverableTableProps {
  deliverables: DeliverableRow[];
  onUpdate: (id: string, updates: Partial<DeliverableRow>) => void;
  onToggleExpanded: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  selectedRowIds: string[];
  onToggleRowSelection: (id: string) => void;
  onClearSelection: () => void;
  onBulkEdit: (updates: any) => void;
  onMaterializeCohort: (cohortId: string) => void;
}

export const DeliverableTable: React.FC<DeliverableTableProps> = ({
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
  const hasSelection = selectedRowIds.length > 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaign Deliverables
            </h2>
            {hasSelection && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{selectedRowIds.length} selected</span>
                <button
                  onClick={onClearSelection}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasSelection && (
              <button
                onClick={() => setIsBulkEditOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Bulk Edit
              </button>
            )}
            
            <button
              onClick={onAddRow}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={hasSelection && selectedRowIds.length === deliverables.length}
                  onChange={() => {
                    if (hasSelection) {
                      onClearSelection();
                    } else {
                      deliverables.forEach(row => onToggleRowSelection(row.id));
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  selectedRowIds={selectedRowIds}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deliverable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creator/Cohort
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rights
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliverables.map((row) => (
              <DeliverableTableRow
                key={row.id}
                row={row}
                onUpdate={onUpdate}
                onToggleExpanded={onToggleExpanded}
                onAddChild={onAddChild}
                onDeleteRow={onDeleteRow}
                isSelected={selectedRowIds.includes(row.id)}
                onToggleSelection={onToggleRowSelection}
                onMaterializeCohort={onMaterializeCohort}
              />
            ))}
            
            {deliverables.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No deliverables added yet</p>
                    <button
                      onClick={onAddRow}
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                    >
                      Add your first deliverable
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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