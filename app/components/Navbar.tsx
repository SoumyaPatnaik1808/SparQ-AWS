"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "../actions/auth";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/arena", label: "Arena" },
  { href: "/community", label: "Community" },
  { href: "/calendar", label: "Calendar" },
];

export default function Navbar({ guest = false }: { guest?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileInitials, setProfileInitials] = useState("ME");

  useEffect(() => {
    getSession().then((session) => {
      const accountId = session.email?.split("@")[0] ?? "";
      const match = accountId.match(/^(student|teacher)-(\d+)$/i);
      if (match) {
        setProfileInitials(`${match[1][0].toUpperCase()}${match[2]}`);
      }
    });
  }, []);

  return (
    <header className="h-[72px] shrink-0 border-b border-[#1a261f] bg-[#0d1410] px-5 sm:px-8">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between">
        <div className="flex h-full items-center gap-7">
          <Link href="/" aria-label="SparQ home" className="relative block h-14 w-14 shrink-0">
            <Image src="/logo.png" alt="SparQ" fill sizes="56px" className="object-contain" priority />
          </Link>
          <nav className="hidden h-full items-center gap-7 text-sm font-medium md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "flex h-full items-center border-b-2 border-[#f28b50] text-white" : "text-[#88948d] transition-colors hover:text-white"}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {guest ? (
          <button type="button" onClick={() => router.push("/login")} className="rounded-lg bg-[#1a261f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233329]">Login</button>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f28b50]/50 bg-[#1a261f] text-xs font-bold text-[#f28b50]">{profileInitials}</div>
        )}
      </div>
    </header>
  );
}