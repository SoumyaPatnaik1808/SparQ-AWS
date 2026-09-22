"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, ExternalLink, MapPin, X } from "lucide-react";
import { getSessions, SparqSession } from "../actions/sessions";

interface SessionCalendarProps {
  studentEmail: string;
}

export default function SessionCalendar({ studentEmail }: SessionCalendarProps) {
  const [sessions, setSessions] = useState<SparqSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SparqSession | null>(null);
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const nextSessions = await getSessions();
        if (active) {
          setSessions(nextSessions.sort((a, b) => a.startTime.localeCompare(b.startTime)));
          setConnectionError("");
        }
      } catch {
        if (active) setConnectionError("Live updates are temporarily unavailable.");
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [studentEmail]);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, []);

  const daySessions = (day: Date) => sessions.filter((session) => {
    const date = new Date(session.startTime);
    return date.toDateString() === day.toDateString();
  });

  const formatTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (value: string) => new Date(value).toLocaleDateString([], { dateStyle: "medium" });

  return (
    <section className="w-full rounded-2xl border border-[#1a261f] bg-[#0d1410] p-4 shadow-2xl sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f28b50]">Live calendar</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Upcoming sessions</h1>
          <p className="mt-2 text-sm text-[#88948d]">Sessions selected by your communities appear here automatically.</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#1e3b2a] bg-[#11241a] px-3 py-1 text-xs font-semibold text-[#4ade80]">
          Real-time
        </span>
      </div>

      {connectionError && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{connectionError}</p>}
      <div className="overflow-x-auto rounded-xl border border-[#1a261f] bg-[#0a0f0c]">
        <div className="grid min-w-[760px] grid-cols-[72px_repeat(7,minmax(96px,1fr))]">
          <div className="border-b border-[#1a261f] p-3 text-[10px] font-bold uppercase tracking-widest text-[#5e6a63]">Time</div>
          {days.map((day) => <div key={day.toISOString()} className={`border-b border-l border-[#1a261f] p-3 text-center ${day.toDateString() === new Date().toDateString() ? "bg-[#14251d]" : ""}`}><p className="text-[10px] font-bold uppercase text-[#88948d]">{day.toLocaleDateString([], { weekday: "short" })}</p><p className="mt-1 text-sm font-semibold">{day.getDate()}</p></div>)}
          {Array.from({ length: 12 }, (_, index) => index + 8).map((hour) => <div key={hour} className="contents"><div className="border-b border-[#1a261f] p-3 text-xs text-[#88948d]">{String(hour).padStart(2, "0")}:00</div>{days.map((day) => <div key={`${day.toISOString()}-${hour}`} className="min-h-16 border-b border-l border-[#1a261f] p-1.5">{daySessions(day).filter((session) => new Date(session.startTime).getHours() === hour).map((session) => <button type="button" key={session.id} onClick={() => setSelectedSession(session)} className="w-full rounded-md border-l-2 border-[#f28b50] bg-[#193127] p-2 text-left text-xs transition-colors hover:bg-[#234636]"><span className="block font-semibold text-white">{formatTime(session.startTime)} · {session.title}</span><span className="mt-1 block truncate text-[#a0ada6]">{session.communityName}</span></button>)}</div>)}</div>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#a0ada6]"><span className="rounded-md border border-[#f28b50]/40 bg-[#f28b50]/10 px-2 py-1 text-[#f28b50]">Hosting</span><span className="rounded-md border border-[#65d6c3]/40 bg-[#65d6c3]/10 px-2 py-1 text-[#65d6c3]">Attending</span></div>
      {sessions.length === 0 && <p className="mt-4 text-center text-sm text-[#88948d]">No sessions scheduled yet.</p>}
      {selectedSession && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><article className="w-full max-w-lg rounded-2xl border border-[#2a3c31] bg-[#111914] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="mb-2 inline-flex rounded-md bg-[#f28b50]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f28b50]">{selectedSession.viewerType === "hosting" ? "Hosting" : "Attending"}</div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f28b50]">{selectedSession.communityName}</p><h2 className="mt-2 text-2xl font-bold">{selectedSession.title}</h2></div><button type="button" title="Close session details" onClick={() => setSelectedSession(null)}><X className="h-5 w-5 text-[#88948d]" /></button></div><p className="mt-4 leading-relaxed text-[#a0ada6]">{selectedSession.description}</p><div className="mt-5 grid gap-3 text-sm text-[#d0d8d3]"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#f28b50]" /> {formatDate(selectedSession.startTime)}</p><p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#f28b50]" /> {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#f28b50]" /> Session details available to community members</p><p className="text-xs text-[#88948d]">Host: {selectedSession.hostEmail}</p></div>{selectedSession.meetingUrl && <a href={selectedSession.meetingUrl} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#f28b50] py-3 text-sm font-bold text-black">Open session link <ExternalLink className="h-4 w-4" /></a>}</article></div>}
    </section>
  );
}