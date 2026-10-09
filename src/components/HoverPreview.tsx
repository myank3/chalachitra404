import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { getImageUrl, getDetails } from '../lib/api';
import { useHoverPreview } from '../stores/hoverPreview';
import { useWatchlist } from '../stores/watchlist';

const PREVIEW_W = 380;
const PREVIEW_H = 380;
const SHOW_DELAY_MS = 0;
const HIDE_GRACE_MS = 80;
const GAP = 10;
const EDGE_PAD = 8;

type Side = 'top' | 'bottom' | 'left' | 'right';

export const HoverPreview: React.FC = () => {
  const item = useHoverPreview((s) => s.item);
  const anchorRect = useHoverPreview((s) => s.anchorRect);
  const hide = useHoverPreview((s) => s.hide);

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [side, setSide] = useState<Side>('right');

  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const playerReadyRef = useRef(false);

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

  const trailerSrc = vimeo
    ? `https://player.vimeo.com/video/${vimeo.key}?autoplay=1&muted=0&loop=1&background=1&playsinline=1`
    : yt
    ? `https://www.youtube-nocookie.com/embed/${yt.key}?autoplay=1&mute=0&controls=0&modestbranding=1&loop=1&playlist=${yt.key}&playsinline=1&rel=0&disablekb=1&fs=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : null;

  /* ---------- Post message to iframe with retry ---------- */
  const postCmd = (func: string, args?: any[]) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const targetOrigin = vimeo
      ? 'https://player.vimeo.com'
      : 'https://www.youtube-nocookie.com';
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args: args ?? [] }),
        targetOrigin
      );
    } catch {}
  };

  /* ---------- Force PLAY on mount + retries ---------- */
  useEffect(() => {
    if (!trailerSrc) return;
    playerReadyRef.current = false;

    const playCommands = [
      () => postCmd('playVideo'),
      () => postCmd('unMute'),
      () => postCmd('setVolume', [100]),
    ];

    // Burst — YouTube's embed API isn't ready instantly
    const fire = () => {
      playCommands.forEach((fn) => fn());
      playerReadyRef.current = true;
    };

    fire();
    const fast = window.setInterval(fire, 200);
    const stopFast = window.setTimeout(() => window.clearInterval(fast), 1500);

    // Slow heartbeat to keep it playing through loops
    const slow = window.setInterval(fire, 2000);

    return () => {
      window.clearInterval(fast);
      window.clearInterval(slow);
      window.clearTimeout(stopFast);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailerSrc, vimeo]);

  /* ---------- Mute toggle side-effect ---------- */
  useEffect(() => {
    if (!trailerSrc) return;
    if (muted) {
      postCmd('mute');
    } else {
      postCmd('unMute');
      postCmd('setVolume', [100]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted, trailerSrc]);

  /* ---------- Play/Pause toggle side-effect ---------- */
  useEffect(() => {
    if (!trailerSrc) return;
    if (playing) {
      postCmd('playVideo');
    } else {
      postCmd('pauseVideo');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, trailerSrc]);

  /* ---------- Fast scroll detection ---------- */
  useEffect(() => {
    const onScroll = () => {
      isScrollingRef.current = true;
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(() => {
        isScrollingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  /* ---------- Instant show ---------- */
  useEffect(() => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (item && anchorRect && !isScrollingRef.current) {
      showTimerRef.current = window.setTimeout(() => {
        setPlaying(true);
        setVisible(true);
      }, SHOW_DELAY_MS);
    } else {
      setVisible(false);
    }
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    };
  }, [item, anchorRect]);

  /* ---------- Smart 4-side positioning ---------- */
  useLayoutEffect(() => {
    if (!anchorRect || !visible) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceTop    = anchorRect.top;
    const spaceBottom = vh - anchorRect.bottom;
    const spaceLeft   = anchorRect.left;
    const spaceRight  = vw - anchorRect.right;

    const needV = PREVIEW_H + GAP + EDGE_PAD;
    const needH = PREVIEW_W + GAP + EDGE_PAD;

    const fitsTop    = spaceTop    >= needV;
    const fitsBottom = spaceBottom >= needV;
    const fitsLeft   = spaceLeft   >= needH;
    const fitsRight  = spaceRight  >= needH;

    const scoreTop    = fitsTop    ? spaceTop    * 1.0  : -1;
    const scoreBottom = fitsBottom ? spaceBottom * 1.0  : -1;
    const scoreLeft   = fitsLeft   ? spaceLeft   * 0.85 : -1;
    const scoreRight  = fitsRight  ? spaceRight  * 0.85 : -1;

    const candidates: [Side, number][] = [
      ['top',    scoreTop],
      ['bottom', scoreBottom],
      ['left',   scoreLeft],
      ['right',  scoreRight],
    ];
    candidates.sort((a, b) => b[1] - a[1]);

    let chosenSide: Side = candidates[0][1] >= 0 ? candidates[0][0] : 'right';

    if (candidates[0][1] < 0) {
      const fallback: [Side, number][] = [
        ['top',    spaceTop],
        ['bottom', spaceBottom],
        ['left',   spaceLeft],
        ['right',  spaceRight],
      ];
      fallback.sort((a, b) => b[1] - a[1]);
      chosenSide = fallback[0][0];
    }

    const cardCenterX = anchorRect.left + anchorRect.width / 2;
    const cardCenterY = anchorRect.top + anchorRect.height / 2;

    let left = 0;
    let top = 0;

    switch (chosenSide) {
      case 'top':
        top = anchorRect.top - PREVIEW_H - GAP;
        left = cardCenterX - PREVIEW_W / 2;
        break;
      case 'bottom':
        top = anchorRect.bottom + GAP;
        left = cardCenterX - PREVIEW_W / 2;
        break;
      case 'left':
        left = anchorRect.left - PREVIEW_W - GAP;
        top = cardCenterY - PREVIEW_H / 2;
        break;
      case 'right':
        left = anchorRect.right + GAP;
        top = cardCenterY - PREVIEW_H / 2;
        break;
    }

    if (left < EDGE_PAD) left = EDGE_PAD;
    if (left + PREVIEW_W > vw - EDGE_PAD) left = vw - PREVIEW_W - EDGE_PAD;
    if (top < EDGE_PAD) top = EDGE_PAD;
    if (top + PREVIEW_H > vh - EDGE_PAD) top = vh - PREVIEW_H - EDGE_PAD;

    setSide(chosenSide);
    setCoords({ left, top });
  }, [anchorRect, visible]);

  /* ---------- Hover-out (rAF-throttled) ---------- */
  useEffect(() => {
    if (!visible || !anchorRect) return;

    let raf = 0;
    let lastInside = true;

    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const popup = popupRef.current;
        if (!popup) return;

        const x = e.clientX, y = e.clientY;
        const pr = popup.getBoundingClientRect();
        const inPopup = x >= pr.left && x <= pr.right && y >= pr.top && y <= pr.bottom;
        const inCard =
          x >= anchorRect.left && x <= anchorRect.right &&
          y >= anchorRect.top && y <= anchorRect.bottom;

        const inside = inPopup || inCard;
        if (inside === lastInside) return;
        lastInside = inside;

        if (inside) {
          if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
        } else {
          if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
          hideTimerRef.current = window.setTimeout(() => hide(), HIDE_GRACE_MS);
        }
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
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
  const image = getImageUrl(item.backdrop_path || item.poster_path, 'w780');
  const isTV = item.media_type === 'tv';

  const matchPct = 70 + ((item.id * 7) % 30);
  const maturity = ['U/A 13+', 'U/A 16+', 'A', 'U/A 7+'][item.id % 4];

  const genreNames = (details?.genres ?? [])
    .slice(0, 3)
    .map((g: any) => g.name)
    .join(' • ');

  const goToDetails = () => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hide();
    navigate(`/${item.media_type}/${item.id}`);
  };

  const initialBySide: Record<Side, any> = {
    top:    { opacity: 0, y:  6, scale: 0.985 },
    bottom: { opacity: 0, y: -6, scale: 0.985 },
    left:   { opacity: 0, x:  6, scale: 0.985 },
    right:  { opacity: 0, x: -6, scale: 0.985 },
  };
  const exitBySide: Record<Side, any> = {
    top:    { opacity: 0, y:  3, scale: 0.992 },
    bottom: { opacity: 0, y: -3, scale: 0.992 },
    left:   { opacity: 0, x:  3, scale: 0.992 },
    right:  { opacity: 0, x: -3, scale: 0.992 },
  };
  const transformOriginBySide: Record<Side, string> = {
    top:    'center bottom',
    bottom: 'center top',
    left:   'right center',
    right:  'left center',
  };

  return createPortal(
    <AnimatePresence mode="popLayout">
      {visible && (
        <motion.div
          ref={popupRef}
          key={`${side}-${item.id}`}
          initial={initialBySide[side]}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={exitBySide[side]}
          transition={{
            type: 'tween',
            duration: 0.14,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: 'fixed',
            left: coords.left,
            top: coords.top,
            width: PREVIEW_W,
            height: PREVIEW_H,
            zIndex: 9999,
            transformOrigin: transformOriginBySide[side],
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            contain: 'layout paint style',
          }}
          className="
            pointer-events-auto
            rounded-md overflow-hidden
            bg-[#181818]
            shadow-[0_20px_60px_-12px_rgba(0,0,0,0.95)]
          "
        >
          {/* ---- Media area ---- */}
          <div className="relative w-full h-[210px] bg-black overflow-hidden">
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
              draggable={false}
              decoding="async"
            />

            {trailerSrc && (
              <iframe
                ref={iframeRef}
                key={trailerSrc}
                src={trailerSrc}
                title={`${title} trailer`}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen={false}
                style={{ pointerEvents: 'none' }}
              />
            )}

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181818] via-[#181818]/70 to-transparent pointer-events-none" />

            {/* Control cluster — play + mute */}
            {trailerSrc && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                {/* Force Play / Pause */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaying((p) => !p);
                  }}
                  aria-label={playing ? 'Pause' : 'Play'}
                  title={playing ? 'Pause' : 'Play'}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/25 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  {playing ? (
                    // Pause icon (two bars)
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" strokeWidth={0} />
                  )}
                </button>

                {/* Mute toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted((m) => !m);
                  }}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  title={muted ? 'Unmute' : 'Mute'}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/25 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  {muted ? (
                    <VolumeX className="w-3.5 h-3.5" strokeWidth={2.2} />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ---- Info area ---- */}
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={goToDetails}
                aria-label="Play"
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/85 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={0} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle({
                    id: item.id,
                    type: item.media_type,
                    title,
                    posterPath: item.poster_path,
                    backdropPath: item.backdrop_path,
                    year,
                    rating: item.vote_average,
                    overview: item.overview,
                  });
                }}
                aria-label={inList ? 'Remove from list' : 'Add to list'}
                className="w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center text-white hover:border-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                {inList ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Plus className="w-4 h-4" strokeWidth={2.2} />
                )}
              </button>

              <button
                type="button"
                aria-label="Like"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center text-white hover:border-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={goToDetails}
                aria-label="More info"
                className="ml-auto w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center text-white hover:border-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[12px] text-white/70 mb-2">
              <span className="text-emerald-400 font-semibold">{matchPct}% Match</span>
              <span className="px-1 py-px border border-white/40 text-[10px] font-medium text-white/80">
                {maturity}
              </span>
              <span>{year}</span>
              {isTV && <span className="text-white/60">Series</span>}
            </div>

            {genreNames && (
              <p className="text-[12px] text-white/60 mb-3 truncate">
                {genreNames}
              </p>
            )}

            <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};