import { DeliverableRow, CalculationMetrics, AdminConfiguration, Rights } from '../types/campaign';

// Mock admin configuration - in production this would come from API
const adminConfig: AdminConfiguration = {
  exclusivityMultipliers: {
    1: { 0: 1.0, 1: 1.2, 2: 1.4, 3: 1.6 },
    3: { 0: 1.1, 1: 1.3, 2: 1.5, 3: 1.8 },
    6: { 0: 1.2, 1: 1.5, 2: 1.8, 3: 2.2 },
    12: { 0: 1.5, 1: 2.0, 2: 2.5, 3: 3.0 },
  },
  baseRates: {
    nano: {
      instagram: { Post: 100, Story: 50, Reel: 150 },
      tiktok: { Video: 120, 'Live Stream': 80 },
      youtube: { Video: 200, Short: 100 },
      twitter: { Tweet: 75, Thread: 100 },
    },
    micro: {
      instagram: { Post: 500, Story: 250, Reel: 750 },
      tiktok: { Video: 600, 'Live Stream': 400 },
      youtube: { Video: 1000, Short: 500 },
      twitter: { Tweet: 300, Thread: 450 },
    },
    mid: {
      instagram: { Post: 1500, Story: 750, Reel: 2250 },
      tiktok: { Video: 1800, 'Live Stream': 1200 },
      youtube: { Video: 3000, Short: 1500 },
      twitter: { Tweet: 900, Thread: 1350 },
    },
    macro: {
      instagram: { Post: 5000, Story: 2500, Reel: 7500 },
      tiktok: { Video: 6000, 'Live Stream': 4000 },
      youtube: { Video: 10000, Short: 5000 },
      twitter: { Tweet: 3000, Thread: 4500 },
    },
  },
  deliverableMultipliers: {
    instagram: { Post: 1.0, Story: 0.5, Reel: 1.5, Carousel: 1.2 },
    tiktok: { Video: 1.0, 'Live Stream': 0.8, 'Spark Ad': 1.3 },
    youtube: { Video: 1.0, Short: 0.6, 'Community Post': 0.3 },
    twitter: { Tweet: 1.0, Thread: 1.5, Space: 1.2 },
  },
  usageMultipliers: {
    organic: 1.0,
    paid: 1.5,
    both: 2.0,
  },
  approvalThresholds: {
    exclusivityDuration: 90, // days
    competitorCount: 3,
    priceOverridePercentage: 25,
  },
};

export const getAdminConfig = (): AdminConfiguration => adminConfig;

export const calculateRightsMultiplier = (rights: Rights): number => {
  if (rights.overridden) {
    return rights.multiplier;
  }

  const usageMultiplier = adminConfig.usageMultipliers[rights.usage];
  
  let exclusivityMultiplier = 1.0;
  if (rights.exclusivity) {
    const durationMultipliers = adminConfig.exclusivityMultipliers[rights.duration];
    if (durationMultipliers) {
      const competitorCount = rights.competitorCount || 0;
      exclusivityMultiplier = durationMultipliers[competitorCount] || durationMultipliers[3];
    }
  }

  const territoryMultiplier = rights.territory === 'global' ? 1.3 : 1.0;
  
  return usageMultiplier * exclusivityMultiplier * territoryMultiplier;
};

export const calculateRowCost = (row: DeliverableRow): number => {
  // Get base rate from admin config or use override
  let baseRate = row.unitFee;
  
  if (!row.priceOverridden && typeof row.creatorInfo === 'string') {
    // Extract tier from cohort string
    const tierMatch = row.creatorInfo.toLowerCase();
    let tier = 'micro'; // default
    
    if (tierMatch.includes('nano')) tier = 'nano';
    else if (tierMatch.includes('micro')) tier = 'micro';
    else if (tierMatch.includes('mid')) tier = 'mid';
    else if (tierMatch.includes('macro')) tier = 'macro';
    
    const configRate = adminConfig.baseRates[tier]?.[row.platform]?.[row.deliverableType];
    if (configRate) {
      baseRate = configRate;
    }
  }

  // Apply deliverable multiplier
  const deliverableMultiplier = adminConfig.deliverableMultipliers[row.platform]?.[row.deliverableType] || 1.0;
  
  // Calculate rights multiplier
  const rightsMultiplier = calculateRightsMultiplier(row.rights);
  
  // Apply cohort size for cohort types
  const effectiveQuantity = row.creatorType === 'cohort' && row.cohortSize 
    ? row.cohortSize * row.quantity 
    : row.quantity;

  const finalCost = baseRate * deliverableMultiplier * rightsMultiplier * effectiveQuantity;
  
  return Math.round(finalCost);
};

export const calculateRowViews = (row: DeliverableRow): number => {
  const effectiveQuantity = row.creatorType === 'cohort' && row.cohortSize 
    ? row.cohortSize * row.quantity 
    : row.quantity;
  return effectiveQuantity * row.estimatedViews;
};

export const calculateRowEngagements = (row: DeliverableRow): number => {
  const effectiveQuantity = row.creatorType === 'cohort' && row.cohortSize 
    ? row.cohortSize * row.quantity 
    : row.quantity;
  return effectiveQuantity * row.estimatedEngagements;
};

export const calculateInfluencerCount = (row: DeliverableRow): number => {
  if (row.creatorType === 'cohort' && row.cohortSize) {
    return row.cohortSize;
  }
  if (row.creatorType === 'specific') {
    return 1;
  }
  return row.quantity; // For archetypes, assume quantity = number of influencers
};

export const calculateContentPieces = (row: DeliverableRow): number => {
  const influencerCount = calculateInfluencerCount(row);
  return influencerCount * row.quantity;
};

