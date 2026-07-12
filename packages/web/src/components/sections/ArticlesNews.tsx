'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import { Article, NewsItem } from '@/lib/strapi-types';
import ArticleCard from '@/components/ui/ArticleCard';

interface ArticlesNewsProps {
  articles: Article[];
  news: NewsItem[];
}

export default function ArticlesNews({ articles, news }: ArticlesNewsProps) {
  const [tab, setTab] = useState<'articles' | 'news'>('articles');
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const hasContent = articles.length > 0 || news.length > 0;
  const activeItems = articles.length > 0 && (news.length === 0 || tab === 'articles') ? articles : news;
  const activeType = articles.length > 0 && (news.length === 0 || tab === 'articles') ? 'article' : 'news';

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    swiper.slideTo(0);
    swiper.update();
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, [tab, articles.length, news.length]);

  if (!hasContent) return null;

  return (
    <section id="articles" className="py-24 overflow-hidden">
      <div className="max-w-6xl px-6 mx-auto">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Экспертные разборы</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">
              Статьи, где я объясняю архитектурные и инженерные решения
            </h2>
            <p className="mt-3 text-[#94a3b8] max-w-2xl">
              Практические темы: frontend, архитектура, platform engineering и AI.
            </p>
          </div>
          {articles.length > 0 && (
            <Link
              href="/articles"
              className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors font-mono hidden sm:block"
            >
              Все статьи →
            </Link>
          )}
        </div>

        {articles.length > 0 && news.length > 0 && (
          <div className="flex gap-4 mb-8">
            {(['articles', 'news'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-[#6366f1] text-white' : 'glass text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                {t === 'articles' ? `Статьи (${articles.length})` : `Новости (${news.length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative px-6">
        {!isBeginning && (
          <>
            <div
              className="absolute left-0 inset-y-0 w-16 sm:w-40 z-10 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at left center, #0a0a0f 0%, transparent 70%)' }}
            />
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass items-center justify-center text-[#94a3b8] cursor-pointer hover:text-[#6366f1] hover:border-[#6366f1]/50 transition-all duration-200"
              aria-label="Предыдущий материал"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}

        <div className="max-w-6xl mx-auto">
          <Swiper
            key={activeType}
            modules={[A11y]}
            spaceBetween={20}
            slidesPerView={1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 2.5 },
            }}
            className="!overflow-visible"
          >
            {activeItems.map((item) => (
              <SwiperSlide key={item.documentId}>
                <ArticleCard item={item} type={activeType} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {!isEnd && (
          <>
            <div
              className="absolute right-0 inset-y-0 w-16 sm:w-40 z-10 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right center, #0a0a0f 0%, transparent 70%)' }}
            />
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="flex absolute cursor-pointer right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass items-center justify-center text-[#94a3b8] hover:text-[#6366f1] hover:border-[#6366f1]/50 transition-all duration-200"
              aria-label="Следующий материал"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {articles.length > 0 && (
        <div className="mt-8 text-center sm:hidden px-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors duration-200"
          >
            Все статьи →
          </Link>
        </div>
      )}
    </section>
  );
}
