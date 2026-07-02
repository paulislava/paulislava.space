export const YANDEX_METRIKA_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ?? '110323550');

type YandexMetrika = (
  counterId: number,
  method: 'reachGoal',
  target: string,
  params?: Record<string, unknown>,
) => void;

export function reachMetrikaGoal(target: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !YANDEX_METRIKA_ID) return;

  const ym = (window as unknown as { ym?: YandexMetrika }).ym;
  ym?.(YANDEX_METRIKA_ID, 'reachGoal', target, params);
}
