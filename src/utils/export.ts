import { DeliverableRow, CalculationMetrics } from '../types/campaign';
import { flattenDeliverables, calculateRowCost, formatCurrency } from './calculations';

export const exportToCsv = (
  deliverables: DeliverableRow[], 
  metrics: CalculationMetrics,
  scenarioName: string
): void => {
  const flattenedRows = flattenDeliverables(deliverables);
  
  // Create CSV headers
  const headers = [
    'Type',
    'Creator Type',
    'Platform',
    'Deliverable',
    'Creator/Cohort',
    'Cohort Size',
    'Quantity',
    'Unit Fee',
    'Price Overridden',
    'Rights Usage',
    'Rights Duration (months)',
    'Rights Territory',
    'Rights Exclusivity',
    'Competitor Count',
    'Rights Multiplier',
    'Total Cost',
    'Estimated Views',
    'Estimated Engagements',
    'Parent Cohort ID',
    'Needs Approval',
  ];
  
  // Create CSV rows
  const rows = flattenedRows.map(row => [
    row.type,
    row.creatorType,
    row.platform,
    row.deliverableType,
    row.creatorInfo.toString(),
    row.cohortSize?.toString() || '',
    row.quantity.toString(),
    row.unitFee.toString(),
    row.priceOverridden ? 'Yes' : 'No',
    row.rights.usage,
    row.rights.duration.toString(),
    row.rights.territory,
    row.rights.exclusivity.toString(),
    row.rights.competitorCount?.toString() || '0',
    row.rights.multiplier.toString(),
    calculateRowCost(row).toString(),
    row.estimatedViews.toString(),
    row.estimatedEngagements.toString(),
    typeof row.creatorInfo === 'object' && 'parentCohortId' in row.creatorInfo 
      ? row.creatorInfo.parentCohortId || '' 
      : '',
    row.needsApproval ? 'Yes' : 'No',
  ]);
  
  // Add summary rows
  const summaryRows = [
    [],
    ['CAMPAIGN SUMMARY'],
    ['Total Cost', ...Array(headers.length - 2).fill(''), formatCurrency(metrics.totalCost)],
    ['Organic Cost', ...Array(headers.length - 2).fill(''), formatCurrency(metrics.organicCost)],
    ['Paid Cost', ...Array(headers.length - 2).fill(''), formatCurrency(metrics.paidCost)],
    ['Total Influencers', ...Array(headers.length - 2).fill(''), metrics.totalInfluencers.toString()],
    ['Total Content Pieces', ...Array(headers.length - 2).fill(''), metrics.totalContentPieces.toString()],
    ['Total Views', ...Array(headers.length - 2).fill(''), metrics.totalViews.toString()],
    ['Total Engagements', ...Array(headers.length - 2).fill(''), metrics.totalEngagements.toString()],
    ['CPM', ...Array(headers.length - 2).fill(''), `$${metrics.cpm.toFixed(2)}`],
    ['CPV', ...Array(headers.length - 2).fill(''), `$${metrics.cpv.toFixed(4)}`],
    ['CPE', ...Array(headers.length - 2).fill(''), `$${metrics.cpe.toFixed(2)}`],
    ['Campaign Score', ...Array(headers.length - 2).fill(''), `${metrics.campaignScore}%`],
  ];
  
  // Combine all data
  const csvData = [headers, ...rows, ...summaryRows];
  
  // Convert to CSV string
  const csvContent = csvData
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${scenarioName.replace(/\s+/g, '_')}_campaign_plan.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};