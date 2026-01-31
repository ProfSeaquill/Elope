"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { citiesInCountries, countriesFromCityIds, City } from "../../lib/cities";
import Link from "next/link";

type TripPlanRow = {
  id: string;
  city_id: string;
  status: "draft" | "completed";
  start_date: string;
  end_date: string;
};

export default function ExplorePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(data.user?.id ?? null);

      setLoading(true);
      const { data: rows } = await supabase
        .from("trip_plans")
        .select("id, city_id, status, start_date, end_date")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (!mounted) return;
      setTrips((rows as TripPlanRow[]) ?? []);
      setLoading(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(() => init());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const completedCityIds = useMemo(() => trips.map((t) => t.city_id), [trips]);
  const allowedCountries = useMemo(() => countriesFromCityIds(completedCityIds), [completedCityIds]);

  useEffect(() => {
    if (!selectedCountry && allowedCountries.length > 0) {
      setSelectedCountry(allowedCountries[0].countryCode);
    }
  }, [allowedCountries, selectedCountry]);

  const allowedCities: City[] = useMemo(() => {
    if (!selectedCountry) return [];
    return citiesInCountries([selectedCountry]);
  }, [selectedCountry]);

  if (!userId) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Explore</h1>
        <p className="text-neutral-300">Please sign in first.</p>
        <Link className="underline" href="/login">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-neutral-300">Loading...</div>;
  }

  if (allowedCountries.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Explore</h1>
        <p className="text-neutral-300">
          You haven’t activated a trip yet. Complete the trip quiz to unlock browsing in that country.
        </p>
        <Link className="px-4 py-2 rounded-lg bg-white text-black font-medium inline-block" href="/trips/new">
          Create Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Explore</h1>
        <div className="text-sm text-neutral-400">
          You can browse cities only in countries where you have an activated trip.
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-neutral-300">Unlocked countries</div>
        <div className="flex flex-wrap gap-2">
          {allowedCountries.map((c) => {
            const active = selectedCountry === c.countryCode;
            return (
              <button
                key={c.countryCode}
                className={[
                  "px-3 py-2 rounded-full text-sm border",
                  active ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-200"
                ].join(" ")}
                onClick={() => setSelectedCountry(c.countryCode)}
              >
                {c.countryName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-neutral-300">Cities you can browse (prototype)</div>
        <div className="grid grid-cols-1 gap-2">
          {allowedCities.map((c) => (
            <div key={c.id} className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/30">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-neutral-400">{c.countryName}</div>
              <div className="text-xs text-neutral-500 mt-1">Discovery feed coming next.</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Next module: Discovery + Invite targeting + Invitations inbox sorted by compatibility.
      </div>
    </div>
  );
}

