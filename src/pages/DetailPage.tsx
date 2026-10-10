import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Star,
  Video,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  useDetails,
  getImageUrl,
  TMDB_API_KEY,
  TMDB_BASE_URL,
} from '../lib/api';
import { useSeasonDetails } from '../hooks/useEpisodes';
import { useUIStore } from '../stores/useUIStore';
import { WatchlistButton } from '../components/WatchlistButton';
import { MediaType } from '../types';
import { recordHistory } from '../lib/recommend';
import { Mascot } from '../components/Mascot';

interface DetailPageProps {
  type?: MediaType;
}

/* ────────────────────────────────────────────────
   Static maps
   ──────────────────────────────────────────────── */
const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics',
};

/* ────────────────────────────────────────────────
   Related fetch
   ──────────────────────────────────────────────── */
async function fetchRelated(
  type: MediaType,
  id: string,
  collectionId?: number
): Promise<any[]> {
  const u = (path: string, extra = '') =>
    `${TMDB_BASE_URL}${path}?api_key=${TMDB_API_KEY}&language=en-US${extra}`;

  if (type === 'movie' && collectionId) {
    try {
      const res = await fetch(u(`/collection/${collectionId}`));
      if (res.ok) {
        const data = await res.json();
        const parts = (data?.parts ?? [])
          .filter((p: any) => p.id !== Number(id))
          .sort(
            (a: any, b: any) =>
              new Date(a.release_date || 0).getTime() -
              new Date(b.release_date || 0).getTime()
          );
        if (parts.length > 0) return parts;
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const [recRes, simRes] = await Promise.allSettled([
      fetch(u(`/${type}/${id}/recommendations`, '&page=1')),
      fetch(u(`/${type}/${id}/similar`, '&page=1')),
    ]);

    const a: any[] =
      recRes.status === 'fulfilled' && recRes.value.ok
        ? (await recRes.value.json()).results ?? []
        : [];
    const b: any[] =
      simRes.status === 'fulfilled' && simRes.value.ok
        ? (await simRes.value.json()).results ?? []
        : [];

    const seen = new Set<number>();
    const merged: any[] = [];
    for (const item of [...a, ...b]) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
    return merged;
  } catch {
    return [];
  }
}

/* ────────────────────────────────────────────────
   Person fetch
   ──────────────────────────────────────────────── */
async function fetchPersonWork(personId: number) {
  const u = (path: string, extra = '') =>
    `${TMDB_BASE_URL}${path}?api_key=${TMDB_API_KEY}&language=en-US${extra}`;

  const [personRes, movieRes, tvRes, extRes] = await Promise.allSettled([
    fetch(u(`/person/${personId}`)),
    fetch(u(`/person/${personId}/movie_credits`)),
    fetch(u(`/person/${personId}/tv_credits`)),
    fetch(u(`/person/${personId}/external_ids`)),
  ]);

  const person =
    personRes.status === 'fulfilled' && personRes.value.ok
      ? await personRes.value.json()
      : null;

  const movieCredits =
    movieRes.status === 'fulfilled' && movieRes.value.ok
      ? await movieRes.value.json()
      : null;

  const tvCredits =
    tvRes.status === 'fulfilled' && tvRes.value.ok
      ? await tvRes.value.json()
      : null;

  const external =
    extRes.status === 'fulfilled' && extRes.value.ok
      ? await extRes.value.json()
      : null;

  const normalize = (arr: any[] = []) =>
    arr.map((c: any) => ({
      ...c,
      media_type: c.media_type || (c.first_air_date ? 'tv' : 'movie'),
    }));

  const movieCrew = normalize(movieCredits?.crew ?? []);
  const tvCrew = normalize(tvCredits?.crew ?? []);
  const movieCast = normalize(movieCredits?.cast ?? []);
  const tvCast = normalize(tvCredits?.cast ?? []);

  const sortByDateDesc = (a: any, b: any) =>
    new Date(b.release_date || b.first_air_date || 0).getTime() -
    new Date(a.release_date || a.first_air_date || 0).getTime();

  const directedRaw = [...movieCrew, ...tvCrew].filter((c: any) => {
    const job = (c.job || '').toLowerCase();
    const dept = (c.department || '').toLowerCase();
    return job === 'director' || (job === '' && dept === 'directing');
  });
  const directedSeen = new Set<string>();
  const directed: any[] = [];
  for (const c of directedRaw.sort(sortByDateDesc)) {
    const key = `${c.media_type}-${c.id}`;
    if (directedSeen.has(key)) continue;
    directedSeen.add(key);
    directed.push(c);
  }

  const actedSeen = new Set<string>();
  const acted: any[] = [];
  for (const c of [...movieCast, ...tvCast].sort(sortByDateDesc)) {
    const key = `${c.media_type}-${c.id}`;
    if (actedSeen.has(key)) continue;
    actedSeen.add(key);
    acted.push(c);
  }

  const knownFor = [...acted]
    .filter((c: any) => c.poster_path)
    .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 6);

  return {
    person,
    directed,
    acted,
    knownFor,
    imdbId: external?.imdb_id ?? null,
  };
}

type PersonWork = Awaited<ReturnType<typeof fetchPersonWork>>;

/* ────────────────────────────────────────────────
   Popup shell — smaller dream card, side-aware.
   ──────────────────────────────────────────────── */
type Side = 'left' | 'right';

const POPUP_W = 300;
const POPUP_H = 420;

const PersonPopupShell: React.FC<{
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}> = ({ open, onClose, anchorRef, children }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    top: number;
    left: number;
    side: Side;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    const el = anchorRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const GAP = 10;
    const MARGIN = 12;

    const spaceRight = window.innerWidth - r.right;
    const spaceLeft = r.left;
    const side: Side =
      spaceRight >= POPUP_W + GAP + MARGIN || spaceRight >= spaceLeft
        ? 'right'
        : 'left';

    let left: number;
    if (side === 'right') {
      left = r.right + GAP;
      if (left + POPUP_W > window.innerWidth - MARGIN) {
        left = window.innerWidth - POPUP_W - MARGIN;
      }
    } else {
      left = r.left - GAP - POPUP_W;
      if (left < MARGIN) left = MARGIN;
    }

    let top = r.top;
    if (top + POPUP_H > window.innerHeight - MARGIN) {
      top = Math.max(MARGIN, window.innerHeight - POPUP_H - MARGIN);
    }
    if (top < MARGIN) top = MARGIN;

    setLayout({ top, left, side });

    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popupRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !layout) return null;

  return createPortal(
    <div
      ref={popupRef}
      role="dialog"
      data-side={layout.side}
      className="dream-pop fixed z-[100]
                 w-[300px] max-w-[calc(100vw-24px)]
                 rounded-xl
                 bg-[#141417]/95
                 border border-white/[0.12]
                 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)]
                 ring-1 ring-white/[0.04]
                 overflow-hidden"
      style={{
        top: layout.top,
        left: layout.left,
        transformOrigin:
          layout.side === 'right' ? 'left center' : 'right center',
      }}
    >
      {children}
    </div>,
    document.body
  );
};

/* ────────────────────────────────────────────────
   Styles
   ──────────────────────────────────────────────── */
const PersonStyles: React.FC = () => (
  <style>{`
    @keyframes dirShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes dreamInRight {
      0%   { opacity: 0; transform: translateX(-12px) scale(0.96); filter: blur(5px); }
      60%  { opacity: 1; filter: blur(0); }
      100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
    }
    @keyframes dreamInLeft {
      0%   { opacity: 0; transform: translateX(12px) scale(0.96); filter: blur(5px); }
      60%  { opacity: 1; filter: blur(0); }
      100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
    }
    .dir-name {
      background: linear-gradient(90deg, #ffffff 0%, #b8a4ff 50%, #ffffff 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: dirShimmer 4s linear infinite;
    }
    .dream-pop {
      animation: dreamInRight 0.26s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity, filter;
    }
    .dream-pop[data-side="left"] {
      animation-name: dreamInLeft;
    }
    @media (prefers-reduced-motion: reduce) {
      .dir-name, .dream-pop { animation: none !important; }
    }
  `}</style>
);

/* ────────────────────────────────────────────────
   Skeleton
   ──────────────────────────────────────────────── */
const PopupSkeleton = memo(() => (
  <div className="p-2.5 space-y-2.5 animate-pulse">
    <div className="rounded-md bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.05]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 px-2.5 py-2">
          <div className="w-12 h-2 rounded bg-white/[0.06]" />
          <div className="h-2 rounded bg-white/[0.06] flex-1 max-w-[60%]" />
        </div>
      ))}
    </div>
  </div>
));
PopupSkeleton.displayName = 'PopupSkeleton';

/* ────────────────────────────────────────────────
   IMDb panel
   ──────────────────────────────────────────────── */
