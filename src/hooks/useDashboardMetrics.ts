import { useMemo } from 'react';
import { Campaign } from '../types/campaign';
import { calculateScenarioMetrics } from '../utils/calculations';
import { useFormatters, formatNumberFull, formatCurrencyFull } from '../utils/formatters';

export interface DashboardMetrics {
  activeCampaigns: number;
  budget: number;
  influencers: number;
  deliverables: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  fullValue: string;
  icon: string;
  color: string;
  bgColor: string;
  available: boolean;
  tooltip: string;
  onClick?: () => void;
}

export const useDashboardMetrics = (campaigns: Campaign[]): DashboardMetrics => {

  const metrics = useMemo(() => {
    const now = new Date();
    
    // Filter active campaigns (running between start and end dates)
    const activeCampaigns = campaigns.filter(campaign => {
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      return startDate <= now && endDate >= now;
    });

    // Calculate total budget from active campaigns
    const budget = activeCampaigns.reduce((sum, campaign) => {
      return sum + campaign.budgetAmount;
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
      budget,
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
): DashboardCard[] => {
  const formatters = useFormatters();
  const metrics = useDashboardMetrics(campaigns);

  return useMemo(() => {

    return [
      {
        id: 'active-campaigns',
        title: 'Active Campaigns',
        value: metrics.activeCampaigns,
        formattedValue: formatters.compact.format(metrics.activeCampaigns),
        fullValue: formatNumberFull(metrics.activeCampaigns),
        icon: 'TrendingUp',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        available: true,
        tooltip: `${formatNumberFull(metrics.activeCampaigns)} campaigns currently running`,
        onClick: () => onNavigate('active-campaigns'),
      },
      {
        id: 'budget',
        title: 'Budget',
        value: metrics.budget,
        formattedValue: formatters.currency.format(metrics.budget),
        fullValue: formatCurrencyFull(metrics.budget),
        icon: 'DollarSign',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        available: true,
        tooltip: `Total budget: ${formatCurrencyFull(metrics.budget)} across active campaigns`,
        onClick: () => onNavigate('budget'),
      },
      {
        id: 'influencers',
        title: 'Influencers',
        value: metrics.influencers,
        formattedValue: formatters.compact.format(metrics.influencers),
        fullValue: formatNumberFull(metrics.influencers),
        icon: 'Users',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        available: metrics.influencers > 0,
        tooltip: metrics.influencers > 0 
          ? `${formatNumberFull(metrics.influencers)} unique influencers in active campaigns`
          : 'Connect influencers to see this metric',
        onClick: () => onNavigate('influencers'),
      },
      {
        id: 'deliverables',
        title: 'Deliverables',
        value: metrics.deliverables,
        formattedValue: formatters.compact.format(metrics.deliverables),
        fullValue: formatNumberFull(metrics.deliverables),
        icon: 'FileText',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        available: true,
        tooltip: `${formatNumberFull(metrics.deliverables)} total deliverables across active campaigns`,
        onClick: () => onNavigate('deliverables'),
      },
    ];
  }, [metrics, formatters, onNavigate]);
};