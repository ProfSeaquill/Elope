import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Elope Prototype</h1>
      <p className="text-neutral-300">
        Start by logging in, then complete a trip quiz to unlock browsing in that country.
      </p>
      <div className="flex gap-3">
        <Link className="px-4 py-2 rounded-lg bg-white text-black font-medium" href="/login">
          Login
        </Link>
        <Link className="px-4 py-2 rounded-lg bg-neutral-800 text-white" href="/trips/new">
          Create Trip
        </Link>
      </div>
      <div className="text-sm text-neutral-400">
        Terminology: You <span className="text-neutral-200">Invite</span> → mutual becomes{" "}
        <span className="text-neutral-200">BOOKED!</span> → stored in{" "}
        <span className="text-neutral-200">Bookings</span> (coming next).
      </div>
    </div>
  );
}

