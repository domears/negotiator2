import React, { useState } from 'react';
import { Plus, Search, Calendar, DollarSign, Users, Building2, Clock, Filter, ArrowRight, Folder, TrendingUp } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { formatCurrency, calculateScenarioMetrics } from '../utils/calculations';
import { formatNumber } from '../utils/numberFormatting';

interface DashboardProps {
  campaigns: Campaign[];
  onCreateNew: () => void;
  onSelectCampaign: (campaignId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  campaigns,
  onCreateNew,
  onSelectCampaign,
}) => {
  const { compact, currency } = useFormatters();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'client' | 'createdAt' | 'budget'>('createdAt');

  // Calculate dashboard metrics
  const dashboardMetrics = React.useMemo((): DashboardMetric[] => {
    const now = new Date();
    const activeCampaigns = campaigns.filter(c => c.startDate <= now && c.endDate >= now);
    
    // Calculate total budget from active campaigns
    const totalBudget = activeCampaigns.reduce((sum, c) => sum + c.budgetAmount, 0);
    
    // Calculate total influencers from active campaigns
    // For now, estimate based on deliverables (in production, this would query actual influencer relationships)
    const totalInfluencers = activeCampaigns.reduce((sum, c) => {
      return sum + c.deliverables.reduce((deliverableSum, d) => {
        if (d.creatorType === 'cohort' && d.cohortSize) {
          return deliverableSum + d.cohortSize;
        } else if (d.creatorType === 'specific') {
          return deliverableSum + 1;
        }
        return deliverableSum + d.quantity; // For archetypes
      }, 0);
    }, 0);
    
    // Calculate total deliverables from active campaigns
    const totalDeliverables = activeCampaigns.reduce((sum, c) => sum + c.deliverables.length, 0);

    return [
      {
        id: 'active-campaigns',
        title: 'Active Campaigns',
        value: activeCampaigns.length,
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        available: true,
        tooltip: 'Campaigns currently running'
      },
      {
        id: 'budget',
        title: 'Budget',
        value: totalBudget,
        icon: DollarSign,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        available: true,
        tooltip: 'Total budget across active campaigns'
      },
      {
        id: 'influencers',
        title: 'Influencers',
        value: totalInfluencers,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        available: totalInfluencers > 0,
        tooltip: totalInfluencers > 0 ? 'Unique influencers in active campaigns' : 'Connect influencers to see this metric'
      },
      {
        id: 'deliverables',
        title: 'Deliverables',
        value: totalDeliverables,
        icon: Building2,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        available: true,
        tooltip: 'Total deliverables across active campaigns'
      }
    ];
  }, [campaigns]);

  const handleCardClick = (cardId: string) => {
    switch (cardId) {
      case 'active-campaigns':
        setFilterStatus('active');
        break;
      case 'budget':
        // TODO: Navigate to budget/finance view when implemented
        console.log('Budget view not yet implemented');
        break;
      case 'influencers':
        // TODO: Navigate to influencers view when implemented
        console.log('Influencers view not yet implemented');
        break;
      case 'deliverables':
        // TODO: Navigate to deliverables view for active campaigns when implemented
        console.log('Deliverables view not yet implemented');
        break;
    }
  };

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filterStatus === 'all') return true;
      
      const now = new Date();
      const isActive = campaign.startDate <= now && campaign.endDate >= now;
      const isCompleted = campaign.endDate < now;
      
      return filterStatus === 'active' ? isActive : isCompleted;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'client':
          return a.client.localeCompare(b.client);
        case 'budget':
          return b.budgetAmount - a.budgetAmount;
        case 'createdAt':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const getStatusBadge = (campaign: Campaign) => {
    const now = new Date();
    const isActive = campaign.startDate <= now && campaign.endDate >= now;
    const isCompleted = campaign.endDate < now;
    const isUpcoming = campaign.startDate > now;
    
    if (isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
    } else if (isCompleted) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Completed</span>;
    } else if (isUpcoming) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Draft</span>;
  };

  const getCampaignMetrics = (campaign: Campaign) => {
    return calculateScenarioMetrics(campaign.deliverables);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/negotiator_logo_gradient.png" 
                  alt="Negotiator Logo" 
                  className="h-8 w-8"
                />
                <h1 className="text-2xl font-bold text-gray-900">Negotiator</h1>
              </div>
              <span className="text-sm text-gray-500 hidden sm:block">
                Campaign Dashboard
              </span>
            </div>
            
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Manage your influencer marketing campaigns and track performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((metric) => (
            <DashboardCard
              key={metric.id}
              metric={metric}
            />
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Campaigns</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="client">Client</option>
                <option value="budget">Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              {campaigns.length === 0 ? (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first influencer marketing campaign</p>
                  <button
                    onClick={onCreateNew}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Campaign
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </>
              )}
            </div>
          ) : (
            filteredCampaigns.map((campaign) => {
              const metrics = getCampaignMetrics(campaign);
              return (
                <div
                  key={campaign.id}
                  onClick={() => onSelectCampaign(campaign.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                          {campaign.name}
                        </h3>
                        {getStatusBadge(campaign)}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{campaign.client} • {campaign.brand}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{campaign.duration} days</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 font-medium">Budget</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(campaign.budgetAmount)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 font-medium">Planned Cost</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(metrics.totalCost)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 font-medium">Deliverables</p>
                          <p className="text-sm font-bold text-gray-900">
                            {campaign.deliverables.length}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 font-medium">Markets</p>
                          <p className="text-sm font-bold text-gray-900">
                            {campaign.markets.length}
                          </p>
                        </div>
                      </div>

                      {campaign.primaryKpis && campaign.primaryKpis.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 font-medium mb-1">Primary KPIs:</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.primaryKpis.slice(0, 3).map((kpi) => (
                              <span key={kpi} className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                                {kpi}
                              </span>
                            ))}
                            {campaign.primaryKpis.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{campaign.primaryKpis.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        {campaigns.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={onCreateNew}
                className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">New Campaign</p>
                  <p className="text-sm text-gray-600">Start fresh planning</p>
                </div>
              </button>
              
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 opacity-75">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-500">Analytics</p>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 opacity-75">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-500">Creator Database</p>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};