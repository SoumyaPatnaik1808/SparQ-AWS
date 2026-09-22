"use client";

import SessionCalendar from "../components/SessionCalendar";
import Navbar from "../components/Navbar";

export default function CalendarPage() {
  const studentEmail = "";

  return (
    <main className="min-h-screen bg-[#090e0b] text-white">
      <Navbar />
      <div className="px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <SessionCalendar studentEmail={studentEmail} />
      </div>
      </div>
    </main>
  );
}