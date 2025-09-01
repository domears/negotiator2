import { useState, useCallback } from 'react';
import { DeliverableRow, PlanningMode, BulkEditOptions, Creator, Campaign } from '../types/campaign';
import { createMockDeliverable, sampleDeliverables, mockCreators } from '../utils/mockData';
import { inheritRights, applyBulkEdit, materializeCohort, calculateRightsMultiplier } from '../utils/calculations';

export const useMediaSummaryData = (
  initialDeliverables: DeliverableRow[],
  initialPlanningMode: PlanningMode,
  onDeliverablesChange: (deliverables: DeliverableRow[]) => void,
  onPlanningModeChange: (mode: PlanningMode) => void
) => {
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>(initialDeliverables);
  const [planningMode, setPlanningModeInternal] = useState<PlanningMode>(initialPlanningMode);
  
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Update internal state when props change
  React.useEffect(() => {
    setDeliverables(initialDeliverables);
  }, [initialDeliverables]);

  React.useEffect(() => {
    setPlanningModeInternal(initialPlanningMode);
  }, [initialPlanningMode]);

  // Notify parent of changes
  React.useEffect(() => {
    onDeliverablesChange(deliverables);
  }, [deliverables, onDeliverablesChange]);

  React.useEffect(() => {
    onPlanningModeChange(planningMode);
  }, [planningMode, onPlanningModeChange]);

  const setPlanningMode = useCallback((mode: PlanningMode) => {
    setPlanningModeInternal(mode);
  }, []);

  const updateDeliverable = useCallback((id: string, updates: Partial<DeliverableRow>) => {
    setDeliverables(prev => updateDeliverableInTree(prev, id, updates));
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setDeliverables(prev => updateDeliverableInTree(prev, id, { 
      isExpanded: !getDeliverableById(prev, id)?.isExpanded 
    }));
  }, []);

  const addDeliverable = useCallback(() => {
    const newDeliverable = createMockDeliverable();
    setDeliverables(prev => [...prev, newDeliverable]);
  }, []);

  const addChildDeliverable = useCallback((parentId: string) => {
    const parent = getDeliverableById(deliverables, parentId);
    if (!parent) return;

    const childDeliverable = createMockDeliverable({
      type: 'paid',
      parentId,
      platform: parent.platform,
      deliverableType: `Boosted ${parent.deliverableType}`,
      creatorInfo: parent.creatorInfo,
      creatorType: parent.creatorType,
      cohortSize: parent.cohortSize,
      unitFee: parent.unitFee * 0.4, // 40% of organic rate for paid amplification
      rights: inheritRights(parent.rights, {
        usage: 'paid',
        duration: 3,
        multiplier: 1.5,
      }),
      estimatedViews: parent.estimatedViews * 2,
      estimatedEngagements: parent.estimatedEngagements * 1.5,
    });

    setDeliverables(prev => updateDeliverableInTree(prev, parentId, {
      children: [...(parent.children || []), childDeliverable],
      isExpanded: true,
    }));
  }, [deliverables]);

  const deleteDeliverable = useCallback((id: string) => {
    setDeliverables(prev => removeDeliverableFromTree(prev, id));
    
    // Remove from selections if deleted
    setSelectedRowIds(prev => prev.filter(selectedId => selectedId !== id));
    if (selectedRowId === id) {
      setSelectedRowId(null);
    }
  }, [selectedRowId]);

  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRowIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRowIds([]);
  }, []);

  const bulkEditDeliverables = useCallback((updates: BulkEditOptions) => {
    if (selectedRowIds.length === 0) return;

    setDeliverables(prev => applyBulkEdit(prev, selectedRowIds, updates));
  }, [selectedRowIds]);

  const materializeGenericCohort = useCallback((cohortId: string) => {
    const cohort = getDeliverableById(deliverables, cohortId);
    if (!cohort || cohort.creatorType !== 'cohort') return;

    // Get random creators for materialization (in production, this would be API call)
    const cohortSize = cohort.cohortSize || 5;
    const availableCreators = mockCreators.filter(c => !c.isArchetype);
    const selectedCreators = availableCreators.slice(0, Math.min(cohortSize, availableCreators.length));
    
    const materializedRows = materializeCohort(cohort, selectedCreators);
    
    setDeliverables(prev => prev.map(row => 
      row.id === cohortId 
        ? { ...row, isMaterialized: true, children: [...(row.children || []), ...materializedRows] }
        : row
    }));
  }, [deliverables]);

  return {
    deliverables,
    planningMode,
    selectedRowIds,
    selectedRowId,
    setSelectedRowId,
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
  };
};

// Helper functions
function getDeliverableById(deliverables: DeliverableRow[], id: string): DeliverableRow | null {
  for (const deliverable of deliverables) {
    if (deliverable.id === id) return deliverable;
    if (deliverable.children) {
      const found = getDeliverableById(deliverable.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateDeliverableInTree(
  deliverables: DeliverableRow[], 
  id: string, 
  updates: Partial<DeliverableRow>
): DeliverableRow[] {
  return deliverables.map(deliverable => {
    if (deliverable.id === id) {
      const updatedRow = { ...deliverable, ...updates };
      
      // Recalculate rights multiplier if rights changed and not overridden
      if (updates.rights && !updates.rights.overridden) {
        updatedRow.rights = {
          ...updatedRow.rights,
          multiplier: calculateRightsMultiplier(updatedRow.rights),
        };
      }
      
      // Cascade changes to children if parent rights changed
      if (updates.rights && deliverable.children) {
        updatedRow.children = deliverable.children.map(child => ({
          ...child,
          rights: child.rights.overridden 
            ? child.rights 
            : inheritRights(updatedRow.rights, child.rights),
        }));
      }
      
      return updatedRow;
    }
    if (deliverable.children) {
      return {
        ...deliverable,
        children: updateDeliverableInTree(deliverable.children, id, updates),
      };
    }
    return deliverable;
  });
}

function removeDeliverableFromTree(deliverables: DeliverableRow[], id: string): DeliverableRow[] {
  return deliverables
    .filter(deliverable => deliverable.id !== id)
    .map(deliverable => ({
      ...deliverable,
      children: deliverable.children 
        ? removeDeliverableFromTree(deliverable.children, id)
        : [],
    }));
}