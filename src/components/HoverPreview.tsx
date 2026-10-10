import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { getImageUrl, getDetails } from '../lib/api';
import { useHoverPreview } from '../stores/hoverPreview';

const PREVIEW_W = 360;
const PREVIEW_H = 340;
const SHOW_DELAY_MS = 0;
const HIDE_GRACE_MS = 80;
const GAP = 10;
const EDGE_PAD = 8;

type Side = 'top' | 'bottom' | 'left' | 'right';

/* -------- Global preconnect: fires once at module load -------- */
if (typeof document !== 'undefined') {
  const origins = [
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
    'https://i.ytimg.com',
    'https://googlevideo.com',
  ];
  origins.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

export const HoverPreview: React.FC = () => {
  const item = useHoverPreview((s) => s.item);
  const anchorRect = useHoverPreview((s) => s.anchorRect);
  const hide = useHoverPreview((s) => s.hide);

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [side, setSide] = useState<Side>('right');

  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  /* ---------- Details query — only when the preview is visible ---------- */
  const { data: details } = useQuery({
    queryKey: ['hover-trailer', item?.media_type, item?.id],
    queryFn: () => getDetails(item!.media_type as any, item!.id),
    enabled: !!item && visible,
    staleTime: 1000 * 60 * 10,
  });

  const videos = (details?.videos?.results ?? []).filter(
    (v: any) => v.site === 'YouTube'
  );

  const yt =
    videos.find((v: any) => v.type === 'Trailer' && v.official) ??
    videos.find((v: any) => v.type === 'Trailer') ??
    videos.find((v: any) => v.type === 'Teaser') ??
    videos[0];

  // Fast-loading YouTube embed:
  // - mute=1 → guaranteed autoplay (no browser block)
  // - controls=0, modestbranding=1 → minimal chrome
  // - rel=0, disablekb=1, fs=0 → no extra UI
  // - playsinline=1 → inline on mobile
  // - iv_load_policy=3 → no annotations
  // - enablejsapi=1 → lets us unmute + nudge playback via postMessage
  // - origin + widget_referrer → keeps YouTube's internal checks happy
  const trailerSrc = yt
    ? `https://www.youtube-nocookie.com/embed/${yt.key}` +
      `?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${yt.key}` +
      `&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1` +
      `&origin=${encodeURIComponent(window.location.origin)}` +
      `&widget_referrer=${encodeURIComponent(window.location.origin)}`
    : null;

  /* ---------- Post message to YouTube ---------- */
  const postCmd = (func: string, args?: any[]) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args: args ?? [] }),
        'https://www.youtube-nocookie.com'
      );
    } catch {}
  };

  /* ---------- Force play + unmute with retries ---------- */
  useEffect(() => {
    if (!trailerSrc) return;

    const fire = () => {
      postCmd('playVideo');
      postCmd('unMute');
      postCmd('setVolume', [100]);
       postCmd('unloadModule', ['captions']); // ← this kills captions
  postCmd('unloadModule', ['cc']);  
    };

    fire();
    const fast = window.setInterval(fire, 120);
    const stopFast = window.setTimeout(() => window.clearInterval(fast), 1200);
    const slow = window.setInterval(fire, 2000);

    return () => {
      window.clearInterval(fast);
      window.clearInterval(slow);
      window.clearTimeout(stopFast);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailerSrc]);

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

  /* ---------- Show / hide ---------- */
  useEffect(() => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    if (item && anchorRect && !isScrollingRef.current) {
      showTimerRef.current = window.setTimeout(() => {
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
          onClick={goToDetails}
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
            cursor: 'pointer',
          }}
          className="
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
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen={false}
                style={{ pointerEvents: 'none' }}
              />
            )}

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181818] via-[#181818]/70 to-transparent pointer-events-none" />
          </div>

          {/* ---- Info area ---- */}
          <div className="px-4 pt-2.5 pb-3">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[12px] text-white/70 mb-1.5">
              <span className="text-emerald-400 font-semibold">{matchPct}% Match</span>
              <span className="px-1 py-px border border-white/40 text-[10px] font-medium text-white/80">
                {maturity}
              </span>
              <span>{year}</span>
              {isTV && <span className="text-white/60">Series</span>}
            </div>

            {genreNames && (
              <p className="text-[12px] text-white/60 mb-1.5 truncate">
                {genreNames}
              </p>
            )}

            <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-1">
              {title}
            </h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};