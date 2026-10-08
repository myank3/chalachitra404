import React, { useState } from 'react';
import { useImdbId } from '../hooks/useImdbId';
import { useEmbedHealth } from '../hooks/useEmbedHealth';
import {
  PROVIDERS,
  buildEmbedUrl,
  MediaType,
} from '../lib/embedProviders';

interface MoviePlayerProps {
  id: string | number;
  type: MediaType;
  title: string;
  season?: number;
  episode?: number;
  initialImdbId?: string;
  onClose?: () => void;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({
  id,
  type,
  title,
  season = 1,
  episode = 1,
  initialImdbId,
  onClose,
}) => {
  const { imdbId, loading: resolvingImdb } = useImdbId(id, type, initialImdbId);

  const [activeProviderId, setActiveProviderId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`chalachitra:provider:${id}`);
        if (saved && PROVIDERS.some((p) => p.id === saved)) return saved;
        const globalSaved = localStorage.getItem('chalachitra:default_provider');
        if (globalSaved && PROVIDERS.some((p) => p.id === globalSaved)) return globalSaved;
      } catch {}
    }
    return 'imdbsu';
  });

  const activeProvider =
    PROVIDERS.find((p) => p.id === activeProviderId) || PROVIDERS[0];

  const embedUrl = imdbId
    ? buildEmbedUrl(activeProvider, type, imdbId, season, episode)
    : '';

  const { status, setReady } = useEmbedHealth(embedUrl, 6000);

  const handleProviderSelect = (providerId: string) => {
    setActiveProviderId(providerId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`chalachitra:provider:${id}`, providerId);
        localStorage.setItem('chalachitra:default_provider', providerId);
      } catch {}
    }
  };

  const handleIframeLoad = () => {
    setReady();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`chalachitra:provider:${id}`, activeProviderId);
        localStorage.setItem('chalachitra:default_provider', activeProviderId);
      } catch {}
    }
  };

  if (!imdbId && !resolvingImdb) {
    return (
      <div className="w-full flex flex-col bg-gradient-to-b from-[#0a0a0b] to-[#000000] text-[#f5f5f7] rounded-xl overflow-hidden border border-white/[0.06]">
        {onClose && (
          <div className="flex justify-end p-3 border-b border-white/[0.06] bg-black/40 backdrop-blur-sm">
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        )}
        <div className="w-full aspect-video min-h-[360px] md:min-h-[500px] bg-[#000000] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <svg className="w-7 h-7 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/60">No stream available</p>
            <p className="text-xs text-white/30 mt-1">IMDb ID could not be resolved for this title</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-[#000000] text-[#f5f5f7] rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">
      {/* Provider Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-[#0a0a0b] to-[#0f0f11] border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
              Source
            </span>
          </div>

          <div className="h-4 w-px bg-white/[0.06]" />

          <div className="flex items-center gap-1">
            {PROVIDERS.map((provider) => {
              const isSelected = activeProviderId === provider.id;
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleProviderSelect(provider.id)}
                  className={`relative px-3 py-1.5 text-[11px] rounded-lg font-medium transition-all duration-200 border cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                      : 'bg-transparent text-white/50 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.12]'
                  }`}
                >
                  {provider.name}
                  {isSelected && (
                    <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4 h-px bg-white/50 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status + Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {status === 'loading' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider">
                  Connecting
                </span>
              </>
            )}
            {status === 'ready' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-wider">
                  Live
                </span>
              </>
            )}
            {status === 'failed' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                </span>
                <span className="text-[10px] font-medium text-red-400/80 uppercase tracking-wider">
                  Offline
                </span>
              </>
            )}
          </div>

          {onClose && (
            <>
              <div className="h-4 w-px bg-white/[0.06]" />
              <button
                type="button"
                onClick={onClose}
                className="group flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-white/50 hover:text-white bg-transparent hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-all duration-200 cursor-pointer"
              >
                <svg className="w-3 h-3 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Close
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Iframe Container */}
      <div
        className="relative w-full aspect-video min-h-[360px] md:min-h-[500px] bg-[#000000]"
        style={{ backgroundColor: '#000000' }}
      >
        {/* Loading overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#000000] gap-4 pointer-events-none">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white/[0.06] border-t-white/40 animate-spin" />
            </div>
            <p className="text-xs text-white/40 font-medium tracking-wide">
              Loading stream...
            </p>
          </div>
        )}

        <iframe
          src={embedUrl}
          title={title}
          onLoad={handleIframeLoad}
          style={{ border: 0, width: '100%', height: '100%' }}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
          allowFullScreen
          referrerPolicy="origin"
          loading="lazy"
        />
      </div>

      {/* Fallback bar when failed */}
      {status === 'failed' && imdbId && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#111113] to-[#0f0f11] border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-xs text-white/50">
              Stream unresponsive — try another source
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {PROVIDERS.filter((p) => p.id !== activeProviderId)
              .slice(0, 3)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderSelect(p.id)}
                  className="px-2.5 py-1 text-[11px] font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.10] rounded-md border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};