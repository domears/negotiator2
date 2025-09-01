import React from 'react';
import { TrendingUp, DollarSign, Users, FileText, AlertCircle } from 'lucide-react';
import { DashboardMetric } from '../hooks/useDashboardMetrics';

interface DashboardCardProps {
  metric: DashboardMetric;
  loading?: boolean;
  error?: string | null;
}

const iconMap = {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  metric,
  loading = false,
  error = null,
}) => {
  const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || FileText;

  const handleClick = () => {
    if (metric.onClick && !loading && !error) {
      metric.onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && metric.onClick && !loading && !error) {
      e.preventDefault();
      metric.onClick();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
        metric.onClick && !loading && !error
          ? 'hover:shadow-md hover:border-primary-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={metric.onClick && !loading && !error ? 0 : -1}
      role={metric.onClick ? 'button' : 'article'}
      aria-label={`${metric.title}: ${metric.formattedValue}`}
      title={metric.tooltip}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${metric.color}`} />
            </div>
            <h3 className="text-sm font-medium text-gray-700">
              {metric.title}
            </h3>
          </div>
          
          <div className="space-y-1">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Couldn't load</span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {metric.formattedValue}
              </p>
            )}
            
            {!metric.available && !loading && !error && (
              <p className="text-xs text-gray-500">
                {metric.tooltip}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};