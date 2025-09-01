export default function ResultsSkeleton({ onClickSkeleton }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="card-elevated p-4 animate-pulse cursor-pointer"
          onClick={onClickSkeleton}
        >
          {/* Image skeleton */}
          <div className="h-48 bg-slate-200 rounded-xl mb-3"></div>

          {/* Content skeleton */}
          <div className="space-y-3">
            {/* Title */}
            <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>

            {/* Address */}
            <div className="h-4 bg-slate-200 rounded-lg w-full"></div>

            {/* Rating and price */}
            <div className="flex items-center gap-3">
              <div className="h-4 bg-slate-200 rounded-lg w-20"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-12"></div>
            </div>

            {/* Distance and status */}
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded-lg w-16"></div>
              <div className="h-6 bg-slate-200 rounded-full w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
