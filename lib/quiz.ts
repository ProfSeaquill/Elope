export type BudgetTier = 1 | 2 | 3 | 4;

export type QuizAnswers = {
  // Screen 1
  confidence: "booked_all" | "booked_partial" | "dates_set" | "exploring";

  // Screen 2
  purpose: "work_explore" | "vacation" | "visit_people" | "relocating" | "event" | "unsure";
  accommodation: "hostel" | "budget_hotel" | "boutique_hotel" | "airbnb" | "co_living" | "with_people";
  workStyle: "coworking" | "cafes" | "mostly_home" | "not_working";

  // Screen 3
  pace: "packed" | "anchors_wander" | "slow_mornings" | "rest";
  peakTime: "morning" | "afternoon" | "night" | "flex";
  spontaneity: "planned" | "loose" | "spontaneous";

  // Screen 4
  budget: BudgetTier; // $..$$$$
  transport: "walk_transit" | "mix_rideshare" | "bikes_scooters" | "rent_car";
  socialStyle: "deep_1_2" | "small_groups" | "big_social" | "mostly_solo";

  // Screen 5
  anchors: Array<
    | "food_markets"
    | "museums"
    | "nature_daytrips"
    | "nightlife"
    | "live_music"
    | "architecture"
    | "beaches_water"
    | "shopping_design"
    | "sports_fitness"
    | "history_tours"
  >; // choose 3
  mustDo: string;
  intention: "dating" | "friends" | "adventure" | "open";
};

export const DEFAULT_QUIZ: QuizAnswers = {
  confidence: "dates_set",
  purpose: "work_explore",
  accommodation: "airbnb",
  workStyle: "coworking",
  pace: "anchors_wander",
  peakTime: "flex",
  spontaneity: "loose",
  budget: 2,
  transport: "walk_transit",
  socialStyle: "small_groups",
  anchors: ["food_markets", "architecture", "museums"],
  mustDo: "",
  intention: "open"
};

export function budgetToDollarSigns(b: BudgetTier): string {
  return "$".repeat(b);
}

export function validateAnchors(anchors: QuizAnswers["anchors"]): string | null {
  if (!Array.isArray(anchors)) return "Pick 3 anchors.";
  if (anchors.length !== 3) return "Pick exactly 3 anchors.";
  const set = new Set(anchors);
  if (set.size !== anchors.length) return "No duplicates — pick 3 different anchors.";
  return null;
}

