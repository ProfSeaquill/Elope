"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { CITIES, cityById } from "../../../lib/cities";
import { DEFAULT_QUIZ, QuizAnswers, budgetToDollarSigns, validateAnchors } from "../../../lib/quiz";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | 5;

function Pill({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-full text-sm border",
        active ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-200"
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}

export default function TripQuizPage() {
  const [step, setStep] = useState<Step>(1);
  const [cityId, setCityId] = useState<string>(CITIES[0].id);
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [quiz, setQuiz] = useState<QuizAnswers>(DEFAULT_QUIZ);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const progress = useMemo(() => (step / 5) * 100, [step]);
  const city = cityById(cityId);

  function next() {
    setMsg(null);
    if (step === 5) return;

    if (step === 5) return;
    setStep((s) => (Math.min(5, s + 1) as Step));
  }

  function back() {
    setMsg(null);
    if (step === 1) return;
    setStep((s) => (Math.max(1, s - 1) as Step));
  }

  function validateBeforeSave(): string | null {
    if (!userId) return "Please sign in first.";
    if (!cityId) return "Pick a city.";
    if (!startDate || !endDate) return "Pick dates.";
    if (new Date(endDate) < new Date(startDate)) return "End date must be after start date.";
    const anchorsErr = validateAnchors(quiz.anchors);
    if (anchorsErr) return anchorsErr;
    if (!quiz.mustDo.trim()) return "Add your must-do.";
    return null;
  }

  async function saveTrip() {
    setMsg(null);
    const err = validateBeforeSave();
    if (err) {
      setMsg(err);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("trip_plans").insert({
        user_id: userId!,
        city_id: cityId,
        start_date: startDate,
        end_date: endDate,
        status: "completed",
        quiz
      });
      if (error) {
        setMsg(error.message);
        return;
      }
      setMsg(`Trip activated — browsing unlocked for ${city?.countryName ?? "your country"}.`);
    } finally {
      setSaving(false);
    }
  }

  if (!userId) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Create Trip</h1>
        <p className="text-neutral-300">Please sign in first.</p>
        <Link className="underline" href="/login">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Plan your stop</h1>
        <div className="text-sm text-neutral-400">Step {step} of 5</div>
        <div className="mt-2 h-2 bg-neutral-900 rounded-full overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-300">1) City</div>
            <select
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.countryName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm text-neutral-300">2) Start date</div>
              <input
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-neutral-300">End date</div>
              <input
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">3) Confidence level</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["booked_all", "Booked flights/lodging"],
                  ["booked_partial", "Flights booked, lodging TBD"],
                  ["dates_set", "Dates set, booking soon"],
                  ["exploring", "Exploring options"]
                ] as const
              ).map(([val, label]) => (
                <Pill
                  key={val}
                  active={quiz.confidence === val}
                  onClick={() => setQuiz((q) => ({ ...q, confidence: val }))}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-300">4) Trip purpose</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["work_explore", "Work + explore"],
                  ["vacation", "Vacation"],
                  ["visit_people", "Visiting people"],
                  ["relocating", "Scouting a move"],
                  ["event", "Event/festival"],
                  ["unsure", "Not sure yet"]
                ] as const
              ).map(([val, label]) => (
                <Pill key={val} active={quiz.purpose === val} onClick={() => setQuiz((q) => ({ ...q, purpose: val }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">5) Accommodation vibe</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["hostel", "Hostel"],
                  ["budget_hotel", "Budget hotel"],
                  ["boutique_hotel", "Boutique hotel"],
                  ["airbnb", "Airbnb / rental"],
                  ["co_living", "Co-living"],
                  ["with_people", "With friends/family"]
                ] as const
              ).map(([val, label]) => (
                <Pill
                  key={val}
                  active={quiz.accommodation === val}
                  onClick={() => setQuiz((q) => ({ ...q, accommodation: val }))}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">6) Where will you work?</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["coworking", "Coworking"],
                  ["cafes", "Cafés"],
                  ["mostly_home", "Mostly my place"],
                  ["not_working", "Not working"]
                ] as const
              ).map(([val, label]) => (
                <Pill key={val} active={quiz.workStyle === val} onClick={() => setQuiz((q) => ({ ...q, workStyle: val }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-300">7) Daily pace</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["packed", "Pack days tight"],
                  ["anchors_wander", "1–2 anchors + wander"],
                  ["slow_mornings", "Slow mornings, late nights"],
                  ["rest", "Here to rest"]
                ] as const
              ).map(([val, label]) => (
                <Pill key={val} active={quiz.pace === val} onClick={() => setQuiz((q) => ({ ...q, pace: val }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">8) Peak energy time</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["morning", "Morning"],
                  ["afternoon", "Afternoon"],
                  ["night", "Night owl"],
                  ["flex", "Flexible"]
                ] as const
              ).map(([val, label]) => (
                <Pill key={val} active={quiz.peakTime === val} onClick={() => setQuiz((q) => ({ ...q, peakTime: val }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">9) Spontaneity</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["planned", "Planned itinerary"],
                  ["loose", "Loose plan"],
                  ["spontaneous", "Totally spontaneous"]
                ] as const
              ).map(([val, label]) => (
                <Pill
                  key={val}
                  active={quiz.spontaneity === val}
                  onClick={() => setQuiz((q) => ({ ...q, spontaneity: val }))}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-300">10) Budget</div>
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4] as const).map((b) => (
                <Pill key={b} active={quiz.budget === b} onClick={() => setQuiz((q) => ({ ...q, budget: b }))}>
                  {budgetToDollarSigns(b)}
                </Pill>
              ))}
            </div>
            <div className="text-xs text-neutral-500">1 = very cheap, 4 = lavish</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">11) Transport comfort</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["walk_transit", "Walk/transit"],
                  ["mix_rideshare", "Mix + rideshare"],
                  ["bikes_scooters", "Bikes/scooters"],
                  ["rent_car", "Rent a car"]
                ] as const
              ).map(([val, label]) => (
                <Pill key={val} active={quiz.transport === val} onClick={() => setQuiz((q) => ({ ...q, transport: val }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">12) Social style</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["deep_1_2", "Meet 1–2 deeply"],
                  ["small_groups", "Small groups"],
                  ["big_social", "Big social"],
                  ["mostly_solo", "Mostly solo"]
                ] as const
              ).map(([val, label]) => (
                <Pill
                  key={val}
                  active={quiz.socialStyle === val}
                  onClick={() => setQuiz((q) => ({ ...q, socialStyle: val }))}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-300">13) Pick 3 anchors</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["food_markets", "Food markets"],
                  ["museums", "Museums"],
                  ["nature_daytrips", "Nature day trips"],
                  ["nightlife", "Nightlife"],
                  ["live_music", "Live music"],
                  ["architecture", "Architecture"],
                  ["beaches_water", "Beaches/water"],
                  ["shopping_design", "Shopping/design"],
                  ["sports_fitness", "Sports/fitness"],
                  ["history_tours", "History tours"]
                ] as const
              ).map(([val, label]) => {
                const active = quiz.anchors.includes(val);
                return (
                  <Pill
                    key={val}
                    active={active}
                    onClick={() => {
                      setQuiz((q) => {
                        const set = new Set(q.anchors);
                        if (set.has(val)) set.delete(val);
                        else set.add(val);
                        return { ...q, anchors: [...set] as QuizAnswers["anchors"] };
                      });
                    }}
                  >
                    {label}
                  </Pill>
                );
              })}
            </div>
            <div className="text-xs text-neutral-500">Must be exactly 3.</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">14) One “must do”</div>
            <input
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
              placeholder="e.g., Murano glass, cicchetti crawl, sunrise at San Marco..."
              value={quiz.mustDo}
              onChange={(e) => setQuiz((q) => ({ ...q, mustDo: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-neutral-300">15) Intention for this city</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["dating", "Dating"],
                  ["friends", "Friends"],
                  ["adventure", "Adventure buddy"],
                  ["open", "Open to whatever"]
                ] as const
              ).map(([val, label]) => (
                <Pill key={val} active={quiz.intention === val} onClick={() => setQuiz((q) => ({ ...q, intention: val }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={saving}
              onClick={saveTrip}
              className={[
                "w-full px-4 py-3 rounded-lg font-medium",
                saving ? "bg-neutral-800 text-neutral-400" : "bg-white text-black"
              ].join(" ")}
            >
              {saving ? "Saving..." : "Activate Trip"}
            </button>
          </div>

          {msg && <div className="text-sm text-neutral-300">{msg}</div>}

          <div className="text-sm text-neutral-400">
            After activating, go to <Link className="underline" href="/explore">Explore</Link>.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={back} className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800" type="button">
          Back
        </button>
        <button
          onClick={next}
          className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800"
          type="button"
          disabled={step === 5}
        >
          Next
        </button>
      </div>

      {city && (
        <div className="text-xs text-neutral-500">
          Your rule: you’ll only be able to browse cities in <span className="text-neutral-300">{city.countryName}</span>{" "}
          (and later, Passport countries).
        </div>
      )}
    </div>
  );
}

