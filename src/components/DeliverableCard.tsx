import React from 'react';
import { Edit3, Plus, Zap, Eye, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { DeliverableRow, Creator } from '../types/campaign';
import { calculateRowCost, formatCurrency, formatNumber, formatRightsSummary } from '../utils/calculations';

interface DeliverableCardProps {
  deliverable: DeliverableRow;
  onEdit: (id: string) => void;
  onAddPaid: (parentId: string) => void;
  onMaterialize: (cohortId: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({
  deliverable,
  onEdit,
  onAddPaid,
  onMaterialize,
  onDelete,
  isSelected,
  onToggleSelection,
}) => {
  const cost = calculateRowCost(deliverable);
  const canMaterialize = deliverable.creatorType === 'cohort' && !deliverable.isMaterialized;
  const canAddPaid = deliverable.type === 'organic';
  const hasChildren = deliverable.children && deliverable.children.length > 0;

  const getCreatorTypeStyle = (type: string) => {
    switch (type) {
      case 'cohort':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'specific':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'archetype':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCreatorDisplayName = () => {
    if (typeof deliverable.creatorInfo === 'string') {
      return deliverable.creatorInfo;
    }
    const creator = deliverable.creatorInfo as Creator;
    return creator.name;
  };

  const getDeliverableTitle = () => {
    if (deliverable.creatorType === 'cohort') {
      const cohortSize = deliverable.cohortSize || 1;
      const quantity = deliverable.quantity;
      const total = cohortSize * quantity;
      return `${total} ${deliverable.deliverableType}${total > 1 ? 's' : ''}`;
    } else {
      const quantity = deliverable.quantity;
      return `${quantity} ${deliverable.deliverableType}${quantity > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
      isSelected 
        ? 'border-primary-300 shadow-md bg-primary-50' 
        : 'border-gray-200 hover:border-gray-300'
    } ${deliverable.needsApproval ? 'border-yellow-300 bg-yellow-50' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(deliverable.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
              getCreatorTypeStyle(deliverable.creatorType)
            }`}>
              {deliverable.creatorType === 'cohort' ? 'Generic' : 
               deliverable.creatorType === 'specific' ? 'Specific' : 'Archetype'}
            </span>
            {deliverable.needsApproval && (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          
          <button
            onClick={() => onEdit(deliverable.id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {getDeliverableTitle()}
          </h3>
          <p className="text-xs text-gray-600">
            {getCreatorDisplayName()} • {deliverable.platform.charAt(0).toUpperCase() + deliverable.platform.slice(1)}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Est. Fee</p>
            <p className="font-bold text-gray-900">{formatCurrency(cost)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Rights</p>
            <p className="text-xs font-medium text-gray-900 leading-tight">
              {deliverable.rights.usage.charAt(0).toUpperCase() + deliverable.rights.usage.slice(1)} {deliverable.rights.duration}mo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <Eye className="h-3 w-3 text-blue-600" />
              <p className="text-xs text-blue-600">Reach</p>
            </div>
            <p className="font-bold text-blue-900">{formatNumber(deliverable.estimatedViews)}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">Engagements</p>
            </div>
            <p className="font-bold text-green-900">{formatNumber(deliverable.estimatedEngagements)}</p>
          </div>
        </div>

        {deliverable.creatorType === 'cohort' && deliverable.cohortSize && (
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <Users className="h-3 w-3 text-purple-600" />
              <p className="text-xs text-purple-600">Cohort Size</p>
            </div>
            <p className="font-bold text-purple-900">{deliverable.cohortSize} creators</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            {canMaterialize && (
              <button
                onClick={() => onMaterialize(deliverable.id)}
                className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200"
              >
                <Zap className="h-3 w-3 mr-1 inline" />
                Materialize
              </button>
            )}
            
            {canAddPaid && (
              <button
                onClick={() => onAddPaid(deliverable.id)}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-3 w-3 mr-1 inline" />
                Add Paid
              </button>
            )}
          </div>
          
          <button
            onClick={() => onDelete(deliverable.id)}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Child Deliverables (Paid Add-ons) */}
      {hasChildren && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-4">
            <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">
              Paid Add-ons
            </h4>
            <div className="space-y-2">
              {deliverable.children?.map((child) => (
                <div key={child.id} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{child.deliverableType}</p>
                      <p className="text-xs text-gray-600">{formatRightsSummary(child.rights)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(calculateRowCost(child))}</p>
                      <p className="text-xs text-gray-600">{formatNumber(child.estimatedViews)} views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};