import Link from "next/link";
import {
  Apple, Citrus, Carrot, Milk, Croissant, Cookie, CupSoda, Coffee,
  Egg, Wheat, Fish, Beef, CakeSlice, ShoppingBasket, Shirt, Tv, Sparkles,
  HeartPulse, CookingPot, Sofa, Car, Dumbbell, Gamepad2, BookOpen, Watch,
  Baby, PawPrint, Factory, Sprout, Hammer, Luggage, ShoppingBag,
} from "lucide-react";

// Returns a distinct icon + pastel tile for a category name.
// Specific food keywords are checked first so each category gets its own look.
function visualFor(category) {
  const c = category.toLowerCase();
  if (/fruit/.test(c)) return { Icon: Citrus, tile: "bg-orange-100 text-orange-700" };
  if (/vegetable/.test(c)) return { Icon: Carrot, tile: "bg-lime-100 text-lime-700" };
  if (/dairy/.test(c)) return { Icon: Milk, tile: "bg-sky-100 text-sky-700" };
  if (/baker/.test(c)) return { Icon: Croissant, tile: "bg-amber-100 text-amber-700" };
  if (/snack/.test(c)) return { Icon: Cookie, tile: "bg-violet-100 text-violet-700" };
  if (/beverage|drink/.test(c)) return { Icon: CupSoda, tile: "bg-cyan-100 text-cyan-700" };
  if (/coffee|tea/.test(c)) return { Icon: Coffee, tile: "bg-stone-100 text-stone-700" };
  if (/egg/.test(c)) return { Icon: Egg, tile: "bg-yellow-100 text-yellow-700" };
  if (/grain|flour|atta|wheat/.test(c)) return { Icon: Wheat, tile: "bg-amber-100 text-amber-800" };
  if (/fish|seafood/.test(c)) return { Icon: Fish, tile: "bg-blue-100 text-blue-700" };
  if (/meat|chicken|mutton/.test(c)) return { Icon: Beef, tile: "bg-red-100 text-red-700" };
  if (/cake|sweet|dessert/.test(c)) return { Icon: CakeSlice, tile: "bg-pink-100 text-pink-700" };
  if (/fresh/.test(c)) return { Icon: Apple, tile: "bg-green-100 text-green-700" };
  if (/grocery|food/.test(c)) return { Icon: ShoppingBasket, tile: "bg-emerald-100 text-emerald-700" };
  if (/cloth|fashion|apparel|wear/.test(c)) return { Icon: Shirt, tile: "bg-indigo-100 text-indigo-700" };
  if (/electro|appliance|gadget|mobile|computer/.test(c)) return { Icon: Tv, tile: "bg-slate-100 text-slate-700" };
  if (/beauty|cosmetic|personal care/.test(c)) return { Icon: Sparkles, tile: "bg-fuchsia-100 text-fuchsia-700" };
  if (/health|wellness|pharma|medical/.test(c)) return { Icon: HeartPulse, tile: "bg-teal-100 text-teal-700" };
  if (/home|kitchen|household/.test(c)) return { Icon: CookingPot, tile: "bg-orange-100 text-orange-700" };
  if (/furniture|d[eé]cor|decor/.test(c)) return { Icon: Sofa, tile: "bg-amber-100 text-amber-700" };
  if (/auto|car|vehicle/.test(c)) return { Icon: Car, tile: "bg-zinc-100 text-zinc-700" };
  if (/sport|fitness|gym/.test(c)) return { Icon: Dumbbell, tile: "bg-stone-100 text-stone-700" };
  if (/toy|game/.test(c)) return { Icon: Gamepad2, tile: "bg-purple-100 text-purple-700" };
  if (/book|stationery/.test(c)) return { Icon: BookOpen, tile: "bg-yellow-100 text-yellow-800" };
  if (/jewel|watch/.test(c)) return { Icon: Watch, tile: "bg-amber-100 text-amber-800" };
  if (/baby|kid/.test(c)) return { Icon: Baby, tile: "bg-pink-100 text-pink-700" };
  if (/pet|animal/.test(c)) return { Icon: PawPrint, tile: "bg-orange-100 text-orange-800" };
  if (/industrial|business/.test(c)) return { Icon: Factory, tile: "bg-slate-100 text-slate-600" };
  if (/agri|garden|plant/.test(c)) return { Icon: Sprout, tile: "bg-green-100 text-green-800" };
  if (/construct|hardware|tool/.test(c)) return { Icon: Hammer, tile: "bg-stone-100 text-stone-600" };
  if (/travel|luggage/.test(c)) return { Icon: Luggage, tile: "bg-sky-100 text-sky-800" };
  return { Icon: ShoppingBag, tile: "bg-neutral-100 text-neutral-700" };
}

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
      {categories.map((name) => {
        const { Icon, tile } = visualFor(name);
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
