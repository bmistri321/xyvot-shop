import Link from "next/link";
import {
  Apple, Shirt, Tv, Sparkles, HeartPulse, CookingPot, Sofa, Car,
  Dumbbell, Gamepad2, BookOpen, Watch, Baby, PawPrint, Factory,
  Sprout, Hammer, Luggage, ShoppingBag,
} from "lucide-react";

// Map a category name to a Lucide icon via keyword matching.
function iconFor(category) {
  const c = category.toLowerCase();
  if (/food|beverage|grocery|fruit|vegetable|fresh|snack|dairy|bakery/.test(c)) return Apple;
  if (/cloth|fashion|apparel|wear/.test(c)) return Shirt;
  if (/electro|appliance|gadget|mobile|computer/.test(c)) return Tv;
  if (/beauty|cosmetic|personal care/.test(c)) return Sparkles;
  if (/health|wellness|pharma|medical/.test(c)) return HeartPulse;
  if (/home|kitchen|household/.test(c)) return CookingPot;
  if (/furniture|d[eé]cor|decor/.test(c)) return Sofa;
  if (/auto|car|vehicle/.test(c)) return Car;
  if (/sport|fitness|gym/.test(c)) return Dumbbell;
  if (/toy|game/.test(c)) return Gamepad2;
  if (/book|stationery/.test(c)) return BookOpen;
  if (/jewel|watch/.test(c)) return Watch;
  if (/baby|kid/.test(c)) return Baby;
  if (/pet|animal/.test(c)) return PawPrint;
  if (/industrial|business/.test(c)) return Factory;
  if (/agri|garden|plant/.test(c)) return Sprout;
  if (/construct|hardware|tool/.test(c)) return Hammer;
  if (/travel|luggage/.test(c)) return Luggage;
  return ShoppingBag;
}

// Pastel tile backgrounds, cycled — fresh grocery feel.
const TILES = [
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-lime-100 text-lime-700",
  "bg-cyan-100 text-cyan-700",
];

// Horizontal scroll row of circular category icons — mobile grocery style.
export default function CategoryCircleRow({ categories }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4"
      style={{ scrollbarWidth: "none" }}
      role="list"
      aria-label="Shop by category"
    >
      {categories.map((name, i) => {
        const Icon = iconFor(name);
        const tile = TILES[i % TILES.length];
        return (
          <Link
            key={name}
            href={`/category/${encodeURIComponent(name)}`}
            role="listitem"
            className="flex flex-col items-center gap-1.5 shrink-0 w-16"
          >
            <span
              className={`w-14 h-14 rounded-full ${tile} flex items-center justify-center shadow-sm`}
              aria-hidden="true"
            >
              <Icon className="w-6 h-6" strokeWidth={2} />
            </span>
            <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight line-clamp-2">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
