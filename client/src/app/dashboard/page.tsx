'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import AIChat from '@/components/AIChat';
import { City } from '@/types/city';
import { useRouter } from 'next/navigation';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const RISK_META: Record<string, { cls: string; dot: string }> = {
  'Extreme Heat':  { cls: 'risk-extreme', dot: '#ef4444' },
  'High Heat':     { cls: 'risk-high',    dot: '#fb923c' },
  'Freezing':      { cls: 'risk-freeze',  dot: '#63b3ed' },
  'Cold Risk':     { cls: 'risk-cold',    dot: '#38bdf8' },
  'High Humidity': { cls: 'risk-humid',   dot: '#2dd4bf' },
  'Strong Wind':   { cls: 'risk-wind',    dot: '#a78bfa' },
  'Normal':        { cls: 'risk-normal',  dot: '#4ade80' },
};

function weatherEmoji(desc?: string): string {
  if (!desc) return '🌡️';
  const d = desc.toLowerCase();
  if (d.includes('thunder'))                       return '⛈️';
  if (d.includes('snow'))                          return '❄️';
  if (d.includes('rain') || d.includes('drizzle')) return '🌧️';
  if (d.includes('cloud'))                         return '☁️';
  if (d.includes('mist') || d.includes('fog'))     return '🌫️';
  if (d.includes('clear') || d.includes('sun'))    return '☀️';
  return '🌤️';
}

function windDir(deg?: number): string {
  if (deg == null) return '–';
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
}

