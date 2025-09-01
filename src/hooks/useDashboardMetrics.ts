import { useMemo } from 'react';
import { Campaign } from '../types/campaign';
import { calculateScenarioMetrics, formatCurrency, formatNumber } from '../utils/calculations';
import { useFormatters } from '../utils/formatters';

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  fullValue: string;
  icon: any;
  color: string;
  bgColor: string;
  available: boolean;
  tooltip: string;
  onClick?: () => void;
}

export interface DashboardMetrics {
  activeCampaigns: number;
  budgetCents: number;
  influencers: number;
  deliverables: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useDashboardMetrics = (campaigns: Campaign[]): DashboardMetrics => {
  const formatters = useFormatters();

  const metrics = useMemo(() => {
    const now = new Date();
    
    // Filter active campaigns (running between start and end dates)
    const activeCampaigns = campaigns.filter(campaign => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      return startDate <= now && endDate >= now;
    });

    // Calculate total budget from active campaigns (convert to cents for precision)
    const budgetCents = activeCampaigns.reduce((sum, campaign) => {
      return sum + (campaign.budgetAmount * 100); // Convert dollars to cents
    }, 0);

    // Calculate total influencers from active campaigns
    const influencers = activeCampaigns.reduce((sum, campaign) => {
      return sum + campaign.deliverables.reduce((deliverableSum, deliverable) => {
        if (deliverable.creatorType === 'cohort' && deliverable.cohortSize) {
          return deliverableSum + deliverable.cohortSize;
        } else if (deliverable.creatorType === 'specific') {
          return deliverableSum + 1;
        }
        return deliverableSum + deliverable.quantity; // For archetypes
      }, 0);
    }, 0);

    // Calculate total deliverables from active campaigns
    const deliverables = activeCampaigns.reduce((sum, campaign) => {
      return sum + campaign.deliverables.length;
    }, 0);

    return {
      activeCampaigns: activeCampaigns.length,
      budgetCents,
      influencers,
      deliverables,
      loading: false,
      error: null,
      refresh: () => {
        // TODO: Implement refresh logic when connected to Supabase
        console.log('Refresh dashboard metrics');
      },
    };
  }, [campaigns]);

  return metrics;
};

export const useDashboardCards = (
  campaigns: Campaign[],
  onNavigate: (cardId: string) => void
): DashboardMetric[] => {
  const formatters = useFormatters();
  const metrics = useDashboardMetrics(campaigns);

  return useMemo(() => {
    const budgetDollars = metrics.budgetCents / 100; // Convert cents back to dollars for display

    return [
      {
        id: 'active-campaigns',
        title: 'Active Campaigns',
        value: metrics.activeCampaigns,
        formattedValue: formatters.compact.format(metrics.activeCampaigns),
        fullValue: formatters.full.format(metrics.activeCampaigns),
        icon: 'TrendingUp',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        available: true,
        tooltip: `${formatters.full.format(metrics.activeCampaigns)} campaigns currently running`,
        onClick: () => onNavigate('active-campaigns'),
      },
      {
        id: 'budget',
        title: 'Budget',
        value: budgetDollars,
        formattedValue: budgetDollars >= 1000 
          ? formatters.currency.format(budgetDollars).replace(/\.0+/, '').replace(/(\d)([KMB])/, '$1$2')
          : formatters.currency.format(budgetDollars),
        fullValue: formatters.currency.format(budgetDollars),
        icon: 'DollarSign',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        available: true,
        tooltip: `Total budget: ${formatters.currency.format(budgetDollars)} across active campaigns`,
        onClick: () => onNavigate('budget'),
      },
      {
        id: 'influencers',
        title: 'Influencers',
        value: metrics.influencers,
        formattedValue: formatters.compact.format(metrics.influencers),
        fullValue: formatters.full.format(metrics.influencers),
        icon: 'Users',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        available: metrics.influencers > 0,
        tooltip: metrics.influencers > 0 
          ? `${formatters.full.format(metrics.influencers)} unique influencers in active campaigns`
          : 'Connect influencers to see this metric',
        onClick: () => onNavigate('influencers'),
      },
      {
        id: 'deliverables',
        title: 'Deliverables',
        value: metrics.deliverables,
        formattedValue: formatters.compact.format(metrics.deliverables),
        fullValue: formatters.full.format(metrics.deliverables),
        icon: 'FileText',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        available: true,
        tooltip: `${formatters.full.format(metrics.deliverables)} total deliverables across active campaigns`,
        onClick: () => onNavigate('deliverables'),
      },
    ];
  }, [metrics, formatters, onNavigate]);
};