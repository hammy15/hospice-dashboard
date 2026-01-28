import { getProvider, getRelatedProviders, calculateOwnerCarryBackScore } from '@/lib/db';
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
  DollarSign,
  BadgeCheck,
  Heart,
  Handshake,
  PiggyBank,
  Scale,
  Sparkles,
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

  // Calculate Owner Carry-Back Score
  const carryBackAnalysis = calculateOwnerCarryBackScore(provider);

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">Overall</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.overall_score)}`}>
              {formatScore(provider.overall_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">Quality</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.quality_score)}`}>
              {formatScore(provider.quality_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">Compliance</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.compliance_score)}`}>
              {formatScore(provider.compliance_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">Operational</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.operational_score)}`}>
              {formatScore(provider.operational_score)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">Market</p>
            <p className={`text-2xl font-bold font-mono ${getScoreColor(provider.market_score)}`}>
              {formatScore(provider.market_score)}
            </p>
          </div>
        </div>

        {/* CMS Star Ratings */}
        {provider.cms_cahps_star && (
          <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="text-center">
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">CAHPS Survey Rating</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-amber-400">{Number(provider.cms_cahps_star).toFixed(1)}</span>
                <span className="text-amber-400 text-xl">★</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">Family Caregiver Survey</p>
            </div>
            {provider.cms_quality_star && (
              <div className="text-center border-l border-amber-500/20 pl-6">
                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 font-medium">Quality Star</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-amber-400">{Number(provider.cms_quality_star).toFixed(1)}</span>
                  <span className="text-amber-400 text-xl">★</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">CMS Quality Rating</p>
              </div>
            )}
          </div>
        )}
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

      {/* Financial Data Section */}
      {(provider.total_revenue || provider.npi || provider.ein) && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            Financial & Registry Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CMS Cost Report Data */}
            {provider.total_revenue && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">
                    Cost Report ({provider.cost_report_year})
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Revenue</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ${(Number(provider.total_revenue) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Expenses</span>
                    <span className="font-mono">
                      ${(Number(provider.total_expenses) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  {provider.net_income && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">Net Income</span>
                      <span className={`font-mono ${Number(provider.net_income) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${(Number(provider.net_income) / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  )}
                  {provider.cost_per_day && (
                    <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text-muted)]">Cost/Day</span>
                      <span className="font-mono">
                        ${Number(provider.cost_per_day).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NPI Registry Data */}
            {provider.npi && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-2 mb-3">
                  <BadgeCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">NPI Registry</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">NPI</span>
                    <span className="font-mono text-blue-400">{provider.npi}</span>
                  </div>
                  {provider.authorized_official && (
                    <>
                      <div className="pt-2 border-t border-[var(--color-border)]">
                        <span className="text-xs text-[var(--color-text-muted)]">Authorized Official</span>
                        <p className="font-medium">{provider.authorized_official}</p>
                        {provider.authorized_official_title && (
                          <p className="text-sm text-[var(--color-text-muted)]">{provider.authorized_official_title}</p>
                        )}
                      </div>
                      {provider.authorized_official_phone && (
                        <div>
                          <a
                            href={`tel:${provider.authorized_official_phone}`}
                            className="text-sm text-[var(--color-turquoise-400)] hover:underline"
                          >
                            {provider.authorized_official_phone}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Nonprofit 990 Data */}
            {provider.ein && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">
                    IRS 990 ({provider.nonprofit_tax_year})
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">EIN</span>
                    <span className="font-mono">{provider.ein}</span>
                  </div>
                  {provider.nonprofit_revenue && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">990 Revenue</span>
                      <span className="font-mono text-pink-400">
                        ${(Number(provider.nonprofit_revenue) / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}
                  {provider.nonprofit_assets && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">Total Assets</span>
                      <span className="font-mono">
                        ${(Number(provider.nonprofit_assets) / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  )}
                  {provider.exec_compensation && (
                    <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text-muted)]">Exec Comp</span>
                      <span className="font-mono">
                        ${(Number(provider.exec_compensation) / 1000).toFixed(0)}K
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">Certified</span>
              <span>{formatDate(provider.certification_date)}</span>
            </div>

            {/* Census Demographics */}
            {provider.county_pop_65_plus && (
              <>
                <div className="pt-2 pb-1">
                  <span className="text-xs font-medium text-[var(--color-turquoise-400)] uppercase tracking-wider">
                    County Demographics
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">65+ Population</span>
                  <span className="font-mono text-[var(--color-turquoise-400)]">
                    {Number(provider.county_pop_65_plus).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">% 65+</span>
                  <span className={`font-mono ${Number(provider.county_pct_65_plus) >= 20 ? 'text-emerald-400' : ''}`}>
                    {provider.county_pct_65_plus}%
                  </span>
                </div>
                {provider.county_median_income && (
                  <div className="flex justify-between py-2">
                    <span className="text-[var(--color-text-muted)]">Median Income</span>
                    <span className="font-mono">
                      ${Number(provider.county_median_income).toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
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

      {/* Owner Carry-Back Analysis */}
      <div className={`glass-card rounded-2xl p-6 mb-6 ${
        carryBackAnalysis.likelihood === 'HIGH'
          ? 'border-l-4 border-l-emerald-500'
          : carryBackAnalysis.likelihood === 'MEDIUM'
          ? 'border-l-4 border-l-amber-500'
          : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            Owner Carry-Back Analysis
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-bold font-mono">{carryBackAnalysis.score}</span>
              <span className="text-sm text-[var(--color-text-muted)]">/100</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              carryBackAnalysis.likelihood === 'HIGH'
                ? 'bg-emerald-500/20 text-emerald-400'
                : carryBackAnalysis.likelihood === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {carryBackAnalysis.likelihood}
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mb-4">
          <div className="h-3 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                carryBackAnalysis.likelihood === 'HIGH'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : carryBackAnalysis.likelihood === 'MEDIUM'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600'
              }`}
              style={{ width: `${carryBackAnalysis.score}%` }}
            />
          </div>
        </div>

        {/* Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {carryBackAnalysis.factors.map((factor, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                factor.score >= 15
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : factor.score >= 8
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{factor.name}</span>
                <span className={`text-sm font-mono ${
                  factor.score >= 15
                    ? 'text-emerald-400'
                    : factor.score >= 8
                    ? 'text-amber-400'
                    : 'text-[var(--color-text-muted)]'
                }`}>
                  +{factor.score}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{factor.reason}</p>
            </div>
          ))}
        </div>

        {/* Acquisition Strategy Recommendation */}
        {carryBackAnalysis.likelihood !== 'LOW' && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[var(--color-turquoise-400)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--color-turquoise-400)] mb-1">
                  {carryBackAnalysis.likelihood === 'HIGH'
                    ? 'Prime Owner Carry-Back Candidate'
                    : 'Potential Owner Carry-Back Opportunity'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {carryBackAnalysis.likelihood === 'HIGH'
                    ? `This provider shows strong indicators for owner financing. Single/simple ownership structure,
                       no PE involvement, and ideal operational size suggest the owner may be receptive to a
                       seller note arrangement. Consider approaching with a 10-20% carry-back proposal.`
                    : `This provider has some favorable characteristics for owner financing, but may require
                       additional due diligence. Consider exploring the ownership situation further before
                       proposing seller financing terms.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/owner-carryback"
            className="text-sm text-[var(--color-turquoise-400)] hover:underline flex items-center gap-1"
          >
            View All Owner Carry-Back Opportunities
            <ChevronRight className="w-4 h-4" />
          </Link>
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
