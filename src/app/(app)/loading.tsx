// Shown the instant a screen is tapped, while its data loads.
// Also lets Next.js prefetch screens up to this point, so taps feel immediate.
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="skeleton h-9 w-44" />
      <div className="skeleton mt-6 h-28 w-full rounded-2xl" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-4">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton mt-3 h-5 w-3/4" />
            <div className="skeleton mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
