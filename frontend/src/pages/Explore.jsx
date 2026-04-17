import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Loader2, X, ExternalLink, Calendar, BookOpen, Building, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

function PublicationModal({ pub, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[rgba(15,23,42,0.97)] shadow-2xl shadow-purple-900/30 p-8 animate-in fade-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold leading-snug text-white">{pub.title || 'Untitled'}</h2>
          <button onClick={onClose} className="shrink-0 p-2 rounded-xl hover:bg-white/10 transition-colors text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {pub.year && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Year</p>
                <p className="font-semibold text-white">{pub.year}</p>
              </div>
            </div>
          )}
          {pub.venue && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Building className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Venue</p>
                <p className="font-semibold text-white text-sm leading-tight">{pub.venue}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <Quote className="w-5 h-5 text-pink-400 shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Citations</p>
              <p className="font-bold text-2xl text-white">{pub.citations ?? 0}</p>
            </div>
          </div>
          {pub.doi && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-text-muted">DOI</p>
                <p className="font-mono text-xs text-white break-all">{pub.doi}</p>
              </div>
            </div>
          )}
        </div>

        {/* Abstract */}
        {pub.abstract && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-text-muted uppercase font-semibold mb-2">Abstract</p>
            <p className="text-sm text-white/80 leading-relaxed">{pub.abstract}</p>
          </div>
        )}

        {/* Link Button */}
        {pub.url && (
          <a
            href={pub.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:-translate-y-0.5"
          >
            <ExternalLink className="w-4 h-4" />
            Open Publication
          </a>
        )}
      </div>
    </div>
  );
}

function PublicationCard({ pub, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-panel p-5 flex flex-col gap-3 cursor-pointer hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 group"
    >
      {/* Year badge + Citations */}
      <div className="flex items-center justify-between">
        {pub.year ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
            {pub.year}
          </span>
        ) : <span />}
        <span className="flex items-center gap-1 text-xs font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-full">
          <Quote className="w-3 h-3" /> {pub.citations ?? 0}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white text-sm leading-snug line-clamp-3 group-hover:text-purple-200 transition-colors">
        {pub.title || 'Untitled'}
      </h3>

      {/* Venue */}
      {pub.venue && (
        <p className="text-xs text-text-muted flex items-center gap-1.5 mt-auto">
          <Building className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{pub.venue}</span>
        </p>
      )}

      {/* Read more hint */}
      <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-1">
        <span>View full details</span>
        <ExternalLink className="w-3 h-3" />
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

export default function Explore() {
  const [query, setQuery] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (searchQuery = '', yFrom = '', yTo = '', pg = 1, ps = 12) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      const hasFilters = searchQuery.trim() || yFrom || yTo;

      if (hasFilters) {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (yFrom) params.set('yearFrom', yFrom);
        if (yTo) params.set('yearTo', yTo);
        res = await axios.get(`/api/publications/search/all?${params.toString()}`);
        setItems(res.data.items || []);
        setTotal(res.data.count || 0);
      } else {
        res = await axios.get(`/api/publications?page=${pg}&limit=${ps}`);
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData('', '', '', 1, pageSize); }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(query, yearFrom, yearTo, 1, pageSize);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchData(query, yearFrom, yearTo, newPage, pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
    fetchData(query, yearFrom, yearTo, 1, newSize);
  };

  const totalPages = Math.ceil(total / pageSize);
  const hasFilters = query.trim() || yearFrom || yearTo;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selected && <PublicationModal pub={selected} onClose={() => setSelected(null)} />}

      <div>
        <h2 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Explore Publications
        </h2>
        <p className="text-text-muted text-lg">Browse and search {total > 0 ? total.toLocaleString() : ''} harvested scientific works.</p>
      </div>

      {/* Search + Filters form */}
      <form onSubmit={handleSearch} className="glass-panel p-5 flex flex-col gap-4">
        {/* Search row */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or venue..."
              className="input-field pl-12 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary-btn min-w-[120px] justify-center" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4" /> Search</>}
          </button>
        </div>

        {/* Year range + per-page row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Calendar className="w-4 h-4 text-text-muted shrink-0" />
          <span className="text-sm text-text-muted whitespace-nowrap">Year range:</span>
          <input
            type="number"
            placeholder="From"
            className="input-field w-28 text-sm py-2"
            min="1900" max={CURRENT_YEAR}
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
          />
          <span className="text-text-muted">–</span>
          <input
            type="number"
            placeholder="To"
            className="input-field w-28 text-sm py-2"
            min="1900" max={CURRENT_YEAR}
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
          />
          {(yearFrom || yearTo) && (
            <button type="button" onClick={() => { setYearFrom(''); setYearTo(''); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-muted">
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted whitespace-nowrap">Show:</span>
            <div className="flex gap-1">
              {PAGE_SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    pageSize === size
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/30'
                      : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white border border-glass-border'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {error && (
        <div className="text-red-400 p-4 border border-red-400/20 rounded-xl bg-red-400/10">Error: {error}</div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-text-muted">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 text-center text-text-muted">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No publications found.</p>
          <p className="text-sm mt-1">Try a different search or harvest some data first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <PublicationCard key={item.id} pub={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      )}

      {/* Pagination — only shown when not using filters */}
      {!hasFilters && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="p-2 rounded-xl glass-panel border border-glass-border disabled:opacity-30 hover:border-purple-500/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-text-muted text-sm">
            Page <span className="font-bold text-white">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="p-2 rounded-xl glass-panel border border-glass-border disabled:opacity-30 hover:border-purple-500/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
