"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Sparkles,
  Swords,
  Timer,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";

type ArenaStage = "preference" | "lobby" | "battle" | "evaluating" | "results";

interface RefereeResult {
  winner: "Player 1" | "Player 2" | "Tie";
  p1Score: number;
  p2Score: number;
  refereeFeedback: string;
  suggestedSyllabus: string[];
}

interface MultipleChoiceQuestion {
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const TOTAL_QUESTIONS = 5;

const spring = { type: "spring" as const, stiffness: 280, damping: 22 };

export default function ArenaPage() {
  const router = useRouter();
  const [stage, setStage] = useState<ArenaStage>("preference");
  const [skill, setSkill] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState<MultipleChoiceQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [lobbyCount, setLobbyCount] = useState(3);
  const [seconds, setSeconds] = useState(30);
  const [showBooking, setShowBooking] = useState(false);
  const [refereeResult, setRefereeResult] = useState<RefereeResult | null>(
    null,
  );
  const [refereeError, setRefereeError] = useState("");
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);

  const gameInProgress = stage === "battle" || stage === "evaluating";

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!gameInProgress) return;
      event.preventDefault();
      event.returnValue = "Are you sure to leave the game?";
    };
    const handleNavigation = (event: MouseEvent) => {
      if (!gameInProgress) return;
      const target = (event.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!target || target.target === "_blank" || target.href.startsWith("mailto:")) return;
      event.preventDefault();
      setShowLeavePrompt(true);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleNavigation, true);
    return () => { window.removeEventListener("beforeunload", handleBeforeUnload); document.removeEventListener("click", handleNavigation, true); };
  }, [gameInProgress]);

  const startBattle = async (event: FormEvent) => {
    event.preventDefault();
    if (!skill.trim()) return;
    setQuestionLoading(true);
    setRefereeError("");
    try {
      const response = await fetch("/api/arena/referee", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "question", topic: skill.trim() }) });
      const generated = await response.json() as MultipleChoiceQuestion & { error?: string };
      if (!response.ok || generated.error || !generated.topic || !generated.question || !generated.options?.length) throw new Error(generated.error || "The referee could not create a question.");
      setTopic(generated.topic);
      setQuestion(generated);
      setQuestionNumber(1);
      setScore(0);
      setLobbyCount(3);
      setStage("lobby");
    } catch (error) {
      setRefereeError(error instanceof Error ? error.message : "The referee could not create a question.");
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    if (stage !== "lobby") return;
    if (lobbyCount === 0) {
      const timeout = window.setTimeout(() => setStage("battle"), 0);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(
      () => setLobbyCount((value) => value - 1),
      900,
    );
    return () => window.clearTimeout(timeout);
  }, [stage, lobbyCount]);

  useEffect(() => {
    if (stage !== "battle") return;
    if (seconds === 0) {
      const timeout = window.setTimeout(() => setStage("evaluating"), 0);
      return () => window.clearTimeout(timeout);
    }
    const interval = window.setInterval(
      () => setSeconds((value) => value - 1),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [stage, seconds]);

  const selectAnswer = async (selectedIndex: number) => {
    if (!question) return;
    const nextScore = score + (selectedIndex === question.correctIndex ? 1 : 0);
    setScore(nextScore);
    if (questionNumber >= TOTAL_QUESTIONS) {
      setRefereeResult({ winner: nextScore >= Math.ceil(TOTAL_QUESTIONS / 2) ? "Player 1" : "Player 2", p1Score: nextScore * 2, p2Score: (TOTAL_QUESTIONS - nextScore) * 2, refereeFeedback: `You answered ${nextScore} of ${TOTAL_QUESTIONS} questions correctly.`, suggestedSyllabus: ["Review the concepts you missed", "Explain each answer from first principles", "Apply the concepts in a small project"] });
      setStage("results");
      return;
    }
    setQuestionLoading(true);
    setRefereeError("");
    try {
      const response = await fetch("/api/arena/referee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "question",
          topic: skill.trim(),
        }),
      });
      const nextQuestion = await response.json() as MultipleChoiceQuestion & { error?: string };
      if (!response.ok || nextQuestion.error || !nextQuestion.options?.length) throw new Error(nextQuestion.error || "The next question could not be loaded.");
      setQuestion(nextQuestion);
      setQuestionNumber((value) => value + 1);
      setSeconds(30);
    } catch (error) {
      setRefereeError(
        error instanceof Error
          ? error.message
          : "The referee could not evaluate this duel.",
      );
      setStage("battle");
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0f0e] text-white">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(6,44,34,0.42),transparent_38%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl flex-col px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f97316]">
              SparQ Arena
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
              Technical depth, under pressure.
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#2a2d2b] bg-[#151816]/80 px-3 py-2 text-xs text-[#a0ada6] sm:flex">
            <Swords className="h-4 w-4 text-[#f97316]" /> Duel 01
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === "preference" && <Preference key="preference" skill={skill} setSkill={setSkill} onSubmit={startBattle} loading={questionLoading} error={refereeError} />}
          {stage === "lobby" && <Lobby key="lobby" count={lobbyCount} topic={topic} />}
          {stage === "battle" && question && (
            <Battle
              key="battle"
              seconds={seconds}
              questionNumber={questionNumber}
              totalQuestions={TOTAL_QUESTIONS}
              onSelect={selectAnswer}
              loading={questionLoading}
              error={refereeError}
              question={question}
            />
          )}
          {stage === "evaluating" && <Evaluating key="evaluating" />}
          {stage === "results" && refereeResult && (
            <Results
              key="results"
              result={refereeResult}
              onBook={() => setShowBooking(true)}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{showLeavePrompt && <LeavePrompt onStay={() => setShowLeavePrompt(false)} onLeave={() => router.push("/feed")} />}</AnimatePresence>
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-2xl border border-[#2a2d2b] bg-[#151816] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f97316]">
                    Cal.com booking
                  </p>
                  <h2 className="mt-2 font-serif text-2xl">
                    Book your skill barter
                  </h2>
                </div>
                <button
                  type="button"
                  title="Close booking"
                  onClick={() => setShowBooking(false)}
                >
                  <X className="h-5 w-5 text-[#88948d]" />
                </button>
              </div>
              <div className="mt-6 rounded-xl border border-[#2a2d2b] bg-[#0d0f0e] p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#a0ada6]">Rust systems deep dive</span>
                  <span className="text-[#10b981]">60 min</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#f97316] bg-[#f97316]/10 px-3 py-3 text-sm text-[#fed7aa]"
                  >
                    Sep 24
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#2a2d2b] px-3 py-3 text-sm text-[#88948d]"
                  >
                    Sep 25
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#2a2d2b] px-3 py-3 text-sm text-[#88948d]"
                  >
                    Sep 26
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f97316] py-3 text-sm font-bold text-black hover:bg-[#fb923c]"
                >
                  Continue to Cal.com <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2a2d2b] bg-[#151816]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-9"
    >
      {children}
    </motion.section>
  );
}

function Player({
  initials,
  name,
  role,
  ghost = false,
}: {
  initials: string;
  name: string;
  role: string;
  ghost?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[#2a2d2b] bg-[#0d0f0e]/80 px-3 py-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${ghost ? "bg-[#062c22] text-[#10b981]" : "bg-[#f97316] text-black"}`}
      >
        {initials}
      </div>
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-[10px] uppercase tracking-wider text-[#6f7973]">
          {role}
        </p>
      </div>
    </div>
  );
}

function Preference({ skill, setSkill, onSubmit, loading, error }: { skill: string; setSkill: (value: string) => void; onSubmit: (event: FormEvent) => void; loading: boolean; error: string }) {
  const skills = ["Programming", "UI/UX Design", "3D Modeling", "Data Science", "Audio Engineering"];
  return <Panel><div className="mx-auto max-w-xl"><div className="mb-8 text-center"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f97316]/40 bg-[#f97316]/10"><Swords className="h-7 w-7 text-[#f97316]" /></div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f97316]">Before we spar</p><h2 className="mt-3 font-serif text-3xl">Choose your comfortable skill.</h2><p className="mt-3 text-sm leading-relaxed text-[#88948d]">The AI referee will create a focused technical question at the right depth for you.</p></div><form onSubmit={onSubmit}><div className="grid gap-3 sm:grid-cols-2">{skills.map((item) => <button key={item} type="button" onClick={() => setSkill(item)} className={`rounded-xl border p-4 text-left text-sm transition-colors ${skill === item ? "border-[#f97316] bg-[#f97316]/10 text-[#fed7aa]" : "border-[#2a2d2b] bg-[#0d0f0e] text-[#a0ada6] hover:border-[#f97316]/50"}`}>{item}</button>)}</div><input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Or enter another skill..." className="mt-4 w-full rounded-xl border border-[#2a2d2b] bg-[#0d0f0e] px-4 py-3 text-sm text-white outline-none focus:border-[#f97316]" />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!skill.trim() || loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f97316] py-3.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Building your duel..." : "Create my technical duel"} <ChevronRight className="h-4 w-4" /></motion.button></form></div></Panel>;
}

function LeavePrompt({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"><motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-[#2a2d2b] bg-[#151816] p-6 shadow-2xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f97316]/40 bg-[#f97316]/10"><AlertTriangle className="h-5 w-5 text-[#f97316]" /></div><h2 className="font-serif text-2xl">Are you sure to leave the game?</h2><p className="mt-2 text-sm leading-relaxed text-[#88948d]">Your current answer and duel progress will be lost.</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={onStay} className="rounded-lg border border-[#2a2d2b] px-4 py-3 text-sm font-semibold text-white hover:border-[#10b981]">Keep sparring</button><button type="button" onClick={onLeave} className="rounded-lg bg-[#f97316] px-4 py-3 text-sm font-bold text-black hover:bg-[#fb923c]">Leave game</button></div></motion.div></motion.div>;
}

function Lobby({ count, topic }: { count: number; topic: string }) {
  return (
    <Panel>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f97316]/40 bg-[#f97316]/10">
          <Swords className="h-7 w-7 text-[#f97316]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f97316]">
          Match lobby
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
          Technical Duel: {topic}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#88948d]">
          One minute. One concept. Show the depth behind your skill before the
          barter begins.
        </p>
        <div className="my-10 flex items-center justify-center gap-3 sm:gap-8">
          <Player initials="S1" name="You" role="challenger" />
          <span className="font-serif text-xl italic text-[#f97316]">vs</span>
          <Player
            initials="AI"
            name="Bedrock Ghost"
            role="referee opponent"
            ghost
          />
        </div>
        <motion.div
          key={count}
          initial={{ scale: 0.55, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="font-serif text-6xl text-[#f97316] sm:text-8xl"
        >
          {count > 0 ? count : "SPARQ!"}
        </motion.div>
      </div>
    </Panel>
  );
}

function Battle({
  seconds,
  questionNumber,
  totalQuestions,
  onSelect,
  loading,
  error,
  question,
}: {
  seconds: number;
  questionNumber: number;
  totalQuestions: number;
  onSelect: (selectedIndex: number) => void;
  loading: boolean;
  error: string;
  question: MultipleChoiceQuestion;
}) {
  const circumference = 2 * Math.PI * 44;
  const progress = circumference * (seconds / 30);
  const timerColor =
    seconds <= 8 ? "#ef4444" : seconds <= 16 ? "#f97316" : "#10b981";
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-[#2a2d2b] pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f97316]">
            Stage 02 · Speed battle
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Make the concept clear.
          </h2>
        </div>
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#27302b"
              strokeWidth="6"
            />
            <motion.circle
              animate={{
                strokeDashoffset: circumference - progress,
                stroke: timerColor,
              }}
              transition={{ duration: 0.5 }}
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            style={{ color: timerColor }}
          >
            {seconds}
          </span>
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-[#2a2d2b] bg-[#0d0f0e] p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10b981]">
          <Timer className="h-4 w-4" /> Referee prompt
        </div>
        <p className="font-serif text-xl leading-relaxed text-[#f1f5f2]">
          {question.question}
        </p>
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <motion.div className="mt-5 grid gap-3">
        {question.options.map((option, index) => (
          <button key={option} type="button" disabled={loading} onClick={() => onSelect(index)} className="flex items-center gap-3 rounded-xl border border-[#2a2d2b] bg-[#101311] p-4 text-left text-sm text-[#d7ded9] transition-colors hover:border-[#f97316] hover:bg-[#f97316]/10 disabled:cursor-wait disabled:opacity-60">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#10b981]/40 text-xs font-bold text-[#10b981]">{String.fromCharCode(65 + index)}</span>
            <span>{option}</span>
            <ChevronRight className="ml-auto h-4 w-4 text-[#6f7973]" />
          </button>
        ))}
      </motion.div>
      <p className="mt-4 text-center text-xs text-[#6f7973]">Question {questionNumber} of {totalQuestions} · Select an option to continue</p>
    </Panel>
  );
}

function Evaluating() {
  return (
    <Panel>
      <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#10b981]/40 bg-[#062c22] shadow-[0_0_40px_rgba(16,185,129,0.18)]"
        >
          <Sparkles className="h-8 w-8 text-[#10b981]" />
        </motion.div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#10b981]">
          Stage 03 · Bedrock referee
        </p>
        <h2 className="mt-4 font-serif text-3xl">
          Evaluating technical claims...
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#88948d]">
          Amazon Bedrock AI Referee is checking your reasoning, precision, and
          first-principles depth.
        </p>
        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: item * 0.18,
              }}
              className="h-2 w-2 rounded-full bg-[#10b981]"
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Results({ result, onBook }: { result: RefereeResult; onBook: () => void }) {
  const winnerLabel = result.winner === "Tie" ? "Tie" : `${result.winner} wins`;
  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10b981]">
            Referee report
          </p>
          <h2 className="mt-2 font-serif text-3xl">Referee verdict delivered.</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-3 py-2 text-xs font-bold text-[#6ee7b7]">
          <CheckCircle2 className="h-4 w-4" /> {winnerLabel}
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="rounded-xl border border-[#2a2d2b] bg-[#0d0f0e] p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6f7973]">
            Competence
          </p>
          <p className="mt-3 font-serif text-6xl text-[#f97316]">{result.p1Score}</p>
          <p className="text-xs text-[#10b981]">Player 1 / 10</p>
          <p className="mt-3 text-xs text-[#88948d]">Player 2: {result.p2Score} / 10</p>
        </div>
        <div className="rounded-xl border border-[#2a2d2b] bg-[#0d0f0e] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
            Technical feedback
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#c7d0ca]">
            {result.refereeFeedback}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-[#2a2d2b] bg-[#0d0f0e] p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
          Suggested 1-on-1 syllabus
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-[#c7d0ca]">
          {result.suggestedSyllabus.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#10b981]" />{item}</li>)}
        </ul>
      </div>
      <button
        type="button"
        onClick={onBook}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f97316] py-3.5 text-sm font-bold text-black hover:bg-[#fb923c]"
      >
        Schedule 1-on-1 on Cal.com <Clock3 className="h-4 w-4" />
      </button>
    </Panel>
  );
}
