"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({ href, label }: { href: string; label: string }) {
  const p = usePathname();
  const active = p === href;
  return (
    <Link
      href={href}
      className={[
        "px-3 py-2 rounded-full text-sm",
        active ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-900"
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Nav() {
  return (
    <div className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur border-b border-neutral-900">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Elope
        </Link>
        <div className="flex gap-2">
          <Tab href="/explore" label="Explore" />
          <Tab href="/trips/new" label="Trips" />
          <Tab href="/login" label="Login" />
        </div>
      </div>
    </div>
  );
}

