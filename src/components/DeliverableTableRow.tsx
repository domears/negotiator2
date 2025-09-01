import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, AlertTriangle, Instagram, Youtube, X, Users, Zap } from 'lucide-react';
import { DeliverableRow, Rights } from '../types/campaign';
import { InlineEditor } from './InlineEditor';
import { calculateRowCost, validateRights, formatCurrency } from '../utils/calculations';
import { platformDeliverables, cohortTypes, mockCreators } from '../utils/mockData';

interface DeliverableTableRowProps {
  row: DeliverableRow;
  onUpdate: (id: string, updates: Partial<DeliverableRow>) => void;
  onToggleExpanded: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDeleteRow: (id: string) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onMaterializeCohort: (cohortId: string) => void;
  level?: number;
}

const DeliverableTableRow: React.FC<DeliverableTableRowProps> = ({
  row,
  onUpdate,
  onToggleExpanded,
  onAddChild,
  onDeleteRow,
  isSelected,
  onToggleSelection,
  onMaterializeCohort,
  level = 0,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const errors = validateRights(row);
  const hasErrors = errors.length > 0;
  const rowCost = calculateRowCost(row);
  const isParent = row.type === 'organic';
  const canMaterialize = row.creatorType === 'cohort' && !row.isMaterialized;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded" />;
    }
  };

  const handleFieldEdit = (field: string, value: string | number) => {
    if (field === 'quantity') {
      onUpdate(row.id, { quantity: Number(value) });
    } else if (field === 'unitFee') {
      onUpdate(row.id, { unitFee: Number(value), priceOverridden: true });
    } else if (field === 'cohortSize') {
      onUpdate(row.id, { cohortSize: Number(value) });
    } else if (field === 'deliverableType') {
      onUpdate(row.id, { deliverableType: value as string });
    } else if (field === 'creatorInfo') {
      // Determine if this is a specific creator or cohort
      const isSpecificCreator = mockCreators.find(c => c.name === value);
      if (isSpecificCreator) {
        onUpdate(row.id, { 
          creatorInfo: isSpecificCreator,
          creatorType: 'specific',
          cohortSize: undefined,
          unitFee: isSpecificCreator.baseRate,
          baseRate: isSpecificCreator.baseRate,
        });
      } else {
        onUpdate(row.id, { 
          creatorInfo: value as string,
          creatorType: 'cohort',
        });
      }
    } else if (field === 'platform') {
      onUpdate(row.id, { 
        platform: value as DeliverableRow['platform'],
        deliverableType: platformDeliverables[value as keyof typeof platformDeliverables][0]
      });
    } else if (field === 'rightsUsage') {
      onUpdate(row.id, { 
        rights: { ...row.rights, usage: value as Rights['usage'] }
      });
    } else if (field === 'rightsDuration') {
      onUpdate(row.id, { 
        rights: { ...row.rights, duration: Number(value) }
      });
    }
    setEditingField(null);
  };

  const memoizedRow = (
    <>
      <tr className={`h-12 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 transform ${
        hasErrors ? 'bg-red-50' : ''
      } ${level > 0 ? 'bg-blue-50' : ''} ${
        isSelected ? 'bg-primary-50 border-primary-200' : ''
      } ${row.needsApproval ? 'bg-yellow-50' : ''}`} 
        style={{ 
          height: '48px',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
        
        {/* Selection Checkbox */}
        <td className="px-6 py-4 whitespace-nowrap w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(row.id)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0">
          <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 24}px` }}>
            {isParent && (
              <button
                onClick={() => onToggleExpanded(row.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
              >
                {row.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
            
            {!isParent && <div className="w-6" />}
            
            <div className="flex items-center space-x-2">
              {getPlatformIcon(row.platform)}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                row.type === 'organic' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {row.type}
              </span>
              {row.isMaterialized && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  materialized
                </span>
              )}
              {row.needsApproval && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  approval needed
                </span>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0">
          {editingField === 'platform' ? (
            <InlineEditor
              value={row.platform}
              type="select"
              options={[
                { value: 'instagram', label: 'Instagram' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'twitter', label: 'Twitter' },
              ]}
              onSave={(value) => handleFieldEdit('platform', value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              onClick={() => setEditingField('platform')}
              className="text-left hover:text-primary-600 transition-colors duration-200"
            >
              {row.platform.charAt(0).toUpperCase() + row.platform.slice(1)}
            </button>
          )}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0">
          {editingField === 'deliverableType' ? (
            <InlineEditor
              value={row.deliverableType}
              type="select"
              options={platformDeliverables[row.platform].map(type => ({
                value: type,
                label: type
              }))}
              onSave={(value) => handleFieldEdit('deliverableType', value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              onClick={() => setEditingField('deliverableType')}
              className="text-left hover:text-primary-600 transition-colors duration-200"
            >
              {row.deliverableType}
            </button>
          )}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0">
          {editingField === 'creatorInfo' ? (
            <InlineEditor
              value={row.creatorInfo.toString()}
              type="select"
              options={[
                ...cohortTypes.map(cohort => ({
                  value: cohort.name,
                  label: cohort.name
                })),
                ...mockCreators.map(creator => ({
                  value: creator.name,
                  label: `${creator.name} (${creator.tier})`
                })),
              ]}
              onSave={(value) => handleFieldEdit('creatorInfo', value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              onClick={() => setEditingField('creatorInfo')}
              className="text-left hover:text-primary-600 transition-colors duration-200 text-sm flex items-center space-x-2"
            >
              <span>{row.creatorInfo.toString()}</span>
              {row.creatorType === 'specific' && (
                <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                  specific
                </span>
              )}
              {row.creatorType === 'archetype' && (
                <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                  archetype
                </span>
              )}
            </button>
          )}
        </td>
        
        {/* Cohort Size */}
        <td className="px-6 py-4 whitespace-nowrap min-w-0 tabular-nums">
          {row.creatorType === 'cohort' ? (
            editingField === 'cohortSize' ? (
              <InlineEditor
                value={row.cohortSize || 1}
                type="number"
                onSave={(value) => handleFieldEdit('cohortSize', value)}
                onCancel={() => setEditingField(null)}
              />
            ) : (
              <button
                onClick={() => setEditingField('cohortSize')}
                className="text-left hover:text-primary-600 transition-colors duration-200 font-medium flex items-center space-x-1"
              >
                <Users className="h-3 w-3 text-gray-400" />
                <span>{row.cohortSize || 1}</span>
              </button>
            )
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0 tabular-nums">
          {editingField === 'quantity' ? (
            <InlineEditor
              value={row.quantity}
              type="number"
              onSave={(value) => handleFieldEdit('quantity', value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              onClick={() => setEditingField('quantity')}
              className="text-left hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              {row.quantity}
            </button>
          )}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0 tabular-nums">
          {editingField === 'unitFee' ? (
            <InlineEditor
              value={row.unitFee}
              type="number"
              onSave={(value) => handleFieldEdit('unitFee', value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              onClick={() => setEditingField('unitFee')}
              className="text-left hover:text-primary-600 transition-colors duration-200"
            >
              {formatCurrency(row.unitFee)}
            </button>
          )}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap min-w-0">
          <div className="flex items-center space-x-2">
            {editingField === 'rightsUsage' ? (
              <InlineEditor
                value={row.rights.usage}
                type="select"
                options={[
                  { value: 'organic', label: 'Organic' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'both', label: 'Both' },
                ]}
                onSave={(value) => handleFieldEdit('rightsUsage', value)}
                onCancel={() => setEditingField(null)}
              />
            ) : (
              <button
                onClick={() => setEditingField('rightsUsage')}
                className="text-left hover:text-primary-600 transition-colors duration-200"
              >
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  row.rights.usage === 'organic' 
                    ? 'bg-green-100 text-green-800'
                    : row.rights.usage === 'paid'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {row.rights.usage}
                </span>
              </button>
            )}
            
            {editingField === 'rightsDuration' ? (
              <InlineEditor
                value={row.rights.duration}
                type="number"
                onSave={(value) => handleFieldEdit('rightsDuration', value)}
                onCancel={() => setEditingField(null)}
              />
            ) : (
              <button
                onClick={() => setEditingField('rightsDuration')}
                className="text-xs text-gray-500 hover:text-primary-600 transition-colors duration-200"
              >
                {row.rights.duration}mo
              </button>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-right font-medium min-w-0 tabular-nums">
          <div className="flex items-center justify-end space-x-2">
            {hasErrors && (
              <AlertTriangle className="h-4 w-4 text-red-500" title={errors.join(', ')} />
            )}
            <span className={hasErrors ? 'text-red-600' : 'text-gray-900'}>
              {formatCurrency(rowCost)}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-right min-w-0">
          <div className="flex items-center justify-end space-x-2">
            {canMaterialize && (
              <button
                onClick={() => onMaterializeCohort(row.id)}
                className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200"
                title="Materialize cohort into specific creators"
              >
                <Zap className="h-4 w-4" />
              </button>
            )}
            
            {isParent && (
              <button
                onClick={() => onAddChild(row.id)}
                className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors duration-200"
                title="Add paid amplification"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => onDeleteRow(row.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
              title="Delete row"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      
      {row.isExpanded && row.children && row.children.map((child) => (
        <DeliverableTableRow
          key={child.id}
          row={child}
          onUpdate={onUpdate}
          onToggleExpanded={onToggleExpanded}
          onAddChild={onAddChild}
          onDeleteRow={onDeleteRow}
          isSelected={selectedRowIds?.includes(child.id) || false}
          onToggleSelection={onToggleSelection}
          onMaterializeCohort={onMaterializeCohort}
          level={level + 1}
        />
      ))}
    </>
  );

  return memoizedRow;
};

export default React.memo(DeliverableTableRow);