'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { StrapiMedia, mediaUrl } from '@/lib/strapi-types';

export default function ProjectScreenshots({ screenshots }: { screenshots: StrapiMedia[] }) {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={16}
      className="rounded-2xl overflow-hidden"
      style={{ '--swiper-theme-color': '#6366f1' } as React.CSSProperties}
    >
      {screenshots.map((s) => {
        const url = mediaUrl(s, 'large') ?? mediaUrl(s) ?? '';
        return (
          <SwiperSlide key={s.documentId}>
            <div className="relative aspect-video bg-[#12121a]">
              <Image src={url} alt={s.alternativeText ?? ''} fill className="object-cover" />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
