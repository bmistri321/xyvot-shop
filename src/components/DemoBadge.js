// DEMO DATA — remove before production.
// Floating badge so reviewers know the catalog is placeholder data.
export default function DemoBadge() {
  return (
    <div
      className="sm:hidden fixed bottom-20 right-4 z-40 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wide shadow-lg"
      aria-label="Demo data"
    >
      Demo
    </div>
  );
}