/* ─────────────────────────────────────────────
   ICONS — each is a proper React component
───────────────────────────────────────────── */
function IcoSearch() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IcoGrid() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IcoList() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function IcoLogout() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function IcoHome() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function IcoStar({ filled = false }: { filled?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function IcoPlus() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IcoUser() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IcoClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
  );
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type SortKey   = 'name' | 'temp' | 'humidity';
type ViewMode  = 'grid' | 'list';
type MobileTab = 'cities' | 'favorites' | 'account';

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
export default function Dashboard() {
  const [cities,      setCities]      = useState<City[]>([]);
  const [cityInput,   setCityInput]   = useState('');
  const [filter,      setFilter]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [adding,      setAdding]      = useState(false);
  const [addError,    setAddError]    = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortBy,      setSortBy]      = useState<SortKey>('name');
  const [view,        setView]        = useState<ViewMode>('grid');
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [mobileTab,   setMobileTab]   = useState<MobileTab>('cities');
  const [addSheet,    setAddSheet]    = useState(false);
  const router = useRouter();

  /* derived */
  const favorites = cities.filter(c => c.isFavorite);
  const nonFavs = cities
    .filter(c => !c.isFavorite && c.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'temp')     return (b.weather?.temp ?? 0) - (a.weather?.temp ?? 0);
      if (sortBy === 'humidity') return (b.weather?.humidity ?? 0) - (a.weather?.humidity ?? 0);
      return a.name.localeCompare(b.name);
    });

  const avgTemp = cities.length
    ? (cities.reduce((s, c) => s + (c.weather?.temp ?? 0), 0) / cities.length).toFixed(1)
    : null;
  const hottest = cities.length ? cities.reduce((a, b) => (a.weather?.temp ?? 0) > (b.weather?.temp ?? 0) ? a : b) : null;
  const coldest = cities.length ? cities.reduce((a, b) => (a.weather?.temp ?? 0) < (b.weather?.temp ?? 0) ? a : b) : null;

  /* data */
  const fetchCities = useCallback(async () => {
    try {
      const res = await api.get('/cities');
      setCities(Array.isArray(res.data) ? res.data : []);
      setLastUpdated(new Date());
    } catch { /* keep stale data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCities();
    const t = setInterval(fetchCities, 60_000);
    return () => clearInterval(t);
  }, [fetchCities]);

  /* actions */
  const addCity = async () => {
    if (!cityInput.trim() || adding) return;
    setAdding(true); setAddError('');
    try {
      await api.post('/cities', { name: cityInput.trim() });
      setCityInput(''); setAddSheet(false);
      await fetchCities();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'City not found. Check the spelling.');
    } finally { setAdding(false); }
  };

  const toggleFavorite = async (id: string) => {
    setCities(prev => prev.map(c => c._id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    try { await api.patch(`/cities/${id}/favorite`); await fetchCities(); }
    catch { fetchCities(); }
  };

  const deleteCity = async (id: string) => {
    if (!confirm('Remove this city?')) return;
    setDeletingId(id);
    try { await api.delete(`/cities/${id}`); setCities(prev => prev.filter(c => c._id !== id)); }
    catch { fetchCities(); }
    finally { setDeletingId(null); }
  };

  const logout = () => { localStorage.removeItem('token'); router.push('/login'); };

  /* shared city list rendering */
  function renderCities(list: City[], mobilePadding = false) {
    const pb = mobilePadding ? 100 : 80;
    if (loading) return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 210, borderRadius: 14 }} />)}
      </div>
    );
    if (list.length === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, gap: 12, textAlign: 'center' }}>
        <div className="animate-float" style={{ fontSize: 52 }}>🌍</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
          {cities.length === 0 ? 'No cities yet' : 'No results'}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300, maxWidth: 260 }}>
          {cities.length === 0 ? 'Add a city to start monitoring.' : 'Try a different search term.'}
        </p>
      </div>
    );
    if (view === 'grid') return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 12, paddingBottom: pb }}>
        {list.map((c, i) => <CityCard key={c._id} city={c} index={i} onFavorite={toggleFavorite} onDelete={deleteCity} deleting={deletingId === c._id} />)}
      </div>
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: pb }}>
        {list.map((c, i) => <CityRow key={c._id} city={c} index={i} onFavorite={toggleFavorite} onDelete={deleteCity} deleting={deletingId === c._id} />)}
      </div>
    );
  }

  /* ── SIDEBAR (desktop only, completely unchanged) ── */
  function Sidebar() {
    return (
      <>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⛅</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Sky<span style={{ color: 'var(--sky)' }}>Cast</span></span>
          </div>
          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              <div className="live-dot" style={{ width: 5, height: 5 }} />
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {cities.length > 0 && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Overview</p>
            {[
              { label: 'Cities tracked', val: String(cities.length) },
              { label: 'Average temp',   val: avgTemp ? `${avgTemp}°C` : '–' },
              { label: 'Hottest',        val: hottest ? `${hottest.name.split(',')[0]} · ${Math.round(hottest.weather?.temp ?? 0)}°` : '–' },
              { label: 'Coldest',        val: coldest ? `${coldest.name.split(',')[0]} · ${Math.round(coldest.weather?.temp ?? 0)}°` : '–' },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10, padding: '0 4px' }}>
            ⭐ Favourites {favorites.length > 0 && `(${favorites.length})`}
          </p>
          {favorites.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 4px', fontStyle: 'italic', fontWeight: 300 }}>Star a city to pin it here.</p>
          )}
          {favorites.map(c => (
            <div key={c._id}
              style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', transition: 'border-color 0.2s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(56,189,248,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{c.name}</p>
                <button onClick={() => toggleFavorite(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 2, lineHeight: 1 }} title="Unpin">⭐</button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--sky)', marginTop: 3 }}>
                {weatherEmoji(c.weather?.description)} {Math.round(c.weather?.temp ?? 0)}°C · {c.weather?.description || '–'}
              </p>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(251,113,133,0.2)', background: 'rgba(251,113,133,0.06)', color: 'var(--rose)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            <IcoLogout /> Sign Out
          </button>
        </div>
      </>
    );
  }

  /* ── ADD SHEET (mobile) ── */
  function AddSheet() {
    return (
      <>
        <div onClick={() => { setAddSheet(false); setAddError(''); setCityInput(''); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 60, backdropFilter: 'blur(6px)' }}
        />
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 70, background: 'var(--surface)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border)', borderBottom: 'none', padding: '0 20px 48px', animation: 'slideUp 0.3s cubic-bezier(.22,.68,0,1.2) forwards' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 20px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)' }} />
          </div>
          <button onClick={() => { setAddSheet(false); setAddError(''); setCityInput(''); }}
            style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
          ><IcoClose /></button>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Add a City</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, fontWeight: 300 }}>Monitor weather for any city worldwide.</p>

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}><IcoSearch /></span>
            <input
              autoFocus
              value={cityInput}
              onChange={e => { setCityInput(e.target.value); setAddError(''); }}
              onKeyDown={e => e.key === 'Enter' && addCity()}
              placeholder="e.g. London, Tokyo, New York…"
              className="input-dark"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 40, paddingRight: 16, paddingTop: 14, paddingBottom: 14, borderRadius: 14, fontSize: 16 }}
            />
          </div>

          {addError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', marginBottom: 12 }}>
              <span>⚠️</span>
              <p style={{ fontSize: 13, color: 'var(--rose)' }}>{addError}</p>
            </div>
          )}

          <button onClick={addCity} disabled={adding || !cityInput.trim()} className="btn-primary"
            style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {adding ? <><Spinner size={16} /> Adding…</> : <><IcoPlus /> Add City</>}
          </button>
        </div>
      </>
    );
  }

  /* ── MOBILE FAVORITES TAB ── */
  function MobileFavorites() {
    return (
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Favourites</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300, marginBottom: 20 }}>
          {favorites.length > 0 ? `${favorites.length} pinned ${favorites.length === 1 ? 'city' : 'cities'}` : 'No favourites yet'}
        </p>
        {favorites.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, gap: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 52 }}>⭐</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Nothing pinned yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300, maxWidth: 240 }}>Tap ☆ on any city card to pin it here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favorites.map((c, i) => {
              const risk = c.risk || { level: 'Normal', color: 'green' };
              const meta = RISK_META[risk.level] || RISK_META['Normal'];
              return (
                <div key={c._id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, animation: `fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) ${i * 0.05}s both` }}>
                  <div style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>{weatherEmoji(c.weather?.description)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 300, marginTop: 2 }}>{c.weather?.description || '–'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className={meta.cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />{risk.level}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>💧 {c.weather?.humidity ?? 0}%</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>💨 {Math.round(c.weather?.wind ?? 0)} m/s</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{Math.round(c.weather?.temp ?? 0)}°</span>
                    <button onClick={() => toggleFavorite(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 2, lineHeight: 1 }}>⭐</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── MOBILE ACCOUNT TAB ── */
  function MobileAccount() {
    return (
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Account</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300, marginBottom: 24 }}>Your session & stats</p>

        {cities.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { emoji: '🌍', label: 'Cities',   val: String(cities.length) },
              { emoji: '🌡️', label: 'Avg Temp', val: avgTemp ? `${avgTemp}°C` : '–' },
              { emoji: '🔥', label: 'Hottest',  val: hottest ? `${Math.round(hottest.weather?.temp ?? 0)}°C` : '–' },
              { emoji: '❄️', label: 'Coldest',  val: coldest ? `${Math.round(coldest.weather?.temp ?? 0)}°C` : '–' },
            ].map(({ emoji, label, val }) => (
              <div key={label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 24, marginBottom: 8, lineHeight: 1 }}>{emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {lastUpdated && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0, boxShadow: '0 0 8px rgba(74,222,128,0.5)', display: 'inline-block' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Live data active</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every 60s
              </p>
            </div>
          </div>
        )}

        <button onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px', borderRadius: 14, border: '1px solid rgba(251,113,133,0.25)', background: 'rgba(251,113,133,0.08)', color: 'var(--rose)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >
          <IcoLogout /> Sign Out
        </button>
      </div>
    );
  }

  /* ── NAV TAB BUTTON ── */
  function NavBtn({ tab, label, children }: { tab: MobileTab; label: string; children: React.ReactNode }) {
    const active = mobileTab === tab;
    return (
      <button
        onClick={() => setMobileTab(tab)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: active ? 'var(--sky)' : 'var(--text-muted)', transition: 'color 0.15s', position: 'relative', paddingBottom: 2 }}
      >
        <span style={{ transition: 'transform 0.15s', transform: active ? 'scale(1.1)' : 'scale(1)', display: 'flex' }}>{children}</span>
        <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{label}</span>
        {active && <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, borderRadius: 99, background: 'var(--sky)' }} />}
      </button>
    );
  }

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <AuthGuard>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

        {/* ════════ DESKTOP ════════ */}
        <aside className="hide-sm hide-md" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          <Sidebar />
        </aside>

        <main className="hide-sm hide-md" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <header style={{ flexShrink: 0, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1, maxWidth: 380 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}><IcoSearch /></span>
                  <input value={cityInput} onChange={e => { setCityInput(e.target.value); setAddError(''); }} onKeyDown={e => e.key === 'Enter' && addCity()} placeholder="Add a city…" className="input-dark" style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: 13 }} />
                </div>
                <button onClick={addCity} disabled={adding || !cityInput.trim()} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {adding ? <Spinner /> : '+ Add'}
                </button>
              </div>
              {addError && <p style={{ fontSize: 11, color: 'var(--rose)', marginTop: 4 }}>{addError}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter…" className="input-dark" style={{ padding: '7px 12px', borderRadius: 9, fontSize: 12, width: 120 }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className="input-dark" style={{ padding: '7px 10px', borderRadius: 9, fontSize: 12, cursor: 'pointer' }}>
                <option value="name">A–Z</option>
                <option value="temp">Temp ↓</option>
                <option value="humidity">Humid ↓</option>
              </select>
              <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {(['grid', 'list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.15s, color 0.15s', background: view === v ? 'rgba(56,189,248,0.12)' : 'transparent', color: view === v ? 'var(--sky)' : 'var(--text-muted)' }}>
                    {v === 'grid' ? <IcoGrid /> : <IcoList />}
                  </button>
                ))}
              </div>
            </div>
          </header>
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px, 2vw, 24px)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
              Global Stations · {nonFavs.length} {nonFavs.length === 1 ? 'city' : 'cities'}
            </p>
            {renderCities(nonFavs)}
          </div>
        </main>

        {/* ════════ MOBILE ════════ */}
        <div className="hide-lg" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Top bar */}
          <header style={{ flexShrink: 0, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⛅</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Sky<span style={{ color: 'var(--sky)' }}>Cast</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {cities.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 99 }}>
                  {cities.length} {cities.length === 1 ? 'city' : 'cities'}
                </span>
              )}
              {lastUpdated && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live</span>
                </div>
              )}
            </div>
          </header>

          {/* Tab content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {mobileTab === 'cities' && (
              <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}><IcoSearch /></span>
                    <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search cities…" className="input-dark" style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, fontSize: 13 }} />
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className="input-dark" style={{ padding: '9px 10px', borderRadius: 10, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                    <option value="name">A–Z</option>
                    <option value="temp">Temp</option>
                    <option value="humidity">Humid</option>
                  </select>
                  <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                    {(['grid', 'list'] as const).map(v => (
                      <button key={v} onClick={() => setView(v)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: view === v ? 'rgba(56,189,248,0.12)' : 'transparent', color: view === v ? 'var(--sky)' : 'var(--text-muted)' }}>
                        {v === 'grid' ? <IcoGrid /> : <IcoList />}
                      </button>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                  All Cities · {nonFavs.length}
                </p>
                {renderCities(nonFavs, true)}
              </div>
            )}
            {mobileTab === 'favorites' && <MobileFavorites />}
            {mobileTab === 'account'   && <MobileAccount />}
          </div>

          {/* Bottom nav */}
          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 68, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', zIndex: 30 }}>
            <NavBtn tab="cities" label="Cities"><IcoHome /></NavBtn>

            {/* Favorites with badge */}
            <button
              onClick={() => setMobileTab('favorites')}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: mobileTab === 'favorites' ? 'var(--sky)' : 'var(--text-muted)', transition: 'color 0.15s', position: 'relative', paddingBottom: 2 }}
            >
              <span style={{ transition: 'transform 0.15s', transform: mobileTab === 'favorites' ? 'scale(1.1)' : 'scale(1)', display: 'flex', position: 'relative' }}>
                <IcoStar filled={mobileTab === 'favorites'} />
                {favorites.length > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 99, background: 'var(--sky)', color: '#05080f', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 }}>
                    {favorites.length}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, fontWeight: mobileTab === 'favorites' ? 700 : 400 }}>Favorites</span>
              {mobileTab === 'favorites' && <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, borderRadius: 99, background: 'var(--sky)' }} />}
            </button>

            {/* Add FAB */}
            <button onClick={() => setAddSheet(true)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,165,233,0.35)', transition: 'transform 0.15s', color: 'white' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
              ><IcoPlus /></div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Add</span>
            </button>

            <NavBtn tab="account" label="Account"><IcoUser /></NavBtn>
          </nav>
        </div>

        {/* Add sheet portal */}
        {addSheet && <AddSheet />}

        <AIChat />
      </div>
    </AuthGuard>
  );
}

