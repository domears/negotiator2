export interface Creator {
  id: string;
  name: string;
  tier: 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  subTier?: string; // e.g., "Nano Tier 1: 1K-2.5K"
  followers: number;
  engagementRate: number;
  baseRate: number;
  isArchetype?: boolean;
  parentCohortId?: string; // For materialized creators
}

export interface Rights {
  usage: 'organic' | 'paid' | 'both';
  duration: number; // in months
  territory: 'domestic' | 'global';
  exclusivity: boolean;
  competitorCount?: number; // For exclusivity calculations
  multiplier: number;
  overridden?: boolean; // Track if manually overridden
}

export interface DeliverableBundle {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  deliverables: {
    type: string;
    quantity: number;
    multiplier: number;
  }[];
  description?: string;
}

export interface AdminConfiguration {
  exclusivityMultipliers: {
    [duration: number]: {
      [competitorCount: number]: number;
    };
  };
  baseRates: {
    [tier: string]: {
      [platform: string]: {
        [deliverableType: string]: number;
      };
    };
  };
  deliverableMultipliers: {
    [platform: string]: {
      [deliverableType: string]: number;
    };
  };
  usageMultipliers: {
    organic: number;
    paid: number;
    both: number;
  };
  approvalThresholds: {
    exclusivityDuration: number; // days
    competitorCount: number;
    priceOverridePercentage: number;
  };
}

export interface DeliverableRow {
  id: string;
  type: 'organic' | 'paid';
  parentId?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  deliverableType: string;
  creatorType: 'cohort' | 'specific' | 'archetype';
  creatorInfo: string | Creator;
  cohortSize?: number; // For cohort types
  quantity: number;
  unitFee: number;
  baseRate?: number; // Original rate before overrides
  priceOverridden?: boolean; // Track manual price changes
  rights: Rights;
  isExpanded?: boolean;
  children?: DeliverableRow[];
  estimatedViews: number;
  estimatedEngagements: number;
  isMaterialized?: boolean; // For converted generic cohorts
  bulkSelected?: boolean; // For bulk editing
  needsApproval?: boolean; // Based on admin thresholds
}

export interface CampaignScenario {
  id: string;
  name: string;
  deliverables: DeliverableRow[];
  planningMode: PlanningMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalculationMetrics {
  totalCost: number;
  totalViews: number;
  totalEngagements: number;
  cpm: number;
  cpv: number;
  cpe: number;
  organicCost: number;
  paidCost: number;
  totalInfluencers: number;
  totalContentPieces: number;
  campaignScore: number;
}

export type PlanningMode = 'generic' | 'specific' | 'blended';

export interface Campaign {
  id: string;
  name: string;
  client: string;
  brand: string;
  markets: string[];
  currency: string;
  fxLockDate?: Date;
  primaryObjective: string;
  primaryKpis: string[];
  secondaryKpis?: string[];
  tertiaryKpis?: string[];
  guardrails?: {
    minImpressions?: number;
    maxCpm?: number;
    cpaFloor?: number;
  };
  startDate: Date;
  endDate: Date;
  duration?: number; // Auto-calculated in days
  flightingNotes?: string;
  budgetType: 'campaign' | 'scenario';
  budgetAmount: number;
  industryTags?: string[];
  audienceTargeting?: string;
  legalRightsPreset?: 'organic' | 'paid' | 'both';
  contentThemes?: string[];
  benchmarkOverrides?: Record<string, number>;
  approvalTriggers?: string[];
  auditNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  campaignId: string;
  label: string;
  version: string;
  assumptionsJson: Record<string, any>;
  status: 'draft' | 'final' | 'archived';
  deliverables: DeliverableRow[];
  planningMode: PlanningMode;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkEditOptions {
  deliverableType?: string;
  platform?: string;
  rights?: Partial<Rights>;
  quantity?: number;
  unitFee?: number;
}