const ImdbPanel = memo<{ person: any; data: PersonWork | undefined }>(
  ({ person, data }) => {
    const rows = useMemo(() => {
      const out: Array<{ label: string; value: React.ReactNode }> = [];

      const birthday = person?.birthday
        ? new Date(person.birthday).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
          })
        : null;

      const deathday = person?.deathday
        ? new Date(person.deathday).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
          })
        : null;

      const age = person?.birthday
        ? Math.floor(
            (Date.now() - new Date(person.birthday).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25)
          )
        : null;

      if (birthday) {
        out.push({
          label: 'Born',
          value: (
            <span>
              {birthday}
              {age !== null && !deathday && (
                <span className="text-white/40"> · {age}</span>
              )}
            </span>
          ),
        });
      }
      if (deathday) out.push({ label: 'Died', value: deathday });
      if (person?.place_of_birth)
        out.push({ label: 'From', value: person.place_of_birth });
      if (person?.known_for_department)
        out.push({ label: 'Known', value: person.known_for_department });

      const aka: string[] = (person?.also_known_as ?? []).slice(0, 1);
      out.push({
        label: 'Also as',
        value:
          aka.length > 0 ? (
            aka.join(', ')
          ) : (
            <span className="text-white/30 italic">—</span>
          ),
      });

      const allItems = [...(data?.acted ?? []), ...(data?.directed ?? [])];
      const years = allItems
        .map((c: any) =>
          (c.release_date || c.first_air_date || '').substring(0, 4)
        )
        .filter(Boolean)
        .map((y: string) => parseInt(y, 10))
        .filter((n: number) => !isNaN(n));

      if (years.length > 0) {
        out.push({
          label: 'Active',
          value: `${Math.min(...years)}–${
            person?.deathday ? Math.max(...years) : 'now'
          }`,
        });
      }

      const genreCount: Record<number, number> = {};
      for (const c of allItems) {
        for (const g of c.genre_ids ?? []) {
          genreCount[g] = (genreCount[g] ?? 0) + 1;
        }
      }
      const topGenres = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([id]) => GENRE_NAMES[Number(id)])
        .filter(Boolean)
        .join(', ');
      if (topGenres) out.push({ label: 'Genres', value: topGenres });

      if (data) {
        const total = (data.acted?.length ?? 0) + (data.directed?.length ?? 0);
        out.push({
          label: 'Credits',
          value: `${total}`,
        });
      }

      const topRated = [...allItems]
        .filter((c: any) => (c.vote_count ?? 0) > 100)
        .sort(
          (a: any, b: any) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
        )[0];
      if (topRated) {
        out.push({
          label: 'Top',
          value: (
            <span className="truncate block">
              {topRated.title || topRated.name}{' '}
              <span className="text-[#f5c518] font-mono">
                ★{topRated.vote_average?.toFixed(1)}
              </span>
            </span>
          ),
        });
      }

      if (data?.imdbId) {
        out.push({
          label: 'IMDb',
          value: (
            <span className="font-mono text-white/70 text-[10px]">
              {data.imdbId}
            </span>
          ),
        });
      }

      return out;
    }, [person, data]);

    const knownFor = (data?.knownFor ?? []).slice(0, 3);

    return (
      <div className="p-2.5 space-y-2.5">
        {rows.length > 0 && (
          <div className="rounded-md bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.05]">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-start gap-2.5 px-2.5 py-1.5 text-[10px]"
              >
                <span className="w-12 shrink-0 text-white/40 uppercase tracking-wider text-[9px] pt-0.5">
                  {r.label}
                </span>
                <span className="text-white/80 leading-snug min-w-0 flex-1">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {knownFor.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-white/40 px-0.5 mb-1.5">
              Known For
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {knownFor.map((k: any) => {
                const year = (
                  k.release_date ||
                  k.first_air_date ||
                  ''
                ).substring(0, 4);
                return (
                  <div
                    key={`${k.media_type}-${k.id}`}
                    className="rounded-md overflow-hidden bg-black/40 border border-white/[0.06]"
                    title={k.title || k.name}
                  >
                    <div className="aspect-[2/3] w-full bg-neutral-900">
                      {k.poster_path && (
                        <img
                          src={getImageUrl(k.poster_path, 'w200')}
                          alt={k.title || k.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <p className="px-1 py-0.5 text-[9px] text-white/70 truncate">
                      {year || '—'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);
ImdbPanel.displayName = 'ImdbPanel';

/* ────────────────────────────────────────────────
   Credits timeline (directors only)
   ──────────────────────────────────────────────── */
const CreditsTimeline = memo<{ items: any[] }>(({ items }) => {
  if (items.length === 0) {
    return (
      <p className="text-[10px] text-white/40 px-1 py-4 text-center">
        No credits found.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-white/[0.1] ml-1.5 space-y-2 pl-2.5">
      {items.slice(0, 14).map((m: any, idx: number) => {
        const year = (m.release_date || m.first_air_date || '').substring(0, 4);
        return (
          <li
            key={`${m.media_type}-${m.id}-${idx}`}
            className="relative group"
          >
            <span className="absolute -left-[14px] top-1 w-1.5 h-1.5 rounded-full bg-white/70 ring-2 ring-white/10 transition-colors group-hover:bg-[#7c5cff]" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-mono text-white/50 tabular-nums w-8 shrink-0">
                {year || '—'}
              </span>
              <span className="text-[10.5px] text-white/85 truncate group-hover:text-white transition-colors">
                {m.title || m.name}
              </span>
              {m.character && (
                <span className="text-[9px] text-white/40 truncate">
                  as {m.character}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
});
CreditsTimeline.displayName = 'CreditsTimeline';

/* ────────────────────────────────────────────────
   Popup body — tabs only for directors;
   cast gets straight-to-IMDb.
   ──────────────────────────────────────────────── */
const PersonPopupBody: React.FC<{
  person: any;
  data: PersonWork | undefined;
  listLabel: string;
  isLoading: boolean;
  variant: 'cast' | 'director';
}> = ({ person, data, listLabel, isLoading, variant }) => {
  const [tab, setTab] = useState<'credits' | 'imdb'>('credits');

  const personName = person?.name || 'Unknown';
  const items =
    variant === 'director' ? data?.directed ?? [] : data?.acted ?? [];
  const bio = person?.biography?.trim();

  const showTabs = variant === 'director';

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2.5 p-2.5 border-b border-white/[0.08]">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-800 ring-1 ring-white/[0.08] shrink-0">
          {person?.profile_path ? (
            <img
              src={getImageUrl(person.profile_path, 'w185')}
              alt={personName}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60 text-xs font-bold">
              {personName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-white truncate leading-tight">
            {personName}
          </p>
          <p className="text-[10px] text-white/50 truncate">
            {person?.known_for_department || listLabel}
            {data && items.length > 0 && (
              <>
                {' · '}
                {items.length}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Bio — 2 lines */}
      {bio && (
        <div className="px-2.5 py-2 border-b border-white/[0.08]">
          <p className="text-[10px] leading-snug text-white/60 line-clamp-2">
            {bio}
          </p>
        </div>
      )}

      {/* Tabs — directors only */}
      {showTabs && (
        <div className="flex border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => setTab('credits')}
            className={`flex-1 py-1.5 text-[10px] font-medium tracking-wide transition-colors cursor-pointer ${
              tab === 'credits'
                ? 'text-white border-b-2 border-white -mb-px'
                : 'text-white/45 hover:text-white/70'
            }`}
          >
            {listLabel}
          </button>
          <button
            type="button"
            onClick={() => setTab('imdb')}
            className={`flex-1 py-1.5 text-[10px] font-medium tracking-wide transition-colors cursor-pointer ${
              tab === 'imdb'
                ? 'text-[#f5c518] border-b-2 border-[#f5c518] -mb-px'
                : 'text-white/45 hover:text-[#f5c518]/80'
            }`}
          >
            IMDb
          </button>
        </div>
      )}

      {/* Content — cast always shows IMDb; directors respect tab */}
      <div className="max-h-[240px] overflow-y-auto no-scrollbar">
        {isLoading ? (
          <PopupSkeleton />
        ) : variant === 'cast' ? (
          <ImdbPanel person={person} data={data} />
        ) : tab === 'credits' ? (
          <div className="p-2.5">
            <CreditsTimeline items={items} />
          </div>
        ) : (
          <ImdbPanel person={person} data={data} />
        )}
      </div>
    </>
  );
};

/* ────────────────────────────────────────────────
   Director / Creator chip
   ──────────────────────────────────────────────── */
const DirectorCard: React.FC<{ director: any }> = ({ director }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['person-work', director.id],
    queryFn: () => fetchPersonWork(director.id),
    enabled: open && !!director.id,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });

  // ✅ Label reflects job — "Director" for movies, "Creator" for TV
  const roleLabel = director.job ?? 'Director';

  return (
    <>
      <PersonStyles />
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${roleLabel} ${director.name} — view details`}
        className="group relative inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full
                   bg-[#7c5cff]/15 hover:bg-[#7c5cff]/25
                   border border-[#7c5cff]/50 hover:border-[#7c5cff]/90
                   transition-colors duration-200 cursor-pointer"
      >
        <span className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-[#7c5cff]/70 shrink-0">
          {director.profile_path ? (
            <img
              src={getImageUrl(director.profile_path, 'w185')}
              alt={director.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center bg-neutral-800 text-white/60 text-[9px] font-bold">
              {director.name?.charAt(0)}
            </span>
          )}
        </span>

        <span className="flex flex-col items-start leading-tight">
          <span className="text-[8px] uppercase tracking-[0.12em] text-[#b8a4ff]/90 font-medium">
            {roleLabel}
          </span>
          <span className="dir-name text-[11px] font-semibold">
            {director.name}
          </span>
        </span>
      </button>

      <PersonPopupShell
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
      >
        <PersonPopupBody
          person={data?.person ?? director}
          data={data}
          listLabel={director.job === 'Creator' ? 'Created' : 'Directed'}
          isLoading={isLoading}
          variant="director"
        />
      </PersonPopupShell>
    </>
  );
};

/* ────────────────────────────────────────────────
   Cast chip
   ──────────────────────────────────────────────── */
const CastCard: React.FC<{ actor: any }> = ({ actor }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['person-work', actor.id],
    queryFn: () => fetchPersonWork(actor.id),
    enabled: open && !!actor.id,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });

  return (
    <>
      <PersonStyles />
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${actor.name} — view details`}
        className="group flex flex-col items-center w-20 shrink-0 text-center cursor-pointer focus:outline-none"
      >
        <span
          className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-800
                     border border-white/[0.08] group-hover:border-white/[0.25]
                     transition-colors duration-200 mb-1.5"
        >
          {actor.profile_path ? (
            <img
              src={getImageUrl(actor.profile_path, 'w300')}
              alt={actor.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-white/40 text-xs font-semibold">
              {actor.name.charAt(0)}
            </span>
          )}
        </span>
        <span className="text-[11px] font-medium text-white/90 line-clamp-1 group-hover:text-white">
          {actor.name}
        </span>
        <span className="text-[10px] text-[rgba(245,245,247,0.4)] line-clamp-1">
          {actor.character}
        </span>
      </button>

      <PersonPopupShell
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
      >
        <PersonPopupBody
          person={data?.person ?? actor}
          data={data}
          listLabel="Acting"
          isLoading={isLoading}
          variant="cast"
        />
      </PersonPopupShell>
    </>
  );
};

/* ────────────────────────────────────────────────
   Genre chip
   ──────────────────────────────────────────────── */
/* ────────────────────────────────────────────────
   Genre chip
   ──────────────────────────────────────────────── */
const GenreChip: React.FC<{
  genre: { id: number; name: string };
  type: MediaType;
}> = ({ genre, type }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/genres?genre=${genre.id}&type=${type}`)}
      className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-[#7c5cff]/20
                 border border-white/[0.08] hover:border-[#7c5cff]/50
                 text-xs text-[rgba(245,245,247,0.85)] hover:text-white
                 font-medium transition-colors cursor-pointer"
    >
      {genre.name}
    </button>
  );
};

/* ────────────────────────────────────────────────
   DetailPage
   ──────────────────────────────────────────────── */
export const DetailPage: React.FC<DetailPageProps> = ({ type: propType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const type: MediaType =
    propType || (location.pathname.startsWith('/tv') ? 'tv' : 'movie');

  const { continueWatching } = useUIStore();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showTrailer, setShowTrailer] = useState(false);

  const { data: item, isLoading } = useDetails(type, id || null);

  const { data: seasonData, isLoading: seasonLoading } = useSeasonDetails(
    type === 'tv' ? id : null,
    selectedSeason
  );

  const collectionId = (item as any)?.belongs_to_collection?.id as
    | number
    | undefined;

  const { data: relatedItems = [] } = useQuery({
    queryKey: ['related-detail', type, id, collectionId],
    queryFn: () => fetchRelated(type, id!, collectionId),
    enabled: !!id && !!item,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const loadProgress = useCallback(
    (mediaId: string | number | undefined) => {
      if (!mediaId) return null;
      return (
        continueWatching.find(
          (c) => String(c.id) === String(mediaId) && c.type === 'tv'
        ) || null
      );
    },
    [continueWatching]
  );

  const tvProgress = type === 'tv' ? loadProgress(id) : null;
  const hasProgress = !!tvProgress;
  const resumeSeason = tvProgress?.season ?? 1;
  const resumeEpisode = tvProgress?.episode ?? 1;

  useEffect(() => {
    if (item) recordHistory(item);
  }, [item]);

  const trailer = useMemo(() => {
    if (!item) return null;
    const videos = item.videos?.results ?? [];

    const vimeo =
      videos.find((v: any) => v.site === 'Vimeo' && v.type === 'Trailer') ??
      videos.find((v: any) => v.site === 'Vimeo' && v.type === 'Teaser') ??
      videos.find((v: any) => v.site === 'Vimeo');
    if (vimeo) {
      return {
        site: 'Vimeo' as const,
        name: vimeo.name,
        key: vimeo.key,
        src:
          `https://player.vimeo.com/video/${vimeo.key}` +
          `?autoplay=1&muted=0&background=1&playsinline=1`,
        externalUrl: `https://vimeo.com/${vimeo.key}`,
      };
    }

    const yt =
      videos.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
      ) ??
      videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ??
      videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser') ??
      videos.find((v: any) => v.site === 'YouTube');
    if (yt) {
      return {
        site: 'YouTube' as const,
        name: yt.name,
        key: yt.key,
        src:
          `https://www.youtube-nocookie.com/embed/${yt.key}` +
          `?autoplay=1&mute=0&modestbranding=1` +
          `&origin=${encodeURIComponent(window.location.origin)}`,
        externalUrl: `https://www.youtube.com/watch?v=${yt.key}`,
      };
    }
    return null;
  }, [item]);

  /* ✅ FIX: TV shows → created_by; Movies → Director from crew */
  const primaryCredits = useMemo(() => {
    if (!item) return [];

    if (type === 'tv') {
      const creators: any[] = (item as any).created_by ?? [];
      if (creators.length > 0) {
        return creators.slice(0, 3).map((c: any) => ({
          id: c.id,
          name: c.name,
          profile_path: c.profile_path,
          job: 'Creator',
        }));
      }
      // Fallback for older TV entries where created_by is empty
      const tvCrew = ((item.credits as any)?.crew ?? []) as any[];
      const fallback = tvCrew.filter(
        (c) =>
          c.job === 'Creator' ||
          c.job === 'Executive Producer' ||
          c.department === 'Writing'
      );
      return fallback.slice(0, 3).map((c) => ({ ...c, job: 'Creator' }));
    }

    // Movies → Director
    return ((item?.credits as any)?.crew ?? [])
      .filter((c: any) => c.job === 'Director')
      .slice(0, 3);
  }, [item, type]);

  const topCast = useMemo(
    () => ((item?.credits as any)?.cast ?? []).slice(0, 10),
    [item]
  );

  const availableSeasons = useMemo(
    () => (item?.seasons || []).filter((s: any) => s.season_number > 0),
    [item]
  );

  const episodesList = seasonData?.episodes || [];

  const relatedForGrid = useMemo(
    () =>
      (relatedItems || [])
        .filter((r: any) => r && r.id !== item?.id)
        .map((r: any) => ({ ...r, media_type: type }))
        .slice(0, 12),
    [relatedItems, item?.id, type]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Mascot state="loading" size={48} />
          <span className="text-xs text-[rgba(245,245,247,0.5)]">
            Loading reel...
          </span>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f7] px-6 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Title Not Found</h2>
        <p className="text-xs text-[rgba(245,245,247,0.6)] mb-6">
          The requested movie or series could not be located.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-[#e8e8ea] cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const releaseYear = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
    ? item.first_air_date.substring(0, 4)
    : '2026';

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f7] pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[rgba(245,245,247,0.62)] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-black overflow-hidden rounded-t-2xl">
            <img
              src={getImageUrl(
                item.backdrop_path || item.poster_path,
                'w1280'
              )}
              alt={item.title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111113]/90 via-[#111113]/40 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.62)] mb-2">
                  <span className="text-white capitalize">
                    {type === 'tv' ? 'TV Series' : 'Movie'}
                  </span>
                  <span aria-hidden="true" className="text-white/20">
                    ·
                  </span>
                  <span className="flex items-center gap-1 font-mono tabular-nums text-white/90">
                    <Star className="w-3 h-3 text-amber-400 stroke-[1.5]" />
                    <span>
                      {item.vote_average
                        ? item.vote_average.toFixed(1)
                        : '8.0'}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-white/20">
                    ·
                  </span>
                  <span className="tabular-nums">{releaseYear}</span>
                  {item.runtime && (
                    <>
                      <span aria-hidden="true" className="text-white/20">
                        ·
                      </span>
                      <span className="tabular-nums">{item.runtime}m</span>
                    </>
                  )}
                  {item.number_of_seasons && (
                    <>
                      <span aria-hidden="true" className="text-white/20">
                        ·
                      </span>
                      <span className="tabular-nums">
                        {item.number_of_seasons}{' '}
                        {item.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#f5f5f7] font-heading tracking-[-0.02em] leading-tight mb-2">
                  {item.title}
                </h1>

                {item.tagline && (
                  <p className="text-xs sm:text-sm italic text-[rgba(245,245,247,0.62)] mb-3">
                    "{item.tagline}"
                  </p>
                )}

                {/* ✅ Renders Creator for TV, Director for movies */}
                {primaryCredits.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {primaryCredits.map((d: any) => (
                      <DirectorCard key={d.id} director={d} />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (type === 'movie') {
                        navigate(`/watch/movie/${id}`);
                      } else {
                        navigate(`/watch/tv/${id}?s=1&e=1`);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#7c5cff] text-white font-semibold text-xs hover:bg-[#8f72ff] active:scale-[0.97] transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current stroke-[1.5]" />
                    <span>Watch Now</span>
                  </button>

                  {type === 'tv' && hasProgress && (
                    <button
                      type="button"
                      onClick={() => {
                        const progress = loadProgress(id);
                        const s = progress?.season ?? 1;
                        const e = progress?.episode ?? 1;
                        navigate(`/watch/tv/${id}?s=${s}&e=${e}`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/[0.15] text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
                      <span>
                        Resume S{resumeSeason}:E{resumeEpisode}
                      </span>
                    </button>
                  )}

                  <WatchlistButton
                    item={{
                      id: item.id,
                      type: item.media_type || type,
                      title: item.title,
                      posterPath: item.poster_path,
                      backdropPath: item.backdrop_path,
                      year: releaseYear,
                      rating: item.vote_average,
                      overview: item.overview,
                    }}
                    variant="button"
                    size="sm"
                  />

                  {trailer && (
                    <button
                      type="button"
                      onClick={() => setShowTrailer(!showTrailer)}
                      className="px-3.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.98] border border-white/[0.08] text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{showTrailer ? 'Hide Trailer' : 'Trailer'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showTrailer && trailer && (
            <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#17171a]">
              <div className="flex items-center justify-between mb-3 text-[11px] text-[rgba(245,245,247,0.62)] font-medium uppercase tracking-[0.08em]">
                <span>
                  Official Trailer: {trailer.name}
                  <span className="ml-2 text-white/30 normal-case tracking-normal">
                    via {trailer.site}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTrailer(false)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="relative aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-black border border-white/[0.08]">
                <iframe
                  key={trailer.src}
                  src={trailer.src}
                  title={trailer.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="max-w-3xl mx-auto mt-3 text-center">
                <a
                  href={trailer.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-white/45 hover:text-white/80 transition-colors"
                >
                  Trailer not playing? Open in a new tab →
                </a>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)]">
                  Overview
                </h3>
                <p className="text-sm leading-relaxed text-[rgba(245,245,247,0.72)]">
                  {item.overview || 'No synopsis available for this title.'}
                </p>
              </div>

              <div className="space-y-4">
                {item.genres && item.genres.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-2">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.map((g) => (
                        <GenreChip key={g.id} genre={g} type={type} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {topCast.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08]">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-3">
                  Top Cast
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                  {topCast.map((actor) => (
                    <CastCard
                      key={actor.id ?? actor.credit_id ?? actor.name}
                      actor={actor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {type === 'tv' && (
          <div className="mt-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                  Episodes
                </h2>
                <p className="text-xs text-[rgba(245,245,247,0.45)] mt-0.5">
                  {episodesList.length > 0
                    ? `${episodesList.length} episodes in Season ${selectedSeason}`
                    : `Season ${selectedSeason}`}
                </p>
              </div>

              {availableSeasons.length > 0 && (
                <div className="relative inline-block">
                  <select
                    value={selectedSeason}
                    onChange={(e) =>
                      setSelectedSeason(Number(e.target.value))
                    }
                    aria-label="Select Season"
                    className="appearance-none bg-[#17171a] border border-white/[0.12] rounded-lg px-4 py-2 pr-9 text-xs font-medium text-white cursor-pointer hover:border-white/25 focus:outline-none focus:border-white/40"
                  >
                    {availableSeasons.map((s) => (
                      <option
                        key={s.id}
                        value={s.season_number}
                        className="bg-[#17171a] text-white"
                      >
                        Season {s.season_number}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-white/50">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
                  </div>
                </div>
              )}
            </div>

            {seasonLoading ? (
              <div className="py-12 text-center text-sm text-[rgba(245,245,247,0.38)]">
                Loading episodes...
              </div>
            ) : episodesList.length === 0 ? (
              <div className="py-12 text-center text-sm text-[rgba(245,245,247,0.38)]">
                No episode details available for Season {selectedSeason}.
              </div>
            ) : (
              <div className="space-y-3">
                {episodesList.map((ep) => {
                  const isResumeTarget =
                    tvProgress &&
                    tvProgress.season === selectedSeason &&
                    tvProgress.episode === ep.episode_number;

                  return (
                    <div
                      key={ep.id}
                      onClick={() =>
                        navigate(
                          `/watch/tv/${id}?s=${selectedSeason}&e=${ep.episode_number}`
                        )
                      }
                      className={`group relative rounded-xl p-3 border transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isResumeTarget
                          ? 'bg-[#17171a] border-white/[0.1] border-l-4 border-l-[#7c5cff]'
                          : 'bg-[#17171a] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.14]'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative w-28 sm:w-36 aspect-video shrink-0 rounded-lg overflow-hidden bg-black/60 border border-white/[0.06]">
                          {ep.still_path ? (
                            <img
                              src={getImageUrl(ep.still_path, 'w500')}
                              alt={ep.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-white/30">
                              EP {ep.episode_number}
                            </div>
                          )}

                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black">
                              <Play className="w-3.5 h-3.5 fill-current stroke-[1.5] ml-0.5" />
                            </div>
                          </div>

                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white/90">
                            E{ep.episode_number}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#f5f5f7] truncate">
                              E{ep.episode_number} "
                              {ep.name || `Episode ${ep.episode_number}`}"
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[rgba(245,245,247,0.45)] font-mono mb-1.5">
                            {ep.runtime && <span>{ep.runtime}m</span>}
                            {ep.air_date && <span>· Aired {ep.air_date}</span>}
                            {ep.vote_average > 0 && (
                              <span>· ★ {ep.vote_average.toFixed(1)}</span>
                            )}
                          </div>
                          <p className="text-xs text-[rgba(245,245,247,0.62)] line-clamp-2 leading-relaxed">
                            {ep.overview || 'No synopsis available.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/watch/tv/${id}?s=${selectedSeason}&e=${ep.episode_number}`
                          );
                        }}
                        className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isResumeTarget
                            ? 'bg-white text-black hover:bg-[#e8e8ea]'
                            : 'bg-white/[0.08] hover:bg-white text-white hover:text-black border border-white/[0.1]'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current stroke-[1.5]" />
                        <span>{isResumeTarget ? 'Resume' : 'Play'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {relatedForGrid.length > 0 && (
          <div className="mt-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6 sm:p-8">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-4">
              {type === 'movie' && collectionId
                ? 'More in this Collection'
                : 'You May Also Like'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {relatedForGrid.slice(0, 6).map((sim) => (
                <div
                  key={`${sim.media_type}-${sim.id}`}
                  onClick={() => navigate(`/${sim.media_type || type}/${sim.id}`)}
                  className="group cursor-pointer rounded-xl bg-[#17171a] p-2 border border-white/[0.08] hover:border-white/[0.18] transition-colors"
                >
                  <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-neutral-900 mb-2">
                    {sim.poster_path ? (
                      <img
                        src={getImageUrl(sim.poster_path, 'w300')}
                        alt={sim.title || sim.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs text-center p-2">
                        {sim.title || sim.name}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[rgba(245,245,247,0.85)] truncate group-hover:text-white">
                    {sim.title || sim.name}
                  </p>
                  <span className="text-[10px] text-[rgba(245,245,247,0.4)]">
                    {sim.release_date
                      ? sim.release_date.substring(0, 4)
                      : sim.first_air_date
                      ? sim.first_air_date.substring(0, 4)
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;