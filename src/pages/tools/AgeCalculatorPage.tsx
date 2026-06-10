import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Star, Gift, RefreshCw } from 'lucide-react';

function getZodiacSign(month: number, day: number): { sign: string; emoji: string } {
  const signs = [
    { sign: 'Capricorn', emoji: '♑', from: [12, 22], to: [1, 19] },
    { sign: 'Aquarius', emoji: '♒', from: [1, 20], to: [2, 18] },
    { sign: 'Pisces', emoji: '♓', from: [2, 19], to: [3, 20] },
    { sign: 'Aries', emoji: '♈', from: [3, 21], to: [4, 19] },
    { sign: 'Taurus', emoji: '♉', from: [4, 20], to: [5, 20] },
    { sign: 'Gemini', emoji: '♊', from: [5, 21], to: [6, 20] },
    { sign: 'Cancer', emoji: '♋', from: [6, 21], to: [7, 22] },
    { sign: 'Leo', emoji: '♌', from: [7, 23], to: [8, 22] },
    { sign: 'Virgo', emoji: '♍', from: [8, 23], to: [9, 22] },
    { sign: 'Libra', emoji: '♎', from: [9, 23], to: [10, 22] },
    { sign: 'Scorpio', emoji: '♏', from: [10, 23], to: [11, 21] },
    { sign: 'Sagittarius', emoji: '♐', from: [11, 22], to: [12, 21] },
  ];

  for (const z of signs) {
    if (z.sign === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: z.sign, emoji: z.emoji };
    } else {
      if ((month === z.from[0] && day >= z.from[1]) || (month === z.to[0] && day <= z.to[1])) {
        return { sign: z.sign, emoji: z.emoji };
      }
    }
  }
  return { sign: 'Unknown', emoji: '⭐' };
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  zodiac: { sign: string; emoji: string };
  isToday: boolean;
}

function calculateAge(dob: Date, now: Date): AgeResult {
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }

  const totalMs = now.getTime() - dob.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const totalSeconds = Math.floor(totalMs / 1000);

  // Next birthday
  let nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= now) nextBirthday = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = daysUntilBirthday === 0 || daysUntilBirthday === 365 || daysUntilBirthday === 366;

  return {
    years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, totalSeconds,
    nextBirthday, daysUntilBirthday, zodiac: getZodiacSign(dob.getMonth() + 1, dob.getDate()), isToday,
  };
}

export const AgeCalculatorPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState('');

  // Live ticker every second when result is shown
  useEffect(() => {
    if (!result) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [result]);

  // Recalculate on every tick
  const liveResult = result && dob
    ? calculateAge(new Date(dob), now)
    : result;

  const calculate = () => {
    setError('');
    if (!dob) { setError('Please enter your date of birth'); return; }
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) { setError('Invalid date'); return; }
    if (dobDate > new Date()) { setError('Date of birth cannot be in the future'); return; }
    setResult(calculateAge(dobDate, new Date()));
    setNow(new Date());
  };

  const reset = () => { setDob(''); setResult(null); setError(''); };

  const stat = (label: string, value: string | number, sub?: string) => (
    <div className="text-center">
      <p className="text-2xl font-bold text-[#6366F1]">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  );

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Age Calculator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your date of birth for a complete age breakdown</p>
        </div>

        {/* Input */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={e => { setDob(e.target.value); setResult(null); setError(''); }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <Button onClick={calculate} icon={<Clock size={16} />}>Calculate Age</Button>
            {result && <Button variant="ghost" onClick={reset} icon={<RefreshCw size={14} />}>Reset</Button>}
          </div>
        </Card>

        {liveResult && (
          <>
            {/* Birthday banner */}
            {liveResult.isToday && (
              <div className="bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] rounded-2xl p-4 text-center text-white">
                <p className="text-2xl font-bold">Happy Birthday! 🎂</p>
                <p className="text-sm opacity-90">Wishing you a wonderful day!</p>
              </div>
            )}

            {/* Main age display */}
            <Card>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Age</p>
              <div className="grid grid-cols-3 gap-6 text-center py-4">
                {stat('Years', liveResult.years)}
                {stat('Months', liveResult.months, 'remaining')}
                {stat('Days', liveResult.days, 'remaining')}
              </div>
              <div className="text-center mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You are <strong className="text-[#6366F1]">{liveResult.years} years, {liveResult.months} months, and {liveResult.days} days</strong> old
                </p>
              </div>
            </Card>

            {/* Totals */}
            <Card>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Total Count (Live)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stat('Total Days', liveResult.totalDays)}
                {stat('Total Weeks', liveResult.totalWeeks)}
                {stat('Total Hours', liveResult.totalHours)}
                {stat('Total Minutes', liveResult.totalMinutes)}
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">Seconds alive (live ticker)</p>
                <p className="text-3xl font-bold text-[#6366F1] font-mono mt-1">{liveResult.totalSeconds.toLocaleString()}</p>
              </div>
            </Card>

            {/* Next birthday + Zodiac */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Gift size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Next Birthday</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {liveResult.nextBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="bg-[#EEF2FF] dark:bg-[#6366F1]/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#6366F1]">{liveResult.daysUntilBirthday}</p>
                  <p className="text-xs text-gray-500">days to go</p>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Star size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Zodiac Sign</p>
                    <p className="font-bold text-gray-900 dark:text-white">{liveResult.zodiac.sign}</p>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-3 text-center">
                  <p className="text-4xl">{liveResult.zodiac.emoji}</p>
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mt-1">{liveResult.zodiac.sign}</p>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <Card>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Age Summary</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Born on', value: new Date(dob).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Zodiac Sign', value: `${liveResult.zodiac.emoji} ${liveResult.zodiac.sign}` },
                  { label: 'Age', value: `${liveResult.years} years, ${liveResult.months} months, ${liveResult.days} days` },
                  { label: 'Total Days Lived', value: liveResult.totalDays.toLocaleString() },
                  { label: 'Total Weeks Lived', value: liveResult.totalWeeks.toLocaleString() },
                  { label: 'Next Birthday', value: liveResult.nextBirthday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Days Until Birthday', value: liveResult.daysUntilBirthday.toLocaleString() },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-[#232650] last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {!result && (
          <div className="text-center py-16 text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Enter your date of birth above</p>
            <p className="text-sm mt-1">Get your full age breakdown, zodiac sign, and birthday countdown</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
