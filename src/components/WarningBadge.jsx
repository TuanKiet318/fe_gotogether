import React from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";

export default function WarningBadge({ count = 0, severity = "warning", onClick, size = "md" }) {
  if (!count || count === 0) return null;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const severityClasses = {
    error: "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200",
  };

  const iconClass = severity === "error" ? "text-red-600" : "text-yellow-600";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium transition hover:shadow-md ${sizeClasses[size]} ${severityClasses[severity]}`}
      title={`${count} cảnh báo`}
    >
      <AlertTriangle size={size === "sm" ? 12 : size === "md" ? 14 : 16} className={iconClass} />
      <span>{count}</span>
    </button>
  );
}