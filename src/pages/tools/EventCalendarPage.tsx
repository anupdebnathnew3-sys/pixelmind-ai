import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Calendar, Globe, ChevronLeft, ChevronRight, Search, Clock, Copy, Check } from 'lucide-react';
import { getHolidaysForMonth, getUpcomingHolidays } from '../../data/holidays';
import type { Holiday } from '../../types';

const COUNTRIES = ['All', 'Bangladesh', 'USA', 'UK', 'Canada', 'Australia', 'India'];

const COUNTRY_FLAGS: Record<string, string> = {
  All: '🌍', Bangladesh: '🇧🇩', USA: '🇺🇸',
  UK: '🇬🇧', Canada: '🇨🇦', Australia: '🇦🇺', India: '🇮🇳',
};

const TYPE_CONFIG: Record<Holiday['type'], {
  label: string; dot: string; leftBar: string;
  dateBg: string; dateText: string;
  badgeBg: string; badgeText: string;
  cardHover: string;
}> = {
  holiday: {
    label: 'Public Holiday',
    dot: 'bg-red-500',
    leftBar: 'bg-red-500',
    dateBg: 'bg-red-50 dark:bg-red-500/10',
    dateText: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-500/20',
    badgeText: 'text-red-700 dark:text-red-300',
    cardHover: 'hover:border-red-200 dark:hover:border-red-500/30',
  },
  observance: {
    label: 'Observance',
    dot: 'bg-amber-500',
    leftBar: 'bg-amber-500',
    dateBg: 'bg-amber-50 dark:bg-amber-500/10',
    dateText: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    cardHover: 'hover:border-amber-200 dark:hover:border-amber-500/30',
  },
  event: {
    label: 'Event',
    dot: 'bg-blue-500',
    leftBar: 'bg-blue-500',
    dateBg: 'bg-blue-50 dark:bg-blue-500/10',
    dateText: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    cardHover: 'hover:border-blue-200 dark:hover:border-blue-500/30',
  },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type CategoryFilter = 'all' | Holiday['type'];

function useCountdown(dateStr: string | null) {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    if (!dateStr) return;
    const target = new Date(dateStr + 'T00:00:00');
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCd({ days: 0, hours: 0, minutes: 0 }); return; }
      setCd({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [dateStr]);
  return cd;
}

export const EventCalendarPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const today = new Date();

  const allMonthHolidays = getHolidaysForMonth(year, month);
  const monthHolidays = allMonthHolidays.filter(h =>
    (selectedCountry === 'All' || h.country === selectedCountry || h.country === 'All') &&
    (searchQuery === '' || h.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredHolidays = monthHolidays.filter(h => categoryFilter === 'all' || h.type === categoryFilter);

  const upcomingHolidays = getUpcomingHolidays(6).filter(h =>
    selectedCountry === 'All' || h.country === selectedCountry || h.country === 'All'
  );
  const nextHoliday = upcomingHolidays[0] ?? null;
  const countdown = useCountdown(nextHoliday?.date ?? null);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const getDayHolidays = (day: number) => {
    const ds = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthHolidays.filter(h => h.date === ds);
  };

  const changeMonth = (dir: 1 | -1) => {
    setCurrentDate(p => { const d = new Date(p); d.setMonth(d.getMonth() + dir); return d; });
    setSelectedDay(null);
  };

  const monthStats = {
    holiday: monthHolidays.filter(h => h.type === 'holiday').length,
    observance: monthHolidays.filter(h => h.type === 'observance').length,
    event: monthHolidays.filter(h => h.type === 'event').length,
  };

  const displayHolidays = selectedDay
    ? getDayHolidays(selectedDay).filter(h => categoryFilter === 'all' || h.type === categoryFilter)
    : filteredHolidays;

  const copyOne = (h: Holiday) => {
    navigator.clipboard.writeText(h.name);
    setCopiedId(h.date + h.name);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = () => {
    if (!displayHolidays.length) return;
    const lines = displayHolidays.map((h, i) => {
      const d = new Date(h.date + 'T00:00:00');
      const ds = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
      return `${i + 1}. ${ds} — ${h.name} [${COUNTRY_FLAGS[h.country] ?? ''} ${h.country}] · ${TYPE_CONFIG[h.type].label}`;
    });
    const header = `📅 ${MONTH_NAMES[month - 1]} ${year} — Holiday & Event List\n`;
    navigator.clipboard.writeText(header + lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Page title ───────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Holiday & Event Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Global public holidays, national observances &amp; events
          </p>
        </div>

        {/* ── Month navigation bar ─────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] shadow-sm">
          {/* Nav arrows + month/year */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1] hover:text-[#6366F1] transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="min-w-[160px] text-center">
              <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                {MONTH_NAMES[month - 1]} {year}
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1] hover:text-[#6366F1] transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Stats chips */}
          <div className="flex items-center gap-2 flex-wrap ml-1">
            {[
              { label: 'Holidays', count: monthStats.holiday, dot: 'bg-red-500' },
              { label: 'Observances', count: monthStats.observance, dot: 'bg-amber-500' },
              { label: 'Events', count: monthStats.event, dot: 'bg-blue-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650]">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.count}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Spacer + right actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { setCurrentDate(new Date()); setSelectedDay(today.getDate()); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] border border-[#A5B4FC]/30 dark:border-[#6366F1]/25 hover:bg-[#6366F1] hover:text-white transition-all"
            >
              Today
            </button>
            <button
              onClick={copyAll}
              disabled={displayHolidays.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border ${
                copiedAll
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-400'
                  : 'bg-gray-50 dark:bg-[#0d1030] border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1] hover:text-[#6366F1]'
              }`}
            >
              {copiedAll ? <Check size={12} /> : <Copy size={12} />}
              {copiedAll ? 'Copied!' : 'Copy All'}
            </button>
          </div>
        </div>

        {/* ── Main grid ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-7 gap-5">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-2 space-y-4">

            {/* Mini calendar */}
            <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                {MONTH_NAMES[month - 1]} {year}
              </p>
              <div className="grid grid-cols-7 text-center mb-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="py-1 text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dh = getDayHolidays(day);
                  const isToday = today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
                  const isSel = selectedDay === day;
                  const hasHoliday = dh.some(h => h.type === 'holiday');
                  const hasObs = dh.some(h => h.type === 'observance');
                  const hasEvt = dh.some(h => h.type === 'event');
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSel ? null : day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative transition-all ${
                        isToday ? 'bg-[#6366F1] text-white font-bold shadow-sm' :
                        isSel ? 'bg-[#EEF2FF] dark:bg-[#6366F1]/25 text-[#6366F1] font-bold ring-1 ring-[#6366F1]' :
                        dh.length > 0 ? 'font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#232650]' :
                        'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232650]'
                      }`}
                    >
                      {day}
                      {dh.length > 0 && (
                        <div className="flex gap-[2px] absolute bottom-[2px]">
                          {hasHoliday && <span className="w-[4px] h-[4px] rounded-full bg-red-500" />}
                          {hasObs && <span className="w-[4px] h-[4px] rounded-full bg-amber-500" />}
                          {hasEvt && <span className="w-[4px] h-[4px] rounded-full bg-blue-500" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-[#232650]">
                {[
                  { label: 'Holiday', color: 'bg-red-500' },
                  { label: 'Observance', color: 'bg-amber-500' },
                  { label: 'Event', color: 'bg-blue-500' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countdown to next holiday */}
            {nextHoliday && (
              <div className="rounded-2xl p-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/20">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="opacity-80" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Next Holiday</span>
                </div>
                <p className="font-extrabold text-sm leading-tight mb-0.5">{nextHoliday.name}</p>
                <p className="text-xs opacity-70 mb-4">
                  {COUNTRY_FLAGS[nextHoliday.country]} {nextHoliday.country} ·{' '}
                  {new Date(nextHoliday.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: countdown.days, l: 'Days' },
                    { v: countdown.hours, l: 'Hrs' },
                    { v: countdown.minutes, l: 'Min' },
                  ].map(({ v, l }) => (
                    <div key={l} className="bg-white/15 rounded-xl py-2 text-center">
                      <p className="text-xl font-extrabold leading-none">{String(v).padStart(2, '0')}</p>
                      <p className="text-[9px] opacity-70 mt-0.5 uppercase tracking-wider">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingHolidays.length > 0 && (
              <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Upcoming</p>
                <div className="space-y-2.5">
                  {upcomingHolidays.slice(0, 5).map((h, i) => {
                    const d = new Date(h.date + 'T00:00:00');
                    const cfg = TYPE_CONFIG[h.type];
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${cfg.dateBg}`}>
                          <span className={`text-[8px] font-bold uppercase ${cfg.dateText}`}>
                            {d.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className={`text-sm font-extrabold leading-none ${cfg.dateText}`}>{d.getDate()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight">{h.name}</p>
                          <p className="text-[10px] text-gray-400">{COUNTRY_FLAGS[h.country] || ''} {h.country}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Country filter */}
            <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                <Globe size={10} className="inline mr-1" />Country
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => { setSelectedCountry(c); setSelectedDay(null); }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                      selectedCountry === c
                        ? 'bg-[#6366F1] text-white shadow-sm'
                        : 'bg-gray-50 dark:bg-[#0d1030] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 hover:text-[#6366F1]'
                    }`}
                  >
                    <span>{COUNTRY_FLAGS[c]}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN HOLIDAY LIST */}
          <div className="lg:col-span-5 space-y-4">

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search holidays or events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#131635] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { id: 'all' as CategoryFilter, label: 'All', count: monthHolidays.length, dot: '' },
                  { id: 'holiday' as CategoryFilter, label: 'Holidays', count: monthStats.holiday, dot: 'bg-red-500' },
                  { id: 'observance' as CategoryFilter, label: 'Observances', count: monthStats.observance, dot: 'bg-amber-500' },
                  { id: 'event' as CategoryFilter, label: 'Events', count: monthStats.event, dot: 'bg-blue-500' },
                ]).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      categoryFilter === cat.id
                        ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-sm shadow-[#6366F1]/20'
                        : 'bg-white dark:bg-[#131635] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#232650] hover:border-[#6366F1]/40 hover:text-[#6366F1]'
                    }`}
                  >
                    {cat.dot && <span className={`w-2 h-2 rounded-full ${categoryFilter === cat.id ? 'bg-white' : cat.dot}`} />}
                    {cat.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      categoryFilter === cat.id ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-[#232650] text-gray-500 dark:text-gray-400'
                    }`}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#6366F1]" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedDay
                    ? `${MONTH_NAMES[month - 1]} ${selectedDay}, ${year}`
                    : `${MONTH_NAMES[month - 1]} ${year}`}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  — {displayHolidays.length} {displayHolidays.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              {selectedDay && (
                <button onClick={() => setSelectedDay(null)} className="text-xs text-[#6366F1] hover:underline font-medium">
                  ← Show all month
                </button>
              )}
            </div>

            {/* Holiday cards */}
            {displayHolidays.length > 0 ? (
              <div className="space-y-3">
                {displayHolidays.map((h, i) => {
                  const d = new Date(h.date + 'T00:00:00');
                  const dayNum = d.getDate();
                  const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const cfg = TYPE_CONFIG[h.type];
                  const key = h.date + h.name;
                  const isCopied = copiedId === key;

                  return (
                    <div
                      key={i}
                      className={`flex items-stretch bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${cfg.cardHover}`}
                    >
                      {/* Colored left accent bar */}
                      <div className={`w-1.5 flex-shrink-0 ${cfg.leftBar}`} />

                      {/* Date block */}
                      <div className={`w-[72px] flex-shrink-0 flex flex-col items-center justify-center py-4 px-2 ${cfg.dateBg} border-r border-gray-100 dark:border-[#232650]`}>
                        <span className={`text-[10px] font-bold tracking-wider ${cfg.dateText}`}>{monthShort}</span>
                        <span className={`text-3xl font-extrabold leading-none my-0.5 ${cfg.dateText}`}>{dayNum}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{weekday}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-4 py-3.5 min-w-0 flex flex-col justify-center">
                        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight mb-1.5">
                          {h.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{COUNTRY_FLAGS[h.country] ?? <Globe size={11} />}</span>
                            <span>{h.country}</span>
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Copy button — always visible */}
                      <div className="flex-shrink-0 flex items-center px-4 border-l border-gray-100 dark:border-[#232650]">
                        <button
                          onClick={() => copyOne(h)}
                          title="Copy holiday name"
                          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-semibold transition-all ${
                            isCopied
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-gray-50 dark:bg-[#0d1030] text-gray-400 dark:text-gray-500 hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/15 hover:text-[#6366F1] border border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/30'
                          }`}
                        >
                          {isCopied ? <Check size={15} /> : <Copy size={15} />}
                          {isCopied ? 'Done' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] py-20 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650] flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                  No {categoryFilter !== 'all' ? TYPE_CONFIG[categoryFilter as Holiday['type']].label.toLowerCase() + 's' : 'events'} found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {selectedDay
                    ? `Nothing on ${MONTH_NAMES[month - 1]} ${selectedDay}`
                    : `Try a different month or country`}
                </p>
                {(selectedDay || searchQuery || categoryFilter !== 'all') && (
                  <button
                    onClick={() => { setSelectedDay(null); setSearchQuery(''); setCategoryFilter('all'); }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/15 hover:bg-[#6366F1] hover:text-white transition-all"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
