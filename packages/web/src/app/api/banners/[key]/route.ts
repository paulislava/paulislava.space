import { getBannerConfig } from '@/lib/banner-config';
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const config = await getBannerConfig((await params).key);
    return Response.json(config || {}, { status: config ? 200 : 404, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return Response.json({}, { status: 503, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
  }
}
