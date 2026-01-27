import { getProvider, getRelatedProviders } from '@/lib/db';
import { ClassificationBadge } from '@/components/ClassificationBadge';
import { WatchlistButton } from '@/components/WatchlistButton';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Users,
  FileText,
  Globe,
  Mail,
  User,
  ChevronRight,
  ExternalLink,
  Copy,
  Flame,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ ccn: string }>;
}

export default async function ProviderDetailPage({ params }: Props) {
  const { ccn } = await params;
  const provider = await getProvider(ccn);

  if (!provider) {
    notFound();
  }

  const relatedProviders = await getRelatedProviders(ccn, provider.state, provider.city);

  const formatScore = (score: number | string | null) => {
    if (score === null || score === undefined) return '—';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(num) ? '—' : num.toFixed(1);
  };

  const getScoreColor = (score: number | string | null) => {
    if (score === null || score === undefined) return 'text-[var(--color-text-muted)]';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    if (isNaN(num)) return 'text-[var(--color-text-muted)]';
    if (num >= 70) return 'text-emerald-400';
    if (num >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatNumber = (value: number | string | null, decimals: number = 0) => {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '—' : num.toFixed(decimals);
  };

  const getAdcValue = (adc: number | string | null): number | null => {
    if (adc === null || adc === undefined) return null;
    const num = typeof adc === 'string' ? parseFloat(adc) : adc;
    return isNaN(num) ? null : num;
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const hotMarkets = ['WA', 'OR', 'CA', 'MT', 'NV'];
  const isHotMarket = hotMarkets.includes(provider.state);

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
        <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        <Link href="/targets" className="text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors">
          All Targets
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        <Link
          href={isHotMarket ? `/market/${provider.state.toLowerCase()}` : `/targets?state=${provider.state}`}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors flex items-center gap-1"
        >
          {provider.state}
          {isHotMarket && <Flame className="w-3 h-3 text-orange-400" />}
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        <span className="text-[var(--color-text-primary)] font-medium truncate max-w-[200px]">
          {provider.provider_name}
        </span>
      </nav>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={`/targets?state=${provider.state}&classification=${provider.classification}`}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-sm transition-colors flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          More in {provider.state}
        </Link>
        <Link
          href={`/targets?state=${provider.state}&city=${encodeURIComponent(provider.city)}`}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-sm transition-colors flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" />
          More in {provider.city}
        </Link>
        {provider.classification === 'GREEN' && (
          <Link
            href="/green"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            All GREEN
          </Link>
        )}
        {provider.website && (
          <a
            href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] text-sm hover:bg-[var(--color-turquoise-500)]/30 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit Website
          </a>
        )}
      </div>

      {/* Header */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
              {provider.provider_name}
            </h1>
            <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {provider.city}, {provider.state}
              </span>
              <span className="font-mono text-sm">CCN: {provider.ccn}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <WatchlistButton ccn={provider.ccn} providerName={provider.provider_name} size="lg" />
              <ClassificationBadge classification={provider.classification} size="lg" />
            </div>
            {provider.con_state && (
              <span className="flex items-center gap-1 text-sm text-[var(--color-turquoise-400)]">
                <Shield className="w-4 h-4" />
                CON State
              </span>
            )}
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Overall</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.overall_score)}`}>
              {formatScore(provider.overall_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Quality</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.quality_score)}`}>
              {formatScore(provider.quality_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Compliance</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.compliance_score)}`}>
              {formatScore(provider.compliance_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Operational</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.operational_score)}`}>
              {formatScore(provider.operational_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Market</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.market_score)}`}>
              {formatScore(provider.market_score)}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-[var(--color-turquoise-400)]" />
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Address</span>
            </div>
            <div className="text-[var(--color-text-primary)]">
              {provider.address_line_1 ? (
                <>
                  <p>{provider.address_line_1}</p>
                  {provider.address_line_2 && <p>{provider.address_line_2}</p>}
                  <p>{provider.city}, {provider.state} {provider.zip_code}</p>
                </>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">No address on file</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Phone</span>
            </div>
            <div className="text-[var(--color-text-primary)]">
              {provider.phone_number ? (
                <a
                  href={`tel:${provider.phone_number}`}
                  className="text-[var(--color-turquoise-400)] hover:underline"
                >
                  {provider.phone_number}
                </a>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">No phone on file</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Website</span>
            </div>
            <div className="text-[var(--color-text-primary)]">
              {provider.website ? (
                <a
                  href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-turquoise-400)] hover:underline break-all"
                >
                  {provider.website}
                </a>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">No website on file</p>
              )}
            </div>
          </div>
        </div>

        {/* Administrator Contact */}
        {(provider.administrator_name || provider.administrator_phone) && (
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-3">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Administrator</span>
            </div>
            <div className="flex flex-wrap gap-6">
              {provider.administrator_name && (
                <div>
                  <p className="text-[var(--color-text-primary)]">{provider.administrator_name}</p>
                </div>
              )}
              {provider.administrator_phone && (
                <div>
                  <a
                    href={`tel:${provider.administrator_phone}`}
                    className="text-[var(--color-turquoise-400)] hover:underline"
                  >
                    {provider.administrator_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Provider Details */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            Provider Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">County</span>
              <span>{provider.county || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Ownership Type</span>
              <span>{provider.ownership_type_cms || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">ADC</span>
              <span className={getAdcValue(provider.estimated_adc) !== null && getAdcValue(provider.estimated_adc)! < 60 ? 'text-emerald-400' : ''}>
                {formatNumber(provider.estimated_adc, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">ADC Fit</span>
              <span>{provider.adc_fit || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Service Area (ZIPs)</span>
              <span>{provider.service_area_zip_count || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Market Type</span>
              <span>{provider.market_type || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--color-text-muted)]">Certified</span>
              <span>{formatDate(provider.certification_date)}</span>
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            Ownership Profile
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Complexity</span>
              <span>{provider.ownership_complexity || 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Owner Count</span>
              <span>{provider.owner_count || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">PE/Investment Backed</span>
              <span className={provider.pe_backed ? 'text-amber-400' : ''}>
                {provider.pe_backed ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Chain Affiliated</span>
              <span>{provider.chain_affiliated ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--color-text-muted)]">Recent Ownership Change</span>
              <span className={provider.recent_ownership_change ? 'text-amber-400' : ''}>
                {provider.recent_ownership_change ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Classification Reasons */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--color-turquoise-400)]" />
          Classification Reasons
        </h2>
        <div className="space-y-2">
          {provider.classification_reasons?.split('|').map((reason, i) => (
            <div key={i} className="flex items-start gap-2 py-2">
              {provider.classification === 'GREEN' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : provider.classification === 'YELLOW' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-[var(--color-text-secondary)]">{reason.trim()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach & Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            Outreach Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Readiness</p>
              <p className="text-[var(--color-text-primary)]">{provider.outreach_readiness || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Deal Type</p>
              <p className="text-[var(--color-text-primary)]">{provider.platform_vs_tuckin || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Sell-Side Hypothesis</p>
              <p className="text-[var(--color-text-secondary)] text-sm">{provider.sell_side_hypothesis || '—'}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            Rating Sensitivity
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-emerald-400 mb-1">Upgrade Triggers</p>
              <p className="text-[var(--color-text-secondary)] text-sm">{provider.upgrade_triggers || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-red-400 mb-1">Downgrade Triggers</p>
              <p className="text-[var(--color-text-secondary)] text-sm">{provider.downgrade_triggers || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">
          Data Quality & Follow-up
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Data Quality</p>
            <p className={`font-medium ${
              provider.data_quality === 'high' ? 'text-emerald-400' :
              provider.data_quality === 'medium' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {provider.data_quality?.toUpperCase() || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Confidence</p>
            <p className="font-medium">{provider.confidence_level || '—'} ({formatNumber(provider.confidence_score, 2)})</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Missing Data</p>
            <p className="text-[var(--color-text-secondary)] text-sm">{provider.missing_data || 'Complete'}</p>
          </div>
        </div>
      </div>

      {/* Related Providers */}
      {relatedProviders.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-turquoise-400)]" />
              Related Targets in {provider.state}
            </h2>
            <Link
              href={`/targets?state=${provider.state}`}
              className="text-sm text-[var(--color-turquoise-400)] hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {(relatedProviders as any[]).map((related) => (
              <Link
                key={related.ccn}
                href={`/provider/${related.ccn}`}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    related.classification === 'GREEN' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <div className="min-w-0">
                    <p className="font-medium truncate group-hover:text-[var(--color-turquoise-400)] transition-colors">
                      {related.provider_name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {related.city}, {related.state}
                      {related.city === provider.city && (
                        <span className="ml-2 text-[var(--color-turquoise-400)]">Same City</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-mono">{Number(related.overall_score).toFixed(1)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{related.estimated_adc || '—'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">ADC</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-400)] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
        Data Source: {provider.data_source} • Analysis Date: {formatDate(provider.analysis_date)}
      </div>
    </div>
  );
}
