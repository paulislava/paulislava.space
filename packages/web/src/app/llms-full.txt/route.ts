import { buildLlmsFull, getLlmsSnapshot } from '@/lib/llms';

export const revalidate = 1800;

export async function GET() {
  const snapshot = await getLlmsSnapshot();
  const body = buildLlmsFull(snapshot);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800',
    },
  });
}
