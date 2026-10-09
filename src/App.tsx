/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUIStore, NavTab } from './stores/useUIStore';
import { useWatchlist } from './stores/watchlist';
import { useDetails } from './lib/api';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { DetailSheet } from './components/DetailSheet';
import { CinemaPlayer } from './components/CinemaPlayer';
import { AmbientBackground } from './components/AmbientBackground';
import { PageTransition } from './components/PageTransition';
import { Onboarding } from './components/Onboarding';
import { HoverPreview } from './components/HoverPreview';

import { Home } from './pages/Home';
import { MoviesPage } from './pages/MoviesPage';
import { TVShowsPage } from './pages/TVShowsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { GenresPage } from './pages/GenresPage';
import { WatchMovie } from './pages/WatchMovie';
import { WatchTV } from './pages/WatchTV';
import { DetailPage } from './pages/DetailPage';
import { RecommendPage } from './pages/RecommendPage';
import { SearchPage } from './pages/Search';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RouteSync() {
  const location = useLocation();
  const { setActiveTab } = useUIStore();

  useEffect(() => {
    const path = location.pathname;
    let tab: NavTab = 'home';

    if (path === '/' || path === '') tab = 'home';
    else if (path.startsWith('/movies')) tab = 'movies';
    else if (path.startsWith('/tv')) tab = 'tv';
    else if (path.startsWith('/genres')) tab = 'genres';
    else if (path.startsWith('/my-list') || path.startsWith('/watchlist'))
      tab = 'watchlist';
    else if (path.startsWith('/recommend')) tab = 'recommend';

    setActiveTab(tab);
  }, [location.pathname, setActiveTab]);

  return null;
}

function HistoryRecorder() {
  const location = useLocation();
  const recordHistory = useWatchlist((s) => s.recordHistory);

  const match = location.pathname.match(/^\/watch\/(movie|tv)\/(\d+)/);
  const type = match?.[1] as 'movie' | 'tv' | undefined;
  const id = match?.[2];

  const params = new URLSearchParams(location.search);
  const season = Number(params.get('s') || 1);
  const episode = Number(params.get('e') || 1);

  const { data: item } = useDetails(type ?? null, id ?? null);

  useEffect(() => {
    if (!type || !id) return;

    console.log('[HistoryRecorder] recording', type, id, item?.title);

    recordHistory({
      id: item?.id ?? Number(id),
      type,
      title: item?.title ?? item?.name ?? 'Unknown',
      posterPath: item?.poster_path ?? null,
      backdropPath: item?.backdrop_path ?? null,
      year: String(item?.release_date ?? item?.first_air_date ?? '').slice(0, 4),
      rating: item?.vote_average ?? 0,
      overview: item?.overview,
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      progress: 0.05,
    });
  }, [item, type, id, season, episode, recordHistory]);

  return null;
}

function AppLayout() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0b] text-[#f5f5f7] antialiased selection:bg-[#7c5cff]/30 selection:text-white flex flex-col">
      <AmbientBackground />
      <Onboarding />
      <Navbar />

      <main className="min-w-0 flex-1 pt-14 md:pt-16 flex flex-col">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/tv" element={<TVShowsPage />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/search" element={<SearchPage />} />

            <Route path="/my-list" element={<WatchlistPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />

            <Route path="/movie/:id" element={<DetailPage type="movie" />} />
            <Route path="/tv/:id" element={<DetailPage type="tv" />} />

            <Route path="/watch/movie/:id" element={<WatchMovie />} />
            <Route path="/watch/tv/:id" element={<WatchTV />} />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      <Footer />
      <CommandPalette />
      <DetailSheet />
      <CinemaPlayer />

      {/* Global hover preview — shows YouTube trailer on card hover */}
      <HoverPreview />

      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          className:
            'bg-[#17171a] text-[#f5f5f7] border border-white/[0.08] border-l-2 border-l-[#7c5cff] shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-xl py-2.5 px-3.5 text-xs font-medium',
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteSync />
        <HistoryRecorder />
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}