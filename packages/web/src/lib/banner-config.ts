import 'server-only';
export async function getBannerConfig(key: string): Promise<Record<string, unknown> | null> {
  if (!/^[a-f0-9-]{36}$/.test(key)) return null;
  const base = process.env.STRAPI_URL || 'https://cms.paulislava.space';
  const response = await fetch(`${base}/api/footer-banners/config/${key}`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Banner CMS returned ${response.status}`);
  return response.json();
}
