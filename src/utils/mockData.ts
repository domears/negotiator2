import { DeliverableRow, Creator, DeliverableBundle } from '../types/campaign';

export const mockCreators: Creator[] = [
  {
    id: '1',
    name: '@fashionista_jane',
    tier: 'macro',
    followers: 250000,
    engagementRate: 4.2,
    baseRate: 2500,
  },
  {
    id: '2',
    name: '@fitness_guru_mike',
    tier: 'mid',
    followers: 75000,
    engagementRate: 6.1,
    baseRate: 1200,
  },
  {
    id: '3',
    name: '@beauty_blogger_sarah',
    tier: 'micro',
    followers: 25000,
    engagementRate: 8.3,
    baseRate: 500,
  },
  {
    id: '4',
    name: '@lifestyle_emma',
    tier: 'nano',
    followers: 5000,
    engagementRate: 12.5,
    baseRate: 150,
    isArchetype: true,
  },
  {
    id: '5',
    name: '@tech_reviewer_alex',
    tier: 'macro',
    followers: 500000,
    engagementRate: 3.8,
    baseRate: 4000,
  },
];

export const platformDeliverables = {
  instagram: ['Post', 'Story', 'Reel', 'IGTV', 'Carousel'],
  tiktok: ['Video', 'Live Stream', 'Spark Ad'],
  youtube: ['Video', 'Short', 'Community Post', 'Live Stream'],
  twitter: ['Tweet', 'Thread', 'Space', 'Video'],
};

export const cohortTypes = [
  { 
    id: 'nano', 
    name: 'Nano Influencers (1K-10K)', 
    baseRate: 100,
    subTiers: [
      { id: 'nano-1', name: 'Nano Tier 1 (1K-2.5K)', baseRate: 75 },
      { id: 'nano-2', name: 'Nano Tier 2 (2.5K-5K)', baseRate: 100 },
      { id: 'nano-3', name: 'Nano Tier 3 (5K-10K)', baseRate: 150 },
    ]
  },
  { 
    id: 'micro', 
    name: 'Micro Influencers (10K-100K)', 
    baseRate: 500,
    subTiers: [
      { id: 'micro-1', name: 'Micro Tier 1 (10K-25K)', baseRate: 350 },
      { id: 'micro-2', name: 'Micro Tier 2 (25K-50K)', baseRate: 500 },
      { id: 'micro-3', name: 'Micro Tier 3 (50K-100K)', baseRate: 750 },
    ]
  },
  { 
    id: 'mid', 
    name: 'Mid-Tier Influencers (100K-1M)', 
    baseRate: 1500,
    subTiers: [
      { id: 'mid-1', name: 'Mid Tier 1 (100K-250K)', baseRate: 1200 },
      { id: 'mid-2', name: 'Mid Tier 2 (250K-500K)', baseRate: 1500 },
      { id: 'mid-3', name: 'Mid Tier 3 (500K-1M)', baseRate: 2000 },
    ]
  },
  { 
    id: 'macro', 
    name: 'Macro Influencers (1M+)', 
    baseRate: 5000,
    subTiers: [
      { id: 'macro-1', name: 'Macro Tier 1 (1M-2.5M)', baseRate: 4000 },
      { id: 'macro-2', name: 'Macro Tier 2 (2.5M-5M)', baseRate: 6000 },
      { id: 'macro-3', name: 'Macro Tier 3 (5M+)', baseRate: 10000 },
    ]
  },
];

export const deliverableBundles: DeliverableBundle[] = [
  {
    id: 'ig-standard',
    name: 'Instagram Standard',
    platform: 'instagram',
    deliverables: [
      { type: 'Post', quantity: 1, multiplier: 1.0 },
      { type: 'Story', quantity: 2, multiplier: 0.5 },
    ],
    description: '1 Post + 2 Stories',
  },
  {
    id: 'ig-premium',
    name: 'Instagram Premium',
    platform: 'instagram',
    deliverables: [
      { type: 'Reel', quantity: 1, multiplier: 1.5 },
      { type: 'Post', quantity: 1, multiplier: 1.0 },
      { type: 'Story', quantity: 3, multiplier: 0.5 },
    ],
    description: '1 Reel + 1 Post + 3 Stories',
  },
  {
    id: 'tiktok-viral',
    name: 'TikTok Viral Package',
    platform: 'tiktok',
    deliverables: [
      { type: 'Video', quantity: 2, multiplier: 1.0 },
      { type: 'Live Stream', quantity: 1, multiplier: 0.8 },
    ],
    description: '2 Videos + 1 Live Stream',
  },
];

export const createMockDeliverable = (overrides: Partial<DeliverableRow> = {}): DeliverableRow => ({
  id: Math.random().toString(36).substr(2, 9),
  type: 'organic',
  platform: 'instagram',
  deliverableType: 'Post',
  creatorType: 'cohort',
  creatorInfo: 'Micro Influencers (10K-100K)',
  cohortSize: 5,
  quantity: 1,
  unitFee: 500,
  baseRate: 500,
  rights: {
    usage: 'organic',
    duration: 6,
    territory: 'domestic',
    exclusivity: false,
    competitorCount: 0,
    multiplier: 1.0,
  },
  estimatedViews: 25000,
  estimatedEngagements: 2000,
  children: [],
  bulkSelected: false,
  needsApproval: false,
  ...overrides,
});

export const sampleDeliverables: DeliverableRow[] = [
  {
    ...createMockDeliverable({
      platform: 'instagram',
      deliverableType: 'Post',
      creatorInfo: 'Micro Influencers (10K-100K)',
      cohortSize: 5,
      quantity: 1,
      unitFee: 500,
      estimatedViews: 25000,
      estimatedEngagements: 2000,
    }),
    children: [
      createMockDeliverable({
        type: 'paid',
        parentId: 'parent1',
        platform: 'instagram',
        deliverableType: 'Boosted Post',
        creatorInfo: 'Micro Influencers (10K-100K)',
        cohortSize: 5,
        quantity: 1,
        unitFee: 200,
        rights: {
          usage: 'paid',
          duration: 3,
          territory: 'domestic',
          exclusivity: false,
          competitorCount: 0,
          multiplier: 1.5,
        },
        estimatedViews: 50000,
        estimatedEngagements: 3000,
      }),
    ],
  },
  createMockDeliverable({
    platform: 'tiktok',
    deliverableType: 'Video',
    creatorType: 'specific',
    creatorInfo: mockCreators[0], // @fashionista_jane
    cohortSize: undefined,
    quantity: 2,
    unitFee: 2500,
    estimatedViews: 500000,
    estimatedEngagements: 45000,
    rights: {
      usage: 'both',
      duration: 12,
      territory: 'global',
      exclusivity: true,
      competitorCount: 2,
      multiplier: 2.5,
    },
  }),
  createMockDeliverable({
    platform: 'youtube',
    deliverableType: 'Video',
    creatorType: 'archetype',
    creatorInfo: 'Tech Reviewers (Similar to @tech_reviewer_alex)',
    cohortSize: 3,
    quantity: 1,
    unitFee: 3000,
    estimatedViews: 200000,
    estimatedEngagements: 15000,
    rights: {
      usage: 'organic',
      duration: 6,
      territory: 'domestic',
      exclusivity: false,
      competitorCount: 0,
      multiplier: 1.0,
    },
  }),
];