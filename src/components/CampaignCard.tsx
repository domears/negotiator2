import React from 'react';
import { Calendar, Users, FileText } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { calculateScenarioMetrics, formatCurrency, formatNumber } from '../utils/calculations';

interface CampaignCardProps {
  campaign: Campaign;
  onOpen: (id: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onOpen }) => {
  const metrics = calculateScenarioMetrics(campaign.deliverables);
  const now = new Date();
  let lifecycle: 'Active' | 'Completed' | 'Draft';
  if (campaign.startDate <= now && campaign.endDate >= now) {
    lifecycle = 'Active';
  } else if (campaign.endDate < now) {
    lifecycle = 'Completed';
  } else {
    lifecycle = 'Draft';
  }

  const totalSteps = 6;
  const stepsCompleted = campaign.deliverables.length > 0 ? totalSteps : 3;
  const showSetup = stepsCompleted < totalSteps;

  const budgetUsed = metrics.totalCost;
  const budgetTotal = campaign.budgetAmount;
  const budgetPct = budgetTotal > 0 ? Math.min(budgetUsed / budgetTotal, 1) : 0;
  const budgetColor = budgetPct > 1 ? 'bg-red-500' : budgetPct > 0.8 ? 'bg-amber-500' : 'bg-green-500';

  const score = metrics.campaignScore || 0;
  const scoreColor = score < 40 ? 'text-red-600' : score < 70 ? 'text-amber-600' : 'text-green-600';

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer"
      onClick={() => onOpen(campaign.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          <p className="text-sm text-gray-600">
            {campaign.client} • {campaign.brand}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            lifecycle === 'Active'
              ? 'bg-green-100 text-green-800'
              : lifecycle === 'Completed'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {lifecycle}
        </span>
      </div>

      {/* KPI block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">Spend Used</p>
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(budgetUsed)} / {formatCurrency(budgetTotal)}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className={`h-1 rounded-full ${budgetColor}`}
              style={{ width: `${budgetPct * 100}%` }}
            ></div>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600">Influencers</p>
          <p className="text-sm font-bold text-gray-900">
            {formatNumber(metrics.totalInfluencers)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Deliverables</p>
          <p className="text-sm font-bold text-gray-900">
            {formatNumber(metrics.totalContentPieces)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Health</p>
          <p className={`text-sm font-bold ${scoreColor}`}>{Math.round(score)}</p>
        </div>
      </div>

      {/* Rights row */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">OK</span>
        <span className="text-xs text-gray-500">0 expiring</span>
      </div>

      {/* Setup progress */}
      {showSetup && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>
              Setup progress: {stepsCompleted}/{totalSteps}
            </span>
            {lifecycle === 'Draft' ? (
              <button
                className="text-primary-600 hover:underline"
                onClick={e => {
                  e.stopPropagation();
                  onOpen(campaign.id);
                }}
              >
                Resume setup
              </button>
            ) : null}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="h-1 rounded-full bg-primary-500"
              style={{ width: `${(stepsCompleted / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer strip */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>
            {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
          </span>
        </div>
        {campaign.primaryObjective && (
          <div className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>{campaign.primaryObjective}</span>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>{campaign.markets.length} markets</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;

