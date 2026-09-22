"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Users,
  Video,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { createCommunity } from "../actions/community";
import { createSession } from "../actions/sessions";

type CommunityType = "owned" | "member";
type Attendance = "attending" | "not attending" | null;

interface Community {
  id: string;
  name: string;
  initials: string;
  accent: string;
  topic: string;
  members: number;
  type: CommunityType;
  unread?: number;
}

interface Message {
  id: number;
  author: string;
  role: "teacher" | "student";
  initials: string;
  time: string;
  text: string;
  kind?: "lesson" | "session";
  attendees?: number;
}

const communities: Community[] = [
  {
    id: "shader-lab",
    name: "Shader Lab",
    initials: "SL",
    accent: "#f28b50",
    topic: "WebGL and realtime graphics",
    members: 18,
    type: "owned",
    unread: 3,
  },
  {
    id: "react-native",
    name: "React Native builders",
    initials: "RN",
    accent: "#65d6c3",
    topic: "Mobile architecture swaps",
    members: 24,
    type: "member",
  },
  {
    id: "figma-studio",
    name: "Figma studio",
    initials: "FS",
    accent: "#a78bfa",
    topic: "Product design critiques",
    members: 11,
    type: "member",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    author: "Maya Chen",
    role: "teacher",
    initials: "MC",
    time: "Today, 9:42 AM",
    text: "This week we are building a small procedural terrain scene. Start with the noise function in the lesson below, then bring one experiment to our live session.",
    kind: "lesson",
  },
  {
    id: 2,
    author: "Maya Chen",
    role: "teacher",
    initials: "MC",
    time: "Today, 9:45 AM",
    text: "Live shader critique",
    kind: "session",
    attendees: 7,
  },
  {
    id: 3,
    author: "Arjun Rao",
    role: "student",
    initials: "AR",
    time: "Today, 10:06 AM",
    text: "The terrain prompt was exactly what I needed. I am joining the critique session and will share my node graph.",
  },
  {
    id: 4,
    author: "Sofia Kim",
    role: "student",
    initials: "SK",
    time: "Today, 10:14 AM",
    text: "I will be there too. Is anyone testing this with a low-poly mesh?",
  },
];