export const calculateScenarioMetrics = (deliverables: DeliverableRow[]): CalculationMetrics => {
  const flattenedRows = flattenDeliverables(deliverables);
  
  const totalCost = flattenedRows.reduce((sum, row) => sum + calculateRowCost(row), 0);
  const totalViews = flattenedRows.reduce((sum, row) => sum + calculateRowViews(row), 0);
  const totalEngagements = flattenedRows.reduce((sum, row) => sum + calculateRowEngagements(row), 0);
  
  const organicRows = flattenedRows.filter(row => row.type === 'organic');
  const paidRows = flattenedRows.filter(row => row.type === 'paid');
  
  const organicCost = organicRows.reduce((sum, row) => sum + calculateRowCost(row), 0);
  const paidCost = paidRows.reduce((sum, row) => sum + calculateRowCost(row), 0);
  
  const totalInfluencers = deliverables.reduce((sum, row) => sum + calculateInfluencerCount(row), 0);
  const totalContentPieces = flattenedRows.reduce((sum, row) => sum + calculateContentPieces(row), 0);
  
  const cpm = totalViews > 0 ? (totalCost / totalViews) * 1000 : 0;
  const cpv = totalViews > 0 ? totalCost / totalViews : 0;
  const cpe = totalEngagements > 0 ? totalCost / totalEngagements : 0;
  
  // Campaign score based on CPE efficiency (lower CPE = higher score)
  const campaignScore = cpe > 0 ? Math.min(Math.round(100 / cpe), 100) : 0;
  
  return {
    totalCost,
    totalViews,
    totalEngagements,
    cpm,
    cpv,
    cpe,
    organicCost,
    paidCost,
    totalInfluencers,
    totalContentPieces,
    campaignScore,
  };
};

export const flattenDeliverables = (deliverables: DeliverableRow[]): DeliverableRow[] => {
  const flattened: DeliverableRow[] = [];
  
  deliverables.forEach(deliverable => {
    flattened.push(deliverable);
    if (deliverable.children && deliverable.children.length > 0) {
      flattened.push(...deliverable.children);
    }
  });
  
  return flattened;
};

export const validateRights = (row: DeliverableRow): string[] => {
  const errors: string[] = [];
  
  if (row.type === 'paid' && row.rights.usage === 'organic') {
    errors.push('Paid amplification requires paid usage rights');
  }
  
  if (row.rights.duration < 1) {
    errors.push('Rights duration must be at least 1 month');
  }
  
  if (row.unitFee <= 0) {
    errors.push('Unit fee must be greater than 0');
  }
  
  if (row.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  // Check approval thresholds
  if (row.rights.exclusivity && row.rights.duration > adminConfig.approvalThresholds.exclusivityDuration / 30) {
    errors.push('Exclusivity duration requires approval');
  }

  if (row.rights.competitorCount && row.rights.competitorCount >= adminConfig.approvalThresholds.competitorCount) {
    errors.push('High competitor count requires approval');
  }

  if (row.priceOverridden && row.baseRate) {
    const overridePercentage = Math.abs((row.unitFee - row.baseRate) / row.baseRate) * 100;
    if (overridePercentage > adminConfig.approvalThresholds.priceOverridePercentage) {
      errors.push('Price override exceeds threshold and requires approval');
    }
  }
  
  return errors;
};

export const inheritRights = (parentRights: Rights, childRights?: Partial<Rights>): Rights => {
  return {
    ...parentRights,
    ...childRights,
    multiplier: childRights?.overridden 
      ? childRights.multiplier || parentRights.multiplier
      : calculateRightsMultiplier({ ...parentRights, ...childRights }),
  };
};

export const applyBulkEdit = (
  deliverables: DeliverableRow[],
  selectedIds: string[],
  updates: Partial<DeliverableRow>
): DeliverableRow[] => {
  return deliverables.map(deliverable => {
    if (selectedIds.includes(deliverable.id)) {
      const updatedDeliverable = { ...deliverable, ...updates };
      
      // Recalculate rights multiplier if rights changed
      if (updates.rights) {
        updatedDeliverable.rights = {
          ...updatedDeliverable.rights,
          multiplier: calculateRightsMultiplier(updatedDeliverable.rights),
        };
      }
      
      return updatedDeliverable;
    }
    
    // Apply to children if they're selected
    if (deliverable.children) {
      return {
        ...deliverable,
        children: applyBulkEdit(deliverable.children, selectedIds, updates),
      };
    }
    
    return deliverable;
  });
};

export const materializeCohort = (
  cohortRow: DeliverableRow,
  specificCreators: Creator[]
): DeliverableRow[] => {
  return specificCreators.map((creator, index) => ({
    ...cohortRow,
    id: `${cohortRow.id}_materialized_${index}`,
    creatorType: 'specific' as const,
    creatorInfo: { ...creator, parentCohortId: cohortRow.id },
    cohortSize: undefined,
    quantity: cohortRow.quantity, // Each creator gets the same deliverable quantity
    unitFee: creator.baseRate,
    baseRate: creator.baseRate,
    isMaterialized: true,
    estimatedViews: Math.round(creator.followers * 0.1), // 10% reach estimate
    estimatedEngagements: Math.round(creator.followers * creator.engagementRate / 100),
  }));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyAbbreviated = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

export const formatRightsSummary = (rights: Rights): string => {
  const usageText = rights.usage.charAt(0).toUpperCase() + rights.usage.slice(1);
  const durationText = `${rights.duration}mo`;
  const territoryText = rights.territory === 'global' ? 'Global' : 'Domestic';
  const exclusivityText = rights.exclusivity ? 'Exclusive' : 'Non-exclusive';
  
  return `${usageText} ${durationText} • ${territoryText} • ${exclusivityText}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};