import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Target, Globe, Building2, Tag, Clock, AlertTriangle, CheckCircle, ArrowRight, TrendingUp, BarChart3 } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { SmartNumberInput } from './SmartNumberInput';
import { formatNumber } from '../utils/numberFormatting';

interface CampaignInitializationProps {
  onComplete: (campaign: Campaign) => void;
  existingCampaign?: Campaign;
}

const markets = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'LATAM', name: 'Latin America' },
  { code: 'EMEA', name: 'Europe, Middle East & Africa' },
  { code: 'APAC', name: 'Asia Pacific' },
];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

const objectives = [
  { id: 'awareness', name: 'Awareness', description: 'Build brand recognition and recall' },
  { id: 'relevance', name: 'Relevance', description: 'Increase brand consideration and affinity' },
  { id: 'traffic', name: 'Traffic', description: 'Drive website visits and engagement' },
  { id: 'leads', name: 'Leads', description: 'Generate qualified prospects' },
  { id: 'sales', name: 'Sales', description: 'Drive direct conversions and revenue' },
];

const kpiOptions = [
  'Reach', 'Impressions', 'Views', 'Engagements', 'Clicks', 'Conversions', 
  'Brand Lift', 'Purchase Intent', 'Website Traffic', 'Lead Generation',
  'Sales Revenue', 'Cost Per Acquisition', 'Return on Ad Spend'
];

const industryTags = [
  'Pet', 'Food & Beverage', 'Beauty & Personal Care', 'Fashion', 'Technology',
  'Automotive', 'Finance', 'Healthcare', 'Travel', 'Entertainment', 'Sports',
  'Home & Garden', 'Education', 'Non-Profit'
];

const contentThemes = [
  'Holiday', 'Product Launch', 'Cause-Related', 'Seasonal', 'Educational',
  'Entertainment', 'User-Generated Content', 'Behind-the-Scenes', 'Testimonials'
];

export const CampaignInitialization: React.FC<CampaignInitializationProps> = ({
  onComplete,
  existingCampaign,
}) => {
  const [campaign, setCampaign] = useState<Partial<Campaign>>(() => ({
    name: '',
    client: '',
    brand: '',
    markets: [],
    currency: 'USD',
    primaryObjective: '',
    primaryKpis: [],
    secondaryKpis: [],
    tertiaryKpis: [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    budgetType: 'campaign',
    budgetAmount: 0,
    industryTags: [],
    contentThemes: [],
    legalRightsPreset: 'organic',
    ...existingCampaign,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Calculate campaign duration
  useEffect(() => {
    if (campaign.startDate && campaign.endDate) {
      const duration = Math.ceil(
        (campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      setCampaign(prev => ({ ...prev, duration }));
    }
  }, [campaign.startDate, campaign.endDate]);

  const validateStep = (step: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (step >= 1) {
      if (!campaign.name?.trim()) newErrors.name = 'Campaign name is required';
      if (!campaign.client?.trim()) newErrors.client = 'Client is required';
      if (!campaign.brand?.trim()) newErrors.brand = 'Brand is required';
    }

    if (step >= 2) {
      if (!campaign.markets?.length) newErrors.markets = 'At least one market is required';
      if (!campaign.currency) newErrors.currency = 'Currency is required';
    }

    if (step >= 3) {
      if (!campaign.primaryObjective) newErrors.primaryObjective = 'Primary objective is required';
      if (!campaign.primaryKpis?.length) newErrors.primaryKpis = 'At least one primary KPI is required';
    }

    if (step >= 5) {
      if (!campaign.startDate) newErrors.startDate = 'Start date is required';
      if (!campaign.endDate) newErrors.endDate = 'End date is required';
      if (campaign.startDate && campaign.endDate && campaign.startDate >= campaign.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (step >= 6) {
      if (!campaign.budgetAmount || campaign.budgetAmount <= 0) {
        newErrors.budgetAmount = 'Budget amount must be greater than 0';
      }
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    const stepErrors = validateStep(6);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      const completeCampaign: Campaign = {
        id: existingCampaign?.id || Math.random().toString(36).substr(2, 9),
        name: campaign.name!,
        client: campaign.client!,
        brand: campaign.brand!,
        markets: campaign.markets!,
        currency: campaign.currency!,
        fxLockDate: campaign.fxLockDate,
        primaryObjective: campaign.primaryObjective!,
        primaryKpis: campaign.primaryKpis!,
        secondaryKpis: campaign.secondaryKpis || [],
        tertiaryKpis: campaign.tertiaryKpis || [],
        guardrails: campaign.guardrails,
        startDate: campaign.startDate!,
        endDate: campaign.endDate!,
        duration: campaign.duration,
        flightingNotes: campaign.flightingNotes,
        budgetType: campaign.budgetType!,
        budgetAmount: campaign.budgetAmount!,
        industryTags: campaign.industryTags || [],
        audienceTargeting: campaign.audienceTargeting,
        legalRightsPreset: campaign.legalRightsPreset || 'organic',
        contentThemes: campaign.contentThemes || [],
        benchmarkOverrides: campaign.benchmarkOverrides,
        approvalTriggers: campaign.approvalTriggers || [],
        auditNotes: campaign.auditNotes,
        createdAt: existingCampaign?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      onComplete(completeCampaign);
    }
  };

  const isStepComplete = (step: number): boolean => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length === 0;
  };

  const steps = [
    { number: 1, title: 'Identification', icon: Building2 },
    { number: 2, title: 'Markets & Currency', icon: Globe },
    { number: 3, title: 'Objectives & KPIs', icon: Target },
    { number: 4, title: 'Goals & Targets', icon: BarChart3 },
    { number: 4, title: 'Goals & Targets', icon: TrendingUp },
    { number: 5, title: 'Timing', icon: Clock },
    { number: 6, title: 'Budget', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Initialization</h1>
          <p className="text-gray-600">Set up your campaign foundation before planning deliverables</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep > step.number
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Step 1: Identification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Campaign Identification</h2>
                  <p className="text-gray-600">Basic campaign information and brand details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaign.name || ''}
                    onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                      errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client *
                    </label>
                    <input
                      type="text"
                      value={campaign.client || ''}
                      onChange={(e) => setCampaign(prev => ({ ...prev, client: e.target.value }))}
                      placeholder="e.g., Mars, Nestlé, Kellanova"
                      className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.client ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={campaign.brand || ''}
                      onChange={(e) => setCampaign(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., Pedigree, Sheba, Cheerios"
                      className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.brand ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Markets & Currency */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Globe className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Markets & Currency</h2>
                  <p className="text-gray-600">Define geographic scope and financial denomination</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Markets / Regions *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {markets.map((market) => (
                      <label key={market.code} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={campaign.markets?.includes(market.code) || false}
                          onChange={(e) => {
                            const newMarkets = e.target.checked
                              ? [...(campaign.markets || []), market.code]
                              : (campaign.markets || []).filter(m => m !== market.code);
                            setCampaign(prev => ({ ...prev, markets: newMarkets }));
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{market.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.markets && <p className="mt-1 text-sm text-red-600">{errors.markets}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={campaign.currency || ''}
                    onChange={(e) => setCampaign(prev => ({ ...prev, currency: e.target.value }))}
                    className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                      errors.currency ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <option value="">Select currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                  {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Objectives & KPIs */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Objectives & KPIs</h2>
                  <p className="text-gray-600">Define campaign goals and success metrics</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Objective *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {objectives.map((objective) => (
                      <label key={objective.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                        <input
                          type="radio"
                          name="primaryObjective"
                          value={objective.id}
                          checked={campaign.primaryObjective === objective.id}
                          onChange={(e) => setCampaign(prev => ({ ...prev, primaryObjective: e.target.value }))}
                          className="mt-1 border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{objective.name}</p>
                          <p className="text-sm text-gray-600">{objective.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.primaryObjective && <p className="mt-1 text-sm text-red-600">{errors.primaryObjective}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary KPIs *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {kpiOptions.map((kpi) => (
                      <label key={kpi} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={campaign.primaryKpis?.includes(kpi) || false}
                          onChange={(e) => {
                            const newKpis = e.target.checked
                              ? [...(campaign.primaryKpis || []), kpi]
                              : (campaign.primaryKpis || []).filter(k => k !== kpi);
                            setCampaign(prev => ({ ...prev, primaryKpis: newKpis }));
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{kpi}</span>
                      </label>
                    ))}
                  </div>
                  {errors.primaryKpis && <p className="mt-1 text-sm text-red-600">{errors.primaryKpis}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary KPIs (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {kpiOptions.filter(kpi => !campaign.primaryKpis?.includes(kpi)).map((kpi) => (
                      <label key={kpi} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={campaign.secondaryKpis?.includes(kpi) || false}
                          onChange={(e) => {
                            const newKpis = e.target.checked
                              ? [...(campaign.secondaryKpis || []), kpi]
                              : (campaign.secondaryKpis || []).filter(k => k !== kpi);
                            setCampaign(prev => ({ ...prev, secondaryKpis: newKpis }));
                          }}
                          className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
                        />
                        <span className="text-sm text-gray-700">{kpi}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goals & Targets */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Goals & Targets</h2>
                  <p className="text-gray-600">Set numerical targets for your selected KPIs (supports K/M/B notation)</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Primary KPI Goals */}
                {campaign.primaryKpis && campaign.primaryKpis.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Primary KPI Targets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaign.primaryKpis.map((kpi) => {
                        return (
                          <div key={kpi} className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                            <SmartNumberInput
                              kpi={kpi}
                              value={campaign.goals?.[kpi] || 0}
                              onChange={(value) => setCampaign(prev => ({
                                ...prev,
                                goals: {
                                  ...prev.goals,
                                  [kpi]: value
                                }
                              }))}
                              currencySymbol={currencies.find(c => c.code === campaign.currency)?.symbol || '$'}
                              className="text-primary-900"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Secondary KPI Goals */}
                {campaign.secondaryKpis && campaign.secondaryKpis.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Secondary KPI Targets (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaign.secondaryKpis.map((kpi) => {
                        return (
                          <div key={kpi} className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                            <SmartNumberInput
                              kpi={kpi}
                              value={campaign.goals?.[kpi] || 0}
                              onChange={(value) => setCampaign(prev => ({
                                ...prev,
                                goals: {
                                  ...prev.goals,
                                  [kpi]: value
                                }
                              }))}
                              currencySymbol={currencies.find(c => c.code === campaign.currency)?.symbol || '$'}
                              className="text-secondary-900"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Goals Summary */}
                {(campaign.primaryKpis?.length || 0) + (campaign.secondaryKpis?.length || 0) > 0 && (
                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6 border border-accent-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-accent-900 flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Goal Setting Tips</span>
                      </h3>
                      
                      {/* Goals Summary Preview */}
                      {Object.keys(campaign.goals || {}).length > 0 && (
                        <div className="text-sm text-accent-800">
                          <span className="font-medium">{Object.keys(campaign.goals || {}).length} goals set</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="font-medium text-accent-900">📊 SMART Goals Framework:</p>
                        <ul className="space-y-1 text-xs text-accent-800">
                          <li>• <strong>Specific:</strong> Clear, well-defined targets</li>
                          <li>• <strong>Measurable:</strong> Quantifiable metrics</li>
                          <li>• <strong>Achievable:</strong> Realistic expectations</li>
                          <li>• <strong>Relevant:</strong> Aligned with objectives</li>
                          <li>• <strong>Time-bound:</strong> Campaign duration context</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-accent-900">🎯 Best Practices:</p>
                        <ul className="space-y-1 text-xs text-accent-800">
                          <li>• Set stretch goals that challenge performance</li>
                          <li>• Consider seasonal and market factors</li>
                          <li>• Align targets with historical benchmarks</li>
                          <li>• Leave room for optimization during flight</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-accent-900">💡 Input Shortcuts:</p>
                        <ul className="space-y-1 text-xs text-accent-800">
                          <li>• Use K/M/B notation: <code>2.5M</code> = 2,500,000</li>
                          <li>• Alt+K/M/B/T for quick suffixes</li>
                          <li>• Paste from spreadsheets with commas</li>
                          <li>• Scientific notation: <code>1e6</code> = 1,000,000</li>
                        </ul>
                      </div>
                    </div>
                    
                    {Object.keys(campaign.goals || {}).length === 0 && (
                      <div className="mt-6 p-4 bg-white rounded-lg border border-accent-300">
                        <p className="text-sm text-accent-900 font-medium mb-2">
                          <strong>Optional but Recommended:</strong> Setting specific numerical targets helps measure campaign success and guides optimization decisions throughout the campaign lifecycle.
                        </p>
                        <p className="text-xs text-accent-700">
                          Goals will be tracked in your campaign dashboard and used for performance reporting.
                        </p>
                      </div>
                    )}
                    
                    {/* Goals Preview */}
                    {Object.keys(campaign.goals || {}).length > 0 && (
                      <div className="mt-6 p-4 bg-white rounded-lg border border-accent-300">
                        <h4 className="font-medium text-accent-900 mb-3">Your Campaign Targets:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(campaign.goals || {}).map(([kpi, value]) => (
                            <div key={kpi} className="flex justify-between items-center py-1">
                              <span className="text-sm text-accent-800">{kpi}:</span>
                              <span className="text-sm font-medium text-accent-900">
                                {formatNumber(value, { 
                                  style: 'compact',
                                  type: kpi.includes('%') || kpi.includes('Lift') || kpi.includes('Intent') ? 'percentage' : 
                                        kpi.includes('Revenue') || kpi.includes('Cost') ? 'currency' :
                                        kpi.includes('ROAS') || kpi.includes('Return') ? 'ratio' : 'count',
                                  currencyCode: campaign.currency
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Timing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Campaign Timing</h2>
                  <p className="text-gray-600">Set campaign flight dates and duration</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={campaign.startDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setCampaign(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                      className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={campaign.endDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setCampaign(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                      className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                        errors.endDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>
                </div>

                {campaign.duration && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Campaign Duration:</strong> {campaign.duration} days
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flighting Notes (Optional)
                  </label>
                  <textarea
                    value={campaign.flightingNotes || ''}
                    onChange={(e) => setCampaign(prev => ({ ...prev, flightingNotes: e.target.value }))}
                    placeholder="Describe campaign phases (e.g., Pre-launch, Launch, Sustain)"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Budget */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Budget Configuration</h2>
                  <p className="text-gray-600">Set budget parameters and advanced options</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <input
                        type="radio"
                        name="budgetType"
                        value="campaign"
                        checked={campaign.budgetType === 'campaign'}
                        onChange={(e) => setCampaign(prev => ({ ...prev, budgetType: e.target.value as any }))}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Campaign-level</p>
                        <p className="text-sm text-gray-600">Fixed budget across all scenarios</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                      <input
                        type="radio"
                        name="budgetType"
                        value="scenario"
                        checked={campaign.budgetType === 'scenario'}
                        onChange={(e) => setCampaign(prev => ({ ...prev, budgetType: e.target.value as any }))}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Scenario-specific</p>
                        <p className="text-sm text-gray-600">Different budgets per scenario</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Amount * ({currencies.find(c => c.code === campaign.currency)?.symbol || '$'})
                  </label>
                  <input
                    type="number"
                    value={campaign.budgetAmount || ''}
                    onChange={(e) => setCampaign(prev => ({ ...prev, budgetAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter budget amount"
                    className={`block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 ${
                      errors.budgetAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.budgetAmount && <p className="mt-1 text-sm text-red-600">{errors.budgetAmount}</p>}
                </div>

                {/* Advanced Options */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry Tags
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {industryTags.map((tag) => (
                          <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={campaign.industryTags?.includes(tag) || false}
                              onChange={(e) => {
                                const newTags = e.target.checked
                                  ? [...(campaign.industryTags || []), tag]
                                  : (campaign.industryTags || []).filter(t => t !== tag);
                                setCampaign(prev => ({ ...prev, industryTags: newTags }));
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Themes
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {contentThemes.map((theme) => (
                          <label key={theme} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={campaign.contentThemes?.includes(theme) || false}
                              onChange={(e) => {
                                const newThemes = e.target.checked
                                  ? [...(campaign.contentThemes || []), theme]
                                  : (campaign.contentThemes || []).filter(t => t !== theme);
                                setCampaign(prev => ({ ...prev, contentThemes: newThemes }));
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Legal / Rights Preset
                      </label>
                      <select
                        value={campaign.legalRightsPreset || ''}
                        onChange={(e) => setCampaign(prev => ({ ...prev, legalRightsPreset: e.target.value as any }))}
                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="organic">Organic Only</option>
                        <option value="paid">Paid Eligible</option>
                        <option value="both">Both Organic & Paid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audience Targeting Preference (Optional)
                      </label>
                      <textarea
                        value={campaign.audienceTargeting || ''}
                        onChange={(e) => setCampaign(prev => ({ ...prev, audienceTargeting: e.target.value }))}
                        placeholder="Describe target demographics, psychographics, or interests"
                        rows={2}
                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audit Notes (Optional)
                      </label>
                      <textarea
                        value={campaign.auditNotes || ''}
                        onChange={(e) => setCampaign(prev => ({ ...prev, auditNotes: e.target.value }))}
                        placeholder="Record planner rationale and assumptions"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>
              
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!isStepComplete(currentStep)}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Campaign Setup
                </button>
              )}
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};