import React from 'react';
import { Calendar, MessageCircle, Paperclip, AlertTriangle } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { calculateScenarioMetrics } from '../utils/calculations';
import { useFormatters } from '../hooks/useFormatters';

interface CampaignCardProps {
  campaign: Campaign;
  onOpen: (id: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onOpen }) => {
  const metrics = calculateScenarioMetrics(campaign.deliverables);
  const fmt = useFormatters();
  
  const now = new Date();
  let lifecycle: 'Active' | 'Completed' | 'Draft' | 'Canceled';
  if (campaign.startDate <= now && campaign.endDate >= now) {
    lifecycle = 'Active';
  } else if (campaign.endDate < now) {
    lifecycle = 'Completed';
  } else {
    lifecycle = 'Draft';
  }

  const budgetUsed = metrics.totalCost;
  const budgetTotal = campaign.budgetAmount;
  const budgetPct = budgetTotal > 0 ? Math.min(budgetUsed / budgetTotal, 1) : 0;
  const budgetColor = budgetPct > 1 ? 'bg-red-500' : budgetPct > 0.8 ? 'bg-amber-500' : 'bg-green-500';

  const score = campaign.performanceScore || 0;
  const scoreColor = score < 40 ? 'text-red-600' : score < 70 ? 'text-amber-600' : 'text-green-600';
  const scoreBgColor = score < 40 ? 'bg-red-50' : score < 70 ? 'bg-amber-50' : 'bg-green-50';

  const isDraft = lifecycle === 'Draft';
  const isSetupIncomplete = (campaign.setupProgress || 0) < 6;

  const getLifecycleStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRightsStatusStyle = (status: string) => {
    return status === 'ok' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer ${
        isDraft ? 'opacity-90 bg-gray-50' : ''
      }`}
      onClick={() => onOpen(campaign.id)}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{campaign.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLifecycleStyle(lifecycle)}`}>
              {lifecycle}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {campaign.client} • {campaign.brand} • {campaign.currency}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {/* Conditional Flags */}
          {campaign.overBudget && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
              Over budget
            </span>
          )}
          {campaign.underPacing && campaign.pacingPercentage && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {campaign.pacingPercentage}% behind
            </span>
          )}
          {campaign.complianceConflicts && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
              Compliance review
            </span>
          )}
          {campaign.blocked && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
              Blocked
            </span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(campaign.id);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isDraft || isSetupIncomplete
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isDraft || isSetupIncomplete ? 'Resume Setup' : 'Open'}
          </button>
        </div>
      </div>

      {/* KPI Block (4-up) */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Spend</p>
          <p className="text-sm font-bold text-gray-900">
            {fmt.usdCompact(budgetUsed * 100)} / {fmt.usdCompact(budgetTotal * 100)}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${budgetColor}`}
              style={{ width: `${Math.min(budgetPct * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 mb-1">Influencers</p>
          <p className="text-sm font-bold text-gray-900">
            {fmt.countCompact(metrics.totalInfluencers)}
          </p>
          <p className="text-xs text-gray-500 mt-1">creators</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 mb-1">Performance</p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold ${scoreColor}`}>
              {score} / 100
            </span>
            {!isDraft && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${scoreBgColor} ${scoreColor}`}>
                {campaign.performanceLabel}
              </span>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-xs text-gray-600 mb-1">Deliverables</p>
          <p className="text-sm font-bold text-gray-900">
            {fmt.countCompact(metrics.totalContentPieces)}
          </p>
          <p className="text-xs text-gray-500 mt-1">assets</p>
        </div>
      </div>

      {/* Rights Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
            getRightsStatusStyle(campaign.rightsStatus || 'ok')
          }`}>
            {campaign.rightsStatus === 'ok' ? 'Rights OK' : 'Rights Attention'}
          </span>
          
          {campaign.expiringRightsCount && campaign.expiringRightsCount > 0 && (
            <span className="text-xs text-amber-600">
              {campaign.expiringRightsCount} expiring
            </span>
          )}
          
          {campaign.missingRightsCount && campaign.missingRightsCount > 0 && (
            <span className="text-xs text-red-600">
              {campaign.missingRightsCount} missing
            </span>
          )}
        </div>
        
        {campaign.rightsStatus === 'attention' && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>

      {/* Setup Progress (only if incomplete) */}
      {isSetupIncomplete && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Setup progress: {campaign.setupProgress || 0}/6</span>
            <button
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(campaign.id);
              }}
            >
              Resume setup
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((campaign.setupProgress || 0) / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer Strip */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              {campaign.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {campaign.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          {campaign.category && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
              {campaign.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Team Avatars */}
          <div className="flex items-center space-x-1">
            {campaign.leadAvatar && (
              <img
                src={campaign.leadAvatar}
                alt="Lead"
                className="w-5 h-5 rounded-full border border-gray-200"
              />
            )}
            {campaign.teamAvatars && campaign.teamAvatars.slice(0, 2).map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt={`Team member ${index + 1}`}
                className="w-5 h-5 rounded-full border border-gray-200 -ml-1"
              />
            ))}
            {campaign.teamAvatars && campaign.teamAvatars.length > 2 && (
              <span className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-600 -ml-1">
                +{campaign.teamAvatars.length - 2}
              </span>
            )}
          </div>
          
          {/* Comments & Files */}
          <div className="flex items-center space-x-2">
            {campaign.commentsCount && campaign.commentsCount > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{campaign.commentsCount}</span>
              </div>
            )}
            {campaign.filesCount && campaign.filesCount > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-3 w-3" />
                <span>{campaign.filesCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;