const memberMessages: Message[] = [
  {
    id: 11,
    author: "Noah Williams",
    role: "teacher",
    initials: "NW",
    time: "Yesterday, 4:18 PM",
    text: "Tomorrow’s swap is about navigation patterns that stay fast as your app grows. Bring one screen you would like feedback on.",
    kind: "lesson",
  },
  {
    id: 12,
    author: "Noah Williams",
    role: "teacher",
    initials: "NW",
    time: "Yesterday, 4:22 PM",
    text: "Navigation architecture office hours",
    kind: "session",
    attendees: 12,
  },
  {
    id: 13,
    author: "Priya Shah",
    role: "student",
    initials: "PS",
    time: "Yesterday, 5:02 PM",
    text: "I am attending. I will bring the routing issue from my capstone app.",
  },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function CommunityPage() {
  const [selectedId, setSelectedId] = useState("shader-lab");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [attendance, setAttendance] = useState<Attendance>(null);
  const [attendeeCount, setAttendeeCount] = useState(7);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [communityError, setCommunityError] = useState("");
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityList, setCommunityList] = useState(communities);
  const [sessionError, setSessionError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionSlotLocked, setSessionSlotLocked] = useState(false);
  const [lockedSlot, setLockedSlot] = useState({ startTime: "", endTime: "" });

  const selectedCommunity = communityList.find((community) => community.id === selectedId) ?? communityList[0];
  const isTeacherCommunity = selectedCommunity.type === "owned";
  const upcomingDate = isTeacherCommunity ? "Wed, Sep 23" : "Fri, Sep 25";
  const upcomingTime = isTeacherCommunity ? "6:00 PM - 7:00 PM" : "5:30 PM - 6:30 PM";
  const activeMessages = useMemo(
    () => (isTeacherCommunity ? messages : memberMessages),
    [isTeacherCommunity, messages],
  );

  const selectCommunity = (community: Community) => {
    setSelectedId(community.id);
    setAttendance(null);
    setShowSchedule(false);
  };

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !isTeacherCommunity) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        author: "You",
        role: "teacher",
        initials: "YO",
        time: formatTime(new Date()),
        text,
      },
    ]);
    setDraft("");
  };

  const handleCreateCommunity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommunityLoading(true);
    setCommunityError("");
    const result = await createCommunity(new FormData(event.currentTarget));
    if (result.error) {
      setCommunityError(result.error);
    } else if (result.community) {
      const community = result.community;
      setCommunityList((current) => [...current, { id: community.id, name: community.name, initials: community.name.slice(0, 2).toUpperCase(), accent: "#f28b50", topic: community.topic, members: 1, type: "owned" }]);
      setSelectedId(community.id);
      setShowCreateCommunity(false);
      event.currentTarget.reset();
    }
    setCommunityLoading(false);
  };

  const handleCreateSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSessionLoading(true);
    setSessionError("");
    const formData = new FormData(event.currentTarget);
    formData.set("startTime", lockedSlot.startTime || String(formData.get("startTime") ?? ""));
    formData.set("endTime", lockedSlot.endTime || String(formData.get("endTime") ?? ""));
    const result = await createSession(formData);
    if (result.error) {
      setSessionError(result.error);
    } else {
      setShowSchedule(false);
      setSessionSlotLocked(false);
      setLockedSlot({ startTime: "", endTime: "" });
      event.currentTarget.reset();
    }
    setSessionLoading(false);
  };

  const updateAttendance = (nextAttendance: Exclude<Attendance, null>) => {
    if (attendance === nextAttendance) {
      setAttendance(null);
      setAttendeeCount((count) => Math.max(0, count - (nextAttendance === "attending" ? 1 : 0)));
      return;
    }

    setAttendance(nextAttendance);
    if (nextAttendance === "attending") {
      setAttendeeCount((count) => count + 1);
    } else if (attendance === "attending") {
      setAttendeeCount((count) => Math.max(0, count - 1));
    }
  };

  return (
    <main className="min-h-screen bg-[#090e0b] text-white">
      <Navbar />

      {showCreateCommunity && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={handleCreateCommunity} className="w-full max-w-md rounded-2xl border border-[#2a3c31] bg-[#111914] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-bold">Create a community</h2><button type="button" onClick={() => setShowCreateCommunity(false)} title="Close"><X className="h-5 w-5 text-[#88948d]" /></button></div><div className="space-y-4"><input name="name" required placeholder="Community name" className="w-full rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-4 py-3 text-sm outline-none focus:border-[#f28b50]" /><textarea name="topic" required rows={3} placeholder="What is this community about?" className="w-full resize-none rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-4 py-3 text-sm outline-none focus:border-[#f28b50]" /></div>{communityError && <p className="mt-3 text-sm text-red-400">{communityError}</p>}<button disabled={communityLoading} className="mt-5 w-full rounded-lg bg-[#f28b50] py-3 text-sm font-bold text-black disabled:opacity-50">{communityLoading ? "Creating..." : "Create community"}</button></form></div>}

      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1440px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="border-b border-[#1a261f] bg-[#0a0f0c] p-5 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5e6a63]">Your network</p>
              <h1 className="mt-2 text-xl font-bold tracking-tight">Communities</h1>
            </div>
            <button type="button" title="Create a community" onClick={() => setShowCreateCommunity(true)} className="rounded-lg border border-[#2a3c31] p-2 text-[#88948d] transition-colors hover:border-[#f28b50] hover:text-[#f28b50]"><Plus className="h-4 w-4" /></button>
          </div>

          <div className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f28b50]">Your community</p>
              <span className="text-[10px] text-[#5e6a63]">1</span>
            </div>
            {communityList.filter((community) => community.type === "owned").map((community) => (
              <CommunityRow key={community.id} community={community} selected={selectedId === community.id} onSelect={selectCommunity} />
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#88948d]">Communities you&apos;re in</p>
              <span className="text-[10px] text-[#5e6a63]">2</span>
            </div>
            <div className="space-y-1">
              {communityList.filter((community) => community.type === "member").map((community) => (
                <CommunityRow key={community.id} community={community} selected={selectedId === community.id} onSelect={selectCommunity} />
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-[#1a261f] bg-[#111914] p-4">
            <div className="mb-3 flex items-center gap-2 text-[#f28b50]"><CircleHelp className="h-4 w-4" /><span className="text-xs font-semibold">Community roles</span></div>
            <p className="text-xs leading-relaxed text-[#88948d]">Teachers share lessons and sessions. Everyone can follow the conversation and respond to session invites.</p>
          </div>
        </aside>

        <section className="min-w-0 bg-[#090e0b]">
          <div className="border-b border-[#1a261f] px-5 py-6 sm:px-8">
            <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#f28b50]/40 bg-[#24170f] text-sm font-bold text-[#f28b50]">{selectedCommunity.initials}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">{selectedCommunity.name}</h2>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isTeacherCommunity ? "bg-[#f28b50]/10 text-[#f28b50]" : "bg-[#65d6c3]/10 text-[#65d6c3]"}`}>{isTeacherCommunity ? "Owner" : "Member"}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#88948d]">{selectedCommunity.topic} <span className="mx-1 text-[#36453a]">•</span> {selectedCommunity.members} members</p>
                </div>
              </div>
              <button type="button" title="More community options" className="rounded-lg p-2 text-[#88948d] hover:bg-[#111914] hover:text-white"><MoreHorizontal className="h-5 w-5" /></button>
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8">
            {activeMessages.map((message) => (
              <MessageCard key={message.id} message={message} isTeacherCommunity={isTeacherCommunity} attendance={attendance} attendeeCount={attendeeCount} onAttend={() => updateAttendance("attending")} onDecline={() => updateAttendance("not attending")} />
            ))}
            {isTeacherCommunity && (
              <form onSubmit={handleSend} className="sticky bottom-4 mt-10 flex items-end gap-3 rounded-xl border border-[#2a3c31] bg-[#111914] p-3 shadow-2xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f28b50] text-xs font-bold text-black">MC</div>
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={1} placeholder="Share a lesson update with your community..." className="min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-[#5e6a63]" />
                <button type="submit" title="Send lesson update" disabled={!draft.trim()} className="rounded-lg bg-[#f28b50] p-2.5 text-black transition-colors hover:bg-[#e0773b] disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
              </form>
            )}
            {!isTeacherCommunity && <div className="rounded-xl border border-dashed border-[#2a3c31] px-5 py-4 text-center text-xs text-[#5e6a63]">Only the teacher can post lessons in this community.</div>}
          </div>
        </section>

        <aside className="border-t border-[#1a261f] bg-[#0a0f0c] p-5 lg:border-l lg:border-t-0">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f28b50]">Community calendar</p>
              <h2 className="mt-2 text-lg font-bold">Upcoming session</h2>
            </div>
            <CalendarDays className="h-5 w-5 text-[#f28b50]" />
          </div>

          <div className="rounded-xl border border-[#2a3c31] bg-[#111914] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-md bg-[#f28b50]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f28b50]">{upcomingDate}</span>
              <span className="text-xs text-[#88948d]">{selectedCommunity.members} seats</span>
            </div>
            <h3 className="font-semibold">{isTeacherCommunity ? "Live shader critique" : "Navigation architecture office hours"}</h3>
            <div className="mt-3 space-y-2 text-xs text-[#88948d]">
              <div className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-[#f28b50]" /> {upcomingTime}</div>
              <div className="flex items-center gap-2"><Video className="h-3.5 w-3.5 text-[#f28b50]" /> Hosted on Cal.com</div>
            </div>
            {isTeacherCommunity ? (
              <button type="button" onClick={() => setShowSchedule((visible) => !visible)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f28b50] px-3 py-2.5 text-xs font-bold text-black hover:bg-[#e0773b]"><CalendarDays className="h-3.5 w-3.5" /> {showSchedule ? "Close scheduler" : "Schedule a session"}</button>
            ) : (
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-[#0a0f0c] px-3 py-2 text-xs text-[#a0ada6]"><Users className="h-3.5 w-3.5 text-[#65d6c3]" /><strong className="text-white">{attendeeCount}</strong> students attending</div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => updateAttendance("attending")} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${attendance === "attending" ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" : "border-[#2a3c31] text-[#88948d] hover:border-[#4ade80] hover:text-[#4ade80]"}`}><Check className="mr-1 inline h-3.5 w-3.5" /> Attending</button>
                  <button type="button" onClick={() => updateAttendance("not attending")} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${attendance === "not attending" ? "border-[#f28b50] bg-[#f28b50]/10 text-[#f28b50]" : "border-[#2a3c31] text-[#88948d] hover:border-[#f28b50] hover:text-[#f28b50]"}`}><X className="mr-1 inline h-3.5 w-3.5" /> Not attending</button>
                </div>
              </div>
            )}
            {showSchedule && isTeacherCommunity && <form onSubmit={handleCreateSession} className="mt-4 space-y-3 border-t border-[#2a3c31] pt-4"><input type="hidden" name="communityId" value={selectedCommunity.id} /><input type="hidden" name="communityName" value={selectedCommunity.name} /><input name="title" required placeholder="Session title" className="w-full rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-3 py-2.5 text-xs outline-none focus:border-[#f28b50]" /><textarea name="description" required rows={3} placeholder="What will students get from this session?" className="w-full resize-none rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-3 py-2.5 text-xs outline-none focus:border-[#f28b50]" /><div className="grid grid-cols-2 gap-2"><label className="text-[10px] text-[#88948d]">Starts<input name="startTime" type="datetime-local" required readOnly={sessionSlotLocked} className={`mt-1 w-full rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-2 py-2 text-xs text-white ${sessionSlotLocked ? "opacity-60" : ""}`} /></label><label className="text-[10px] text-[#88948d]">Ends<input name="endTime" type="datetime-local" required readOnly={sessionSlotLocked} className={`mt-1 w-full rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-2 py-2 text-xs text-white ${sessionSlotLocked ? "opacity-60" : ""}`} /></label></div><button type="button" onClick={(event) => { const form = event.currentTarget.form; const values = form ? new FormData(form) : null; const startTime = String(values?.get("startTime") ?? ""); const endTime = String(values?.get("endTime") ?? ""); if (!startTime || !endTime || new Date(endTime) <= new Date(startTime)) { setSessionError("Choose a valid start and end time first."); return; } setLockedSlot({ startTime, endTime }); setSessionSlotLocked(true); setSessionError(""); }} className={`w-full rounded-lg border px-3 py-2.5 text-xs font-bold ${sessionSlotLocked ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" : "border-[#2a3c31] text-[#a0ada6] hover:border-[#f28b50] hover:text-[#f28b50]"}`}>{sessionSlotLocked ? "Time locked" : "Done - lock date and time"}</button><input name="meetingUrl" type="url" placeholder="Meeting link (optional)" className="w-full rounded-lg border border-[#2a3c31] bg-[#0a0f0c] px-3 py-2.5 text-xs outline-none focus:border-[#f28b50]" />{sessionError && <p className="text-xs text-red-400">{sessionError}</p>}<button disabled={sessionLoading || !sessionSlotLocked} className="w-full rounded-lg bg-[#f28b50] py-2.5 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">{sessionLoading ? "Publishing..." : "Add to community calendar"}</button></form>}
          </div>

          <div className="mt-6 rounded-xl border border-[#1a261f] bg-[#111914] p-4">
            <div className="mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#65d6c3]" /><h3 className="text-sm font-semibold">About this community</h3></div>
            <p className="text-xs leading-relaxed text-[#88948d]">{isTeacherCommunity ? "A focused room for weekly shader lessons, experiments, and live critique." : "You can read every lesson and respond to sessions. Posting is reserved for the community teacher."}</p>
            <div className="mt-4 flex items-center justify-between border-t border-[#1a261f] pt-3 text-xs text-[#88948d]"><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {selectedCommunity.members} members</span><button type="button" title="View members" className="text-[#f28b50] hover:text-white"><ChevronRight className="h-4 w-4" /></button></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CommunityRow({ community, selected, onSelect }: { community: Community; selected: boolean; onSelect: (community: Community) => void }) {
  return (
    <button type="button" onClick={() => onSelect(community)} className={`group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors ${selected ? "bg-[#1a261f]" : "hover:bg-[#111914]"}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold" style={{ backgroundColor: `${community.accent}18`, color: community.accent }}>{community.initials}</span>
      <span className="min-w-0 flex-1"><span className={`block truncate text-sm font-semibold ${selected ? "text-white" : "text-[#a0ada6] group-hover:text-white"}`}>{community.name}</span><span className="block truncate text-[11px] text-[#5e6a63]">{community.members} members</span></span>
      {community.unread && <span className="rounded-full bg-[#f28b50] px-1.5 py-0.5 text-[10px] font-bold text-black">{community.unread}</span>}
    </button>
  );
}

function MessageCard({ message, isTeacherCommunity, attendance, attendeeCount, onAttend, onDecline }: { message: Message; isTeacherCommunity: boolean; attendance: Attendance; attendeeCount: number; onAttend: () => void; onDecline: () => void }) {
  return (
    <article className="flex gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${message.role === "teacher" ? "bg-[#f28b50] text-black" : "bg-[#1a261f] text-[#a0ada6]"}`}>{message.initials}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-2"><span className="text-sm font-semibold">{message.author}</span>{message.role === "teacher" && <span className="rounded bg-[#f28b50]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#f28b50]">Teacher</span>}<span className="text-[11px] text-[#5e6a63]">{message.time}</span></div>
        {message.kind === "session" ? (
          <div className="max-w-lg rounded-xl border border-[#f28b50]/25 bg-[#21170f] p-4">
            <div className="flex items-start gap-3"><div className="rounded-lg bg-[#f28b50]/10 p-2 text-[#f28b50]"><CalendarDays className="h-5 w-5" /></div><div><p className="font-semibold">{message.text}</p><p className="mt-1 text-xs text-[#a0ada6]">{isTeacherCommunity ? "Wed, Sep 23 · 6:00 PM - 7:00 PM" : "Fri, Sep 25 · 5:30 PM - 6:30 PM"}</p></div></div><div className="mt-4 flex items-center justify-between border-t border-[#f28b50]/15 pt-3"><span className="flex items-center gap-1.5 text-xs text-[#a0ada6]"><Users className="h-3.5 w-3.5 text-[#65d6c3]" /> {attendeeCount} attending</span>{isTeacherCommunity ? <a href={process.env.NEXT_PUBLIC_CAL_COM_URL || "https://cal.com"} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-[#f28b50] hover:text-white">Manage on Cal.com <ExternalLink className="h-3.5 w-3.5" /></a> : <div className="flex gap-2"><button type="button" onClick={onAttend} className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${attendance === "attending" ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" : "border-[#2a3c31] text-[#a0ada6] hover:border-[#4ade80] hover:text-[#4ade80]"}`}>Attending</button><button type="button" onClick={onDecline} className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${attendance === "not attending" ? "border-[#f28b50] bg-[#f28b50]/10 text-[#f28b50]" : "border-[#2a3c31] text-[#a0ada6] hover:border-[#f28b50] hover:text-[#f28b50]"}`}>Not attending</button></div>}</div>
          </div>
        ) : message.kind === "lesson" ? (
          <div className="max-w-lg rounded-xl border border-[#1e3b2a] bg-[#111914] p-4"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#65d6c3]"><MessageCircle className="h-3.5 w-3.5" /> Lesson update</div><p className="text-sm leading-relaxed text-[#d0d8d3]">{message.text}</p><button type="button" className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#f28b50] hover:text-white">Open lesson <ChevronRight className="h-3.5 w-3.5" /></button></div>
        ) : <p className="max-w-lg text-sm leading-relaxed text-[#a0ada6]">{message.text}</p>}
      </div>
    </article>
  );
}
