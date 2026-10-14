'use client';

import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceSession } from '@/lib/types';

interface AttendanceCalendarProps {
  sessions: AttendanceSession[];
  timezone?: string;
}

export default function AttendanceCalendar({
  sessions,
  timezone = 'Asia/Kolkata',
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  // Set of dates where user attended: YYYY-MM-DD
  const attendedDates = new Set(sessions.map((s) => s.localDate));

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const isAttended = attendedDates.has(formattedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());

      days.push(
        <div
          key={day.toString()}
          className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all ${
            isCurrentMonth ? 'bg-gray-900/60 border-white/5' : 'bg-black/20 border-transparent opacity-30'
          } ${isToday ? 'ring-1 ring-emerald-400/50' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                isToday ? 'text-emerald-400 font-bold' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {format(day, 'd')}
            </span>
            {isToday && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold">
                Today
              </span>
            )}
          </div>

          {isAttended && (
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate hidden sm:inline">+10 pts</span>
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1.5">
        {days}
      </div>
    );
    days = [];
  }

  const weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
          <span className="text-xs text-gray-500">({timezone})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-gray-400 py-1">
        {weekHeaders.map((header) => (
          <div key={header}>{header}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1.5">{rows}</div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/5 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
          <span>Qualifying Visit (+10 pts)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-800 border border-white/10" />
          <span>Rest / Off Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-emerald-400/50" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
