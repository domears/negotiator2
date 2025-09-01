import React, { useState } from 'react';
import { X, Edit3, Users, Save } from 'lucide-react';
import { BulkEditOptions } from '../types/campaign';
import { platformDeliverables, cohortTypes } from '../utils/mockData';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onApply: (updates: BulkEditOptions) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onApply,
}) => {
  const [updates, setUpdates] = useState<BulkEditOptions>({});
  const [activeFields, setActiveFields] = useState<Set<string>>(new Set());

  const handleFieldToggle = (field: string) => {
    const newActiveFields = new Set(activeFields);
    if (newActiveFields.has(field)) {
      newActiveFields.delete(field);
      const newUpdates = { ...updates };
      delete newUpdates[field as keyof BulkEditOptions];
      setUpdates(newUpdates);
    } else {
      newActiveFields.add(field);
    }
    setActiveFields(newActiveFields);
  };

  const handleApply = () => {
    onApply(updates);
    onClose();
    setUpdates({});
    setActiveFields(new Set());
  };

  const handleCancel = () => {
    onClose();
    setUpdates({});
    setActiveFields(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Edit3 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bulk Edit</h2>
                <p className="text-sm text-gray-500">
                  Editing {selectedCount} selected deliverable{selectedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Platform & Deliverable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={activeFields.has('platform')}
                    onChange={() => handleFieldToggle('platform')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Platform</label>
                </div>
                <select
                  disabled={!activeFields.has('platform')}
                  value={updates.platform || ''}
                  onChange={(e) => setUpdates(prev => ({ ...prev, platform: e.target.value as any }))}
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={activeFields.has('deliverableType')}
                    onChange={() => handleFieldToggle('deliverableType')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Deliverable Type</label>
                </div>
                <select
                  disabled={!activeFields.has('deliverableType') || !updates.platform}
                  value={updates.deliverableType || ''}
                  onChange={(e) => setUpdates(prev => ({ ...prev, deliverableType: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select deliverable</option>
                  {updates.platform && platformDeliverables[updates.platform].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Unit Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={activeFields.has('quantity')}
                    onChange={() => handleFieldToggle('quantity')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                </div>
                <input
                  type="number"
                  disabled={!activeFields.has('quantity')}
                  value={updates.quantity || ''}
                  onChange={(e) => setUpdates(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  placeholder="Enter quantity"
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={activeFields.has('unitFee')}
                    onChange={() => handleFieldToggle('unitFee')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Unit Fee</label>
                </div>
                <input
                  type="number"
                  disabled={!activeFields.has('unitFee')}
                  value={updates.unitFee || ''}
                  onChange={(e) => setUpdates(prev => ({ ...prev, unitFee: parseFloat(e.target.value) }))}
                  placeholder="Enter unit fee"
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Rights Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Rights & Usage</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={activeFields.has('rights.usage')}
                      onChange={() => handleFieldToggle('rights.usage')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Usage Rights</label>
                  </div>
                  <select
                    disabled={!activeFields.has('rights.usage')}
                    value={updates.rights?.usage || ''}
                    onChange={(e) => setUpdates(prev => ({ 
                      ...prev, 
                      rights: { ...prev.rights, usage: e.target.value as any }
                    }))}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                  >
                    <option value="">Select usage</option>
                    <option value="organic">Organic</option>
                    <option value="paid">Paid</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={activeFields.has('rights.duration')}
                      onChange={() => handleFieldToggle('rights.duration')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Duration (months)</label>
                  </div>
                  <input
                    type="number"
                    disabled={!activeFields.has('rights.duration')}
                    value={updates.rights?.duration || ''}
                    onChange={(e) => setUpdates(prev => ({ 
                      ...prev, 
                      rights: { ...prev.rights, duration: parseInt(e.target.value) }
                    }))}
                    placeholder="Enter duration"
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={activeFields.has('rights.territory')}
                      onChange={() => handleFieldToggle('rights.territory')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Territory</label>
                  </div>
                  <select
                    disabled={!activeFields.has('rights.territory')}
                    value={updates.rights?.territory || ''}
                    onChange={(e) => setUpdates(prev => ({ 
                      ...prev, 
                      rights: { ...prev.rights, territory: e.target.value as any }
                    }))}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                  >
                    <option value="">Select territory</option>
                    <option value="domestic">Domestic</option>
                    <option value="global">Global</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={activeFields.has('rights.exclusivity')}
                      onChange={() => handleFieldToggle('rights.exclusivity')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Exclusivity</label>
                  </div>
                  <select
                    disabled={!activeFields.has('rights.exclusivity')}
                    value={updates.rights?.exclusivity?.toString() || ''}
                    onChange={(e) => setUpdates(prev => ({ 
                      ...prev, 
                      rights: { ...prev.rights, exclusivity: e.target.value === 'true' }
                    }))}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
                  >
                    <option value="">Select exclusivity</option>
                    <option value="false">Non-exclusive</option>
                    <option value="true">Exclusive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{selectedCount} deliverable{selectedCount !== 1 ? 's' : ''} selected</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button
                onClick={handleApply}
                disabled={activeFields.size === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};