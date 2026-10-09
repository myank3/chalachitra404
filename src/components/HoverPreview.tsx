import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Check, Star, Info, Volume2, VolumeX } from 'lucide-react';
import { getImageUrl, getDetails } from '../lib/api';
import { useHoverPreview } from '../stores/hoverPreview';
import { useWatchlist } from '../stores/watchlist';

const PREVIEW_W = 720;
const PREVIEW_H = 300;
const SHOW_DELAY_MS = 200;
const HIDE_GRACE_MS = 150;

export const HoverPreview: React.FC = () => {
  const item = useHoverPreview((s) => s.item);
  const anchorRect = useHoverPreview((s) => s.anchorRect);
  const hide = useHoverPreview((s) => s.hide);

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(false); // start unmuted — postMessage will enforce
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const inList = useWatchlist((s) =>
    item ? Boolean(s.items[`${item.media_type}-${item.id}`]) : false
  );
  const toggle = useWatchlist((s) => s.toggle);

  const { data: details } = useQuery({
    queryKey: ['hover-trailer', item?.media_type, item?.id],
    queryFn: () => getDetails(item!.media_type as any, item!.id),
    enabled: !!item,
    staleTime: 1000 * 60 * 10,
  });

  const videos = (details?.videos?.results ?? []).filter(
    (v: any) => v.site === 'YouTube' || v.site === 'Vimeo'
  );

  const vimeo = videos.find(
    (v: any) => v.site === 'Vimeo' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const yt =
    videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
    videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ??
    videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser') ??
    videos.find((v: any) => v.site === 'YouTube');

  // ⭐ YouTube: enablejsapi=1 so we can postMessage unmute commands
  // Start muted (browser policy) but the effect below unmutes as soon as possible
  const trailerSrc = vimeo
    ? `https://player.vimeo.com/video/${vimeo.key}?autoplay=1&muted=0&loop=1&background=1&playsinline=1`
    : yt
    ? `https://www.youtube-nocookie.com/embed/${yt.key}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${yt.key}&playsinline=1&rel=0&disablekb=1&fs=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : null;

  /* ⭐ Force unmute via postMessage as soon as the iframe is ready */
  useEffect(() => {
    if (!trailerSrc || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const targetOrigin = vimeo
      ? 'https://player.vimeo.com'
      : 'https://www.youtube-nocookie.com';

    // Send a burst of unMute commands — YouTube's player boots asynchronously,
    // so we spam until it responds
    const commands = [
      { event: 'command', func: 'unMute' },
      { event: 'command', func: 'setVolume', args: [100] },
    ];

    const send = () => {
      commands.forEach((c) => {
        try {
          iframe.contentWindow?.postMessage(JSON.stringify(c), targetOrigin);
        } catch {
          /* cross-origin, ignore */
        }
      });
    };

    // Fire immediately, then every 300ms for 3 seconds
    send();
    const interval = window.setInterval(send, 300);
    const stop = window.setTimeout(() => window.clearInterval(interval), 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [trailerSrc, vimeo]);

  /* ⭐ Unmute on the user's first click anywhere (browser gesture required) */
  useEffect(() => {
    if (!trailerSrc) return;

    const unlock = () => {
      setMuted(false);
      const iframe = iframeRef.current;
      if (!iframe) return;
      const targetOrigin = vimeo
        ? 'https://player.vimeo.com'
        : 'https://www.youtube-nocookie.com';
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute' }),
          targetOrigin
        );
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
          targetOrigin
        );
      } catch {
        /* ignore */
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [trailerSrc, vimeo]);

  useEffect(() => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (item && anchorRect) {
      showTimerRef.current = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    } else {
      setVisible(false);
    }
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    };
  }, [item, anchorRect]);

  /* ---------- position: above the card, animates upward ---------- */
  useLayoutEffect(() => {
    if (!anchorRect || !visible) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.left + anchorRect.width / 2 - PREVIEW_W / 2;
    let top = anchorRect.top - PREVIEW_H - 12;

    if (top < 12) {
      top = anchorRect.bottom + 12;
    }

    if (left < 12) left = 12;
    if (left + PREVIEW_W > vw - 12) left = vw - PREVIEW_W - 12;
    if (top + PREVIEW_H > vh - 12) top = vh - PREVIEW_H - 12;

    setCoords({ left, top });
  }, [anchorRect, visible]);

  /* ---------- global mousemove ---------- */
  useEffect(() => {
    if (!visible || !anchorRect) return;

    const onMove = (e: MouseEvent) => {
      const popup = popupRef.current;
      if (!popup) return;

      const x = e.clientX;
      const y = e.clientY;

      const pr = popup.getBoundingClientRect();
      const inPopup =
        x >= pr.left && x <= pr.right && y >= pr.top && y <= pr.bottom;

      const inCard =
        x >= anchorRect.left && x <= anchorRect.right &&
        y >= anchorRect.top && y <= anchorRect.bottom;

      if (inPopup || inCard) {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      } else {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => hide(), HIDE_GRACE_MS);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [visible, anchorRect, hide]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, hide]);

  if (!item) return null;

  const title = item.title || (item as any).name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const backdrop = getImageUrl(item.backdrop_path || item.poster_path, 'w1280');
  const isTV = item.media_type === 'tv';

  const goToDetails = () => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hide();
    navigate(`/${item.media_type}/${item.id}`);
  };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: 40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 26,
            mass: 0.7,
            opacity: { duration: 0.18, ease: 'easeOut' },
          }}
          style={{
            position: 'fixed',
            left: coords.left,
            top: coords.top,
            width: PREVIEW_W,
            height: PREVIEW_H,
            zIndex: 9999,
            transformOrigin: 'center bottom',
          }}
          className="
            pointer-events-auto
            rounded-2xl overflow-hidden
            border border-white/[0.1]
            bg-[#0e0e10]/95
            backdrop-blur-2xl backdrop-saturate-150
            shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.05)]
          "
        >
          <div className="flex flex-row h-full">
            <div className="relative w-[420px] h-full shrink-0 bg-black overflow-hidden">
              {trailerSrc ? (
                <>
                  <img
                    src={backdrop}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0">
                    <iframe
                      ref={iframeRef}
                      key={trailerSrc}
                      src={trailerSrc}
                      title={`${title} trailer`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen={false}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMuted((m) => !m);
                    }}
                    className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur border border-white/20 hover:border-white/40 flex items-center justify-center text-white cursor-pointer transition-all"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Volume2 className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={backdrop}
                    alt={title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
              <h3 className="text-[15px] font-semibold text-white leading-tight line-clamp-2">
                {title}
              </h3>

              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-[rgba(245,245,247,0.65)]">
                <span className="px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-400 text-[9px] font-bold tracking-wider">
                  4K
                </span>
                {item.vote_average > 0 && (
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Star
                      className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                      strokeWidth={0}
                    />
                    {item.vote_average.toFixed(1)}
                  </span>
                )}
                {year && <span>{year}</span>}
                <span className="px-1 py-px rounded border border-white/20 text-[9px] uppercase tracking-wider">
                  {isTV ? 'Series' : 'Film'}
                </span>
              </div>

              {item.overview && (
                <p className="text-[11px] leading-relaxed text-[rgba(245,245,247,0.6)] line-clamp-4">
                  {item.overview}
                </p>
              )}

              <div className="mt-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToDetails}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={0} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggle({
                      id: item.id,
                      type: item.media_type,
                      title,
                      posterPath: item.poster_path,
                      backdropPath: item.backdrop_path,
                      year,
                      rating: item.vote_average,
                      overview: item.overview,
                    })
                  }
                  className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                    inList
                      ? 'bg-[rgba(124,92,255,0.25)] border-[rgba(124,92,255,0.6)] text-[#c4b5ff]'
                      : 'bg-white/[0.05] border-white/[0.2] text-white hover:bg-white/[0.12]'
                  }`}
                >
                  {inList ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={goToDetails}
                  className="w-10 h-10 rounded-full border border-white/[0.2] bg-white/[0.05] hover:bg-white/[0.12] text-white flex items-center justify-center ml-auto cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Info className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};