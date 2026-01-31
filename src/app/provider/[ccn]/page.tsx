import { getProvider, getRelatedProviders, calculateOwnerCarryBackScore, getSimilarProviders, getDataQualityScore } from '@/lib/db';
import { ProviderDetailClient } from '@/components/ProviderDetailClient';
import { notFound } from 'next/navigation';

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
  const similarProviders = await getSimilarProviders(ccn, 5);
  const dataQuality = await getDataQualityScore(ccn);
  const carryBackAnalysis = calculateOwnerCarryBackScore(provider);

  return (
    <ProviderDetailClient
      provider={provider}
      relatedProviders={relatedProviders}
      similarProviders={similarProviders || []}
      dataQuality={dataQuality}
      carryBackAnalysis={carryBackAnalysis}
    />
  );
}
