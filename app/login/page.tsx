"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function refreshSession() {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    refreshSession();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshSession());
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signUp() {
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password: pw });
    if (error) setMsg(error.message);
    else setMsg("Signed up. You can now sign in.");
  }

  async function signIn() {
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setMsg(error.message);
    else setMsg("Signed in.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMsg("Signed out.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>

      {userEmail ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/30">
            Signed in as <span className="text-neutral-200">{userEmail}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={signOut} className="px-4 py-2 rounded-lg bg-neutral-800">
              Sign out
            </button>
            <Link href="/trips/new" className="px-4 py-2 rounded-lg bg-white text-black font-medium">
              Create Trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
            placeholder="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={signIn} className="px-4 py-2 rounded-lg bg-white text-black font-medium">
              Sign in
            </button>
            <button onClick={signUp} className="px-4 py-2 rounded-lg bg-neutral-800">
              Sign up
            </button>
          </div>
        </div>
      )}

      {msg && <div className="text-sm text-neutral-300">{msg}</div>}

      <div className="text-sm text-neutral-400">
        After signing in, go to <Link className="underline" href="/trips/new">Trips</Link> to unlock browsing.
      </div>
    </div>
  );
}

