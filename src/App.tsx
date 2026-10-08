/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUIStore, NavTab } from './stores/useUIStore';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { DetailSheet } from './components/DetailSheet';
import { CinemaPlayer } from './components/CinemaPlayer';
import { AmbientBackground } from './components/AmbientBackground';
import { PageTransition } from './components/PageTransition';
import { Onboarding } from './components/Onboarding';

// Pages
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

/**
 * Syncs the Zustand activeTab with the current URL.
 * When the URL changes, activeTab updates so the navbar highlights correctly.
 */
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

function AppLayout() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0b] text-[#f5f5f7] antialiased selection:bg-[#7c5cff]/30 selection:text-white flex flex-col">
      {/* 1. Ambient background */}
      <AmbientBackground />

      {/* 2. First-visit onboarding */}
      <Onboarding />

      {/* 3. Fixed header */}
      <Navbar />

      {/* 4. Main content */}
      <main className="min-w-0 flex-1 pt-14 md:pt-16 flex flex-col">
        <PageTransition>
          <Routes>
            {/* Primary tabs */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/tv" element={<TVShowsPage />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* My List */}
            <Route path="/my-list" element={<WatchlistPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />

            {/* Detail pages */}
            <Route path="/movie/:id" element={<DetailPage type="movie" />} />
            <Route path="/tv/:id" element={<DetailPage type="tv" />} />

            {/* Watch pages */}
            <Route path="/watch/movie/:id" element={<WatchMovie />} />
            <Route path="/watch/tv/:id" element={<WatchTV />} />

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Global overlays */}
      <CommandPalette />
      <DetailSheet />
      <CinemaPlayer />

      {/* 7. Toasts */}
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
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}