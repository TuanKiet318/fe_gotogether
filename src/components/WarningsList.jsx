import React from "react";
import { AlertTriangle } from "lucide-react";

export default function WarningsList({ list = [] }) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return (
    <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-md p-2 text-sm text-yellow-800">
      {list.slice(0, 3).map((w, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <AlertTriangle size={14} className="mt-1" />
          <div>
            <div className="font-medium">{w.type || "Cảnh báo"}</div>
            <div className="text-xs">{w.message}</div>
          </div>
        </div>
      ))}
      {list.length > 3 && <div className="mt-1 text-xs text-yellow-800">...{list.length - 3} cảnh báo nữa</div>}
    </div>
  );
}