'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { StrapiMedia, mediaUrl } from '@/lib/strapi-types';

export default function ProjectScreenshots({ screenshots }: { screenshots: StrapiMedia[] }) {
  const [index, setIndex] = useState(-1);

  const slides = screenshots.map((s) => ({
    src: mediaUrl(s, 'large') ?? mediaUrl(s) ?? '',
    alt: s.alternativeText ?? '',
  }));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {screenshots.map((s, i) => {
          const thumb = mediaUrl(s, 'small') ?? mediaUrl(s, 'large') ?? mediaUrl(s) ?? '';
          return (
            <button
              key={s.documentId}
              type="button"
              onClick={() => setIndex(i)}
              className="group relative aspect-video rounded-xl overflow-hidden bg-[#12121a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            >
              <Image
                src={thumb}
                alt={s.alternativeText ?? ''}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm-2 3l4 4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 8v6M8 11h6" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        styles={{ container: { backgroundColor: 'rgba(0,0,0,0.92)' } }}
      />
    </>
  );
}
