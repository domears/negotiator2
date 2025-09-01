import React from 'react';
import { X, TrendingUp, Eye, Heart, DollarSign, Users, FileText, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { CalculationMetrics } from '../types/campaign';
import { DeliverableRow } from '../types/campaign';
import { formatCurrency, formatCurrencyAbbreviated, formatNumber } from '../utils/calculations';

interface MediaSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  metrics: CalculationMetrics;
  deliverables: DeliverableRow[];
}

export const MediaSummary: React.FC<MediaSummaryProps> = ({
  isOpen,
  onClose,
  onToggle,
  metrics,
  deliverables,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  // Calculate total influencers and content pieces
  const totalInfluencers = deliverables.reduce((sum, row) => {
    if (row.creatorType === 'cohort') {
      return sum + row.quantity;
    }
    return sum + 1; // specific creator counts as 1
  }, 0);
  
  const totalContentPieces = deliverables.reduce((sum, row) => {
    const rowPieces = row.quantity;
    const childPieces = row.children?.reduce((childSum, child) => childSum + child.quantity, 0) || 0;
    return sum + rowPieces + childPieces;
  }, 0);

  // Core metrics for collapsed view (top 4 most critical)
  const coreMetrics = [
    {
      title: 'Total Investment',
      value: formatCurrency(metrics.totalCost),
      abbreviatedValue: formatCurrencyAbbreviated(metrics.totalCost),
      icon: DollarSign,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'CPM',
      value: `$${metrics.cpm.toFixed(2)}`,
      abbreviatedValue: `$${metrics.cpm.toFixed(0)}`,
      subtitle: 'Cost per 1,000 views',
      icon: TrendingUp,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'CPV',
      value: `$${metrics.cpv.toFixed(4)}`,
      abbreviatedValue: `$${metrics.cpv.toFixed(3)}`,
      subtitle: 'Cost per view',
      icon: Eye,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      title: 'CPE',
      value: `$${metrics.cpe.toFixed(2)}`,
      abbreviatedValue: `$${metrics.cpe.toFixed(1)}`,
      subtitle: 'Cost per engagement',
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];

  // Additional metrics for expanded view
  const additionalMetrics = [
    {
      title: 'Total Influencers',
      value: formatNumber(totalInfluencers),
      abbreviatedValue: formatNumber(totalInfluencers),
      subtitle: 'Creators in campaign',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Content Pieces',
      value: formatNumber(totalContentPieces),
      abbreviatedValue: formatNumber(totalContentPieces),
      subtitle: 'Total deliverables',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <>
      {/* Toggle Button - Always visible on the right edge */}
      <div className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
        isOpen ? (isExpanded ? 'right-[320px]' : 'right-[80px]') : '-right-2'
      }`}>
        <button
          onClick={onToggle}
          className={`bg-white shadow-lg border border-gray-200 transition-all duration-300 ease-out hover:shadow-xl group overflow-hidden ${
            isOpen 
              ? 'rounded-l-lg border-r-0' 
              : 'rounded-l-lg border-r-0 pr-3'
          }`}
          aria-label={isOpen ? 'Hide Media Summary' : 'Show Media Summary'}
        >
          <div className={`flex items-center transition-all duration-300 ease-out ${
            !isOpen ? 'group-hover:pr-3' : ''
          }`}>
            {/* Icon container - always visible */}
            <div className={`flex items-center justify-center h-12 flex-shrink-0 ${
              isOpen ? 'w-12 pl-3' : 'w-12 pl-1'
            }`}>
              <BarChart3 className="h-5 w-5 text-primary-600 transition-transform duration-300 group-hover:scale-110" />
            </div>
            
            {/* Text container - only expands on hover when sidebar is closed */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${
              isOpen ? 'w-0' : 'w-0 group-hover:w-32'
            }`}>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                Media Summary
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 ${isExpanded ? 'w-[320px]' : 'w-[80px]'} bg-white shadow-2xl border-l border-gray-200 transition-all duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${!isExpanded ? 'group' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[73px]">
            {isExpanded ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Media Summary</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label="Close sidebar"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isExpanded ? (
              /* Expanded View */
              <div className="p-6 space-y-6">
                {/* Title Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-bold text-gray-900">Media Summary</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Reordered metrics: Influencers, Content Pieces, Investment, CPM, CPV, CPE */}
                  {[
                    additionalMetrics[0], // Total Influencers
                    additionalMetrics[1], // Content Pieces
                    coreMetrics[0],       // Total Investment
                    coreMetrics[1],       // CPM
                    coreMetrics[2],       // CPV
                    coreMetrics[3],       // CPE
                  ].map((metric) => (
                    <div
                      key={metric.title}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                          <metric.icon className={`h-5 w-5 ${metric.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-700">
                            {metric.title}
                          </h3>
                          <p className="text-2xl font-bold text-gray-900">
                            {metric.value}
                          </p>
                          {metric.subtitle && (
                            <p className="text-xs text-gray-500 mt-1">
                              {metric.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Breakdown
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Organic Cost</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(metrics.organicCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Paid Amplification</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(metrics.paidCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Views</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(metrics.totalViews)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Total Engagements</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(metrics.totalEngagements)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Campaign Score
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((metrics.cpe > 0 ? 100 / metrics.cpe : 0), 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-blue-900">
                      {metrics.cpe > 0 ? Math.round(100 / metrics.cpe) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Based on cost per engagement efficiency
                  </p>
                </div>
              </div>
            ) : (
              /* Collapsed View */
              <div className="p-3 space-y-3">
                {coreMetrics.map((metric) => (
                  <div
                    key={metric.title}
                    className="flex flex-col items-center text-center space-y-2 py-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer"
                    title={`${metric.title}: ${metric.value}`}
                  >
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {metric.abbreviatedValue}
                      </p>
                      <p className="text-xs text-gray-500 truncate w-full">
                        {metric.title}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Expand Button */}
                <div className="flex justify-center pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-60 group-hover:opacity-100 hover:scale-110"
                    aria-label="Expand sidebar"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};