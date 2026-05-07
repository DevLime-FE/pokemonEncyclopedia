"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import RegionCard from './RegionCard';
import { Region } from '../services/pokeapi';

interface HomeContentProps {
  regions: Region[];
}

export default function HomeContent({ regions }: HomeContentProps) {
  const { t } = useTranslation();

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <header className="mb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-mono uppercase tracking-widest text-yellow-400 leading-snug" style={{ textShadow: '4px 4px 0px #3B4CCA, -2px -2px 0px #3B4CCA, 2px -2px 0px #3B4CCA, -2px 2px 0px #3B4CCA, 2px 2px 0px #3B4CCA' }}>
          {t("Pokemon Battle Simulator")}
        </h1>
        <p className="mt-8 text-black font-mono text-sm sm:text-base bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">{t("Select a region to choose your Pokemon!")}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {regions.map((region) => (
          <RegionCard key={region.name} name={region.name} />
        ))}
      </div>
    </main>
  );
}
