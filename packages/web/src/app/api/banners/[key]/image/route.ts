import { getBannerConfig } from '@/lib/banner-config';
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const fallback = new URL('/banner.gif', request.url);
  try {
    const config = await getBannerConfig((await params).key);
    if (config?.enabled === false) return new Response(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), { headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=60' } });
    const raw = typeof config?.gifUrl === 'string' ? config.gifUrl : '';
    const destination = raw ? new URL(raw, process.env.STRAPI_URL || 'https://cms.paulislava.space') : fallback;
    if (!['http:', 'https:'].includes(destination.protocol)) return Response.redirect(fallback, 307);
    return new Response(null, { status: 307, headers: { Location: destination.href, 'Cache-Control': 'public, max-age=60' } });
  } catch { return Response.redirect(fallback, 307); }
}