/* ═════════════════════════════════════════════
   CITY CARD
═════════════════════════════════════════════ */
function CityCard({ city, index, onFavorite, onDelete, deleting }: {
  city: City; index: number;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const risk = city.risk || { level: 'Normal', color: 'green' };
  const meta = RISK_META[risk.level] || RISK_META['Normal'];

  return (
    <div className="animate-fade-up card-hover"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden', animationDelay: `${index * 0.04}s`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${meta.dot}55,transparent)` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</h3>
          {city.weather?.country && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{city.weather.country}</p>}
        </div>
        <button onClick={() => onFavorite(city._id)} title={city.isFavorite ? 'Unpin' : 'Pin'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px', marginLeft: 8, transition: 'transform 0.15s', flexShrink: 0, lineHeight: 1 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >{city.isFavorite ? '⭐' : '☆'}</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{Math.round(city.weather?.temp ?? 0)}°</span>
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>{weatherEmoji(city.weather?.description)}</div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, textTransform: 'capitalize', fontWeight: 300 }}>{city.weather?.description || '–'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
        {[
          { ico: '💧', label: 'Humidity', val: `${city.weather?.humidity ?? 0}%` },
          { ico: '💨', label: 'Wind',     val: city.weather?.wind != null ? `${Math.round(city.weather.wind)} m/s` : '–' },
          { ico: '🌡️', label: 'Feels',    val: city.weather?.feelsLike != null ? `${Math.round(city.weather.feelsLike)}°` : '–' },
        ].map(({ ico, label, val }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, lineHeight: 1 }}>{ico}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 3 }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Pressure',   val: city.weather?.pressure   != null ? `${city.weather.pressure} hPa`                      : '–' },
          { label: 'Visibility', val: city.weather?.visibility != null ? `${(city.weather.visibility/1000).toFixed(1)} km`    : '–' },
          { label: 'Wind Dir',   val: windDir(city.weather?.windDir) },
        ].map(({ label, val }) => (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <span className={meta.cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
          {risk.level}
        </span>
        <button onClick={() => onDelete(city._id)} disabled={deleting} className="remove-btn"
          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 7, border: '1px solid rgba(251,113,133,0.15)', background: 'rgba(251,113,133,0.06)', color: 'var(--rose)', cursor: 'pointer', opacity: 0, fontWeight: 500, transition: 'opacity 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0'; }}
        >{deleting ? '…' : 'Remove'}</button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   CITY ROW
═════════════════════════════════════════════ */
function CityRow({ city, index, onFavorite, onDelete, deleting }: {
  city: City; index: number;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const risk = city.risk || { level: 'Normal', color: 'green' };
  const meta = RISK_META[risk.level] || RISK_META['Normal'];
  const [hovered, setHovered] = useState(false);

  return (
    <div className="animate-fade-up"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: hovered ? 'rgba(255,255,255,0.025)' : 'var(--surface2)', border: `1px solid ${hovered ? 'rgba(56,189,248,0.2)' : 'var(--border)'}`, transition: 'background 0.2s, border-color 0.2s', animationDelay: `${index * 0.03}s`, opacity: 0, animationFillMode: 'forwards', cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{weatherEmoji(city.weather?.description)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 300 }}>{city.weather?.description || '–'}</p>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, flexShrink: 0, minWidth: 60, textAlign: 'right' }}>{Math.round(city.weather?.temp ?? 0)}°C</div>
      <div className="hide-sm" style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0, minWidth: 120 }}>
        <span>💧 {city.weather?.humidity ?? 0}%</span>
        <span>💨 {Math.round(city.weather?.wind ?? 0)} m/s</span>
      </div>
      <span className={`hide-sm ${meta.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
        {risk.level}
      </span>
      <button onClick={() => onFavorite(city._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, flexShrink: 0, transition: 'transform 0.15s', lineHeight: 1 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >{city.isFavorite ? '⭐' : '☆'}</button>
      <button onClick={() => onDelete(city._id)} disabled={deleting} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--rose)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s', flexShrink: 0 }}>
        {deleting ? '…' : '✕'}
      </button>
    </div>
  );
}
