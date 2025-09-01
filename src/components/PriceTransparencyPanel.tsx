import React from 'react';
import { Info, Calculator } from 'lucide-react';
import { DeliverableRow } from '../types/campaign';
import { formatCurrency } from '../utils/calculations';

interface PriceTransparencyPanelProps {
  selectedRow: DeliverableRow | null;
}

export const PriceTransparencyPanel: React.FC<PriceTransparencyPanelProps> = ({
  selectedRow,
}) => {
  if (!selectedRow) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calculator className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
        </div>
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select a deliverable to see price breakdown</p>
        </div>
      </div>
    );
  }

  const baseCost = selectedRow.quantity * selectedRow.unitFee;
  const rightsMultiplier = selectedRow.rights.multiplier;
  const totalCost = baseCost * rightsMultiplier;
  const rightsUpcharge = totalCost - baseCost;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            {selectedRow.platform.charAt(0).toUpperCase() + selectedRow.platform.slice(1)} {selectedRow.deliverableType}
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Rate:</span>
              <span className="font-medium">{formatCurrency(selectedRow.unitFee)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{selectedRow.quantity}</span>
            </div>
            
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(baseCost)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Rights & Modifiers</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Usage Rights:</span>
              <span className="font-medium text-blue-900">
                {selectedRow.rights.usage.charAt(0).toUpperCase() + selectedRow.rights.usage.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-blue-700">Duration:</span>
              <span className="font-medium text-blue-900">{selectedRow.rights.duration} months</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-blue-700">Territory:</span>
              <span className="font-medium text-blue-900">
                {selectedRow.rights.territory.charAt(0).toUpperCase() + selectedRow.rights.territory.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-blue-700">Exclusivity:</span>
              <span className="font-medium text-blue-900">
                {selectedRow.rights.exclusivity ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-700">Rights Multiplier:</span>
              <span className="font-medium text-blue-900">{rightsMultiplier}x</span>
            </div>
            
            {rightsUpcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-700">Rights Upcharge:</span>
                <span className="font-medium text-blue-900">{formatCurrency(rightsUpcharge)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border-t-4 border-green-400">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-green-900">Final Cost:</span>
            <span className="text-xl font-bold text-green-900">{formatCurrency(totalCost)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Formula:</strong> (Quantity × Unit Fee) × Rights Multiplier</p>
          <p><strong>Calculation:</strong> ({selectedRow.quantity} × {formatCurrency(selectedRow.unitFee)}) × {rightsMultiplier} = {formatCurrency(totalCost)}</p>
        </div>
      </div>
    </div>
  );
};