import { Search } from 'lucide-react';

export default function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filters",
  icon = "🔍",
  action = null
}) {
  return (
    <div className="card-elevated p-12 text-center">
      <div className="text-6xl mb-6">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {title}
      </h3>

      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {action && (
        <div className="space-y-3">
          {action}
        </div>
      )}

      {/* <div className="mt-8 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">
          Suggestions:
        </h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Check your spelling</li>
          <li>• Try more general terms</li>
          <li>• Remove some filters</li>
          <li>• Search in a different area</li>
        </ul>
      </div> */}
    </div>
  );
}