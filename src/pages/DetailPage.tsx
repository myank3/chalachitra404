import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Star, Video, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useDetails, useSimilar, getImageUrl } from '../lib/api';
import { useSeasonDetails } from '../hooks/useEpisodes';
import { useUIStore } from '../stores/useUIStore';
import { WatchlistButton } from '../components/WatchlistButton';
import { MediaType } from '../types';
import { recordHistory } from '../lib/recommend';
import { Mascot } from '../components/Mascot';

interface DetailPageProps {
  type?: MediaType;
}

export const DetailPage: React.FC<DetailPageProps> = ({ type: propType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine media type from props or pathname
  const type: MediaType =
    propType || (location.pathname.startsWith('/tv') ? 'tv' : 'movie');

  const { continueWatching } = useUIStore();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showTrailer, setShowTrailer] = useState(false);

  // Fetch TMDB data
  const { data: item, isLoading } = useDetails(type, id || null);
  const { data: similarItems = [] } = useSimilar(type, id || '');

  // For TV: fetch season details for episode list
  const { data: seasonData, isLoading: seasonLoading } = useSeasonDetails(
    type === 'tv' ? id : null,
    selectedSeason
  );

  // Progress helper for TV
  const loadProgress = (mediaId: string | number | undefined) => {
    if (!mediaId) return null;
    return (
      continueWatching.find(
        (c) => String(c.id) === String(mediaId) && c.type === 'tv'
      ) || null
    );
  };

  const tvProgress = type === 'tv' ? loadProgress(id) : null;
  const hasProgress = !!tvProgress;
  const resumeSeason = tvProgress?.season ?? 1;
  const resumeEpisode = tvProgress?.episode ?? 1;

  useEffect(() => {
    if (item) {
      recordHistory(item);
    }
  }, [item]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Mascot state="loading" size={48} />
          <span className="text-xs text-[rgba(245,245,247,0.5)]">Loading reel...</span>
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

  const trailer = item.videos?.results?.find(
    (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
  );

  const availableSeasons = (item.seasons || []).filter((s) => s.season_number > 0);
  const episodesList = seasonData?.episodes || [];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f7] pb-24">
      {/* 1. Back button bar */}
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

      {/* 2. Hero Presentation Container (No inline player iframe) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden bg-[#111113] border border-white/[0.08]">
          {/* Backdrop Image Banner */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-black overflow-hidden">
            <img
              src={getImageUrl(item.backdrop_path || item.poster_path, 'w1280')}
              alt={item.title}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111113]/90 via-[#111113]/40 to-transparent" />

            {/* Poster & Title Details overlaid at bottom */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <div className="max-w-3xl">
                {/* Meta row */}
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.62)] mb-2">
                  <span className="text-white capitalize">
                    {type === 'tv' ? 'TV Series' : 'Movie'}
                  </span>
                  <span aria-hidden="true" className="text-white/20">·</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums text-white/90">
                    <Star className="w-3 h-3 text-amber-400 stroke-[1.5]" />
                    <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.0'}</span>
                  </span>
                  <span aria-hidden="true" className="text-white/20">·</span>
                  <span className="tabular-nums">{releaseYear}</span>
                  {item.runtime && (
                    <>
                      <span aria-hidden="true" className="text-white/20">·</span>
                      <span className="tabular-nums">{item.runtime}m</span>
                    </>
                  )}
                  {item.number_of_seasons && (
                    <>
                      <span aria-hidden="true" className="text-white/20">·</span>
                      <span className="tabular-nums">
                        {item.number_of_seasons}{' '}
                        {item.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                      </span>
                    </>
                  )}
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#f5f5f7] font-heading tracking-[-0.02em] leading-tight mb-2">
                  {item.title}
                </h1>

                {/* Tagline */}
                {item.tagline && (
                  <p className="text-xs sm:text-sm italic text-[rgba(245,245,247,0.62)] mb-3">
                    "{item.tagline}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  {/* Play Button - Navigates to dedicated Watch page */}
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

                  {/* Resume Button (TV only) */}
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
                      <span>Resume S{resumeSeason}:E{resumeEpisode}</span>
                    </button>
                  )}

                  {/* Add to List Button - Compact & Sleek */}
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

                  {/* Trailer toggle */}
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

          {/* Embedded YouTube Trailer if requested */}
          {showTrailer && trailer && (
            <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#17171a]">
              <div className="flex items-center justify-between mb-3 text-[11px] text-[rgba(245,245,247,0.62)] font-medium uppercase tracking-[0.08em]">
                <span>Official Trailer: {trailer.name}</span>
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
                  src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&modestbranding=1`}
                  title={trailer.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-7">
            {/* Overview & Genres */}
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
                        <span
                          key={g.id}
                          className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-xs text-[rgba(245,245,247,0.85)] font-medium"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Cast */}
            {item.credits?.cast && item.credits.cast.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08]">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-3">
                  Top Cast
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                  {item.credits.cast.slice(0, 10).map((actor) => (
                    <div
                      key={actor.id}
                      className="flex flex-col items-center w-20 shrink-0 text-center"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border border-white/[0.08] mb-1.5">
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, 'w300')}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-semibold">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-white/90 line-clamp-1">
                        {actor.name}
                      </span>
                      <span className="text-[10px] text-[rgba(245,245,247,0.4)] line-clamp-1">
                        {actor.character}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. TV Shows Only: Episode Navigation Section */}
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

              {/* Season Selector */}
              {availableSeasons.length > 0 && (
                <div className="relative inline-block">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
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

            {/* Episode List (Each navigates directly to /watch/tv/:id?s=${season}&e=${episode}) */}
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
                      className={`group relative rounded-xl p-3 border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isResumeTarget
                          ? 'bg-[#17171a] border-white/[0.1] border-l-4 border-l-[#7c5cff]'
                          : 'bg-[#17171a] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.14]'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="relative w-28 sm:w-36 aspect-video shrink-0 rounded-lg overflow-hidden bg-black/60 border border-white/[0.06]">
                          {ep.still_path ? (
                            <img
                              src={getImageUrl(ep.still_path, 'w500')}
                              alt={ep.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                        {/* Title and metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#f5f5f7] truncate">
                              E{ep.episode_number} "{ep.name || `Episode ${ep.episode_number}`}"
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

                      {/* Play Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/watch/tv/${id}?s=${selectedSeason}&e=${ep.episode_number}`
                          );
                        }}
                        className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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

        {/* 4. Similar Items Section */}
        {similarItems.length > 0 && (
          <div className="mt-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6 sm:p-8">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(245,245,247,0.38)] mb-4">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {similarItems.slice(0, 6).map((sim) => (
                <div
                  key={`${sim.media_type}-${sim.id}`}
                  onClick={() => navigate(`/${sim.media_type || type}/${sim.id}`)}
                  className="group cursor-pointer rounded-xl bg-[#17171a] p-2 border border-white/[0.08] hover:border-white/[0.18] transition-all"
                >
                  <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-neutral-900 mb-2">
                    <img
                      src={getImageUrl(sim.poster_path, 'w300')}
                      alt={sim.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs font-medium text-[rgba(245,245,247,0.85)] truncate group-hover:text-white">
                    {sim.title}
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
