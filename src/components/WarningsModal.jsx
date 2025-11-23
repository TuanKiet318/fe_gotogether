import React, { useState } from "react";
import { AlertTriangle, X, Zap, MapPin, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WarningsModal({
    isOpen,
    onClose,
    warnings = [],
    onAutoFix,
    onMoveItem,
    onSuggestPlace,
    itinerary,
}) {
    const [selectedWarning, setSelectedWarning] = useState(null);

    if (!isOpen || !warnings || warnings.length === 0) return null;

    const groupedByDay = warnings.reduce((acc, w) => {
        const day = w.dayNumber || "unknown";
        if (!acc[day]) acc[day] = [];
        acc[day].push(w);
        return acc;
    }, {});

    const severityColors = {
        error: "bg-red-50 border-red-200 text-red-700",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
        info: "bg-blue-50 border-blue-200 text-blue-700",
    };

    const severityBgIcons = {
        error: "bg-red-100 text-red-600",
        warning: "bg-yellow-100 text-yellow-600",
        info: "bg-blue-100 text-blue-600",
    };

    const handleAutoFix = (warning) => {
        if (onAutoFix) onAutoFix(warning);
        setSelectedWarning(null);
    };

    const handleMove = (warning) => {
        if (onMoveItem) onMoveItem(warning);
        setSelectedWarning(null);
    };

    const handleSuggest = (warning) => {
        if (onSuggestPlace) onSuggestPlace(warning);
        setSelectedWarning(null);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9991] bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="border-b border-gray-200 p-6 flex justify-between items-center bg-gradient-to-r from-red-50 to-yellow-50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={28} className="text-red-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Cảnh báo lịch trình</h2>
                            <p className="text-sm text-gray-600 mt-1">Tổng: {warnings.length} cảnh báo</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {Object.entries(groupedByDay).map(([dayNum, dayWarnings]) => (
                        <div key={dayNum} className="border-b border-gray-100 last:border-0">
                            {/* Day Header */}
                            <div className="sticky top-0 bg-gray-50 px-6 py-3 border-b border-gray-200 z-10">
                                <h3 className="font-semibold text-gray-800">Ngày {dayNum}</h3>
                            </div>

                            {/* Warnings List */}
                            <div className="space-y-3 p-6">
                                {dayWarnings.map((warning, idx) => (
                                    <motion.div
                                        key={`${dayNum}-${idx}`}
                                        layout
                                        className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 cursor-pointer transition hover:shadow-md"
                                        onClick={() => setSelectedWarning(warning)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 flex-shrink-0">
                                                <AlertTriangle size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-yellow-900">{warning.type || "Cảnh báo"}</h4>
                                                <p className="text-sm mt-1 line-clamp-2 text-yellow-800">{warning.message}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                    Nhấn vào cảnh báo để xem chi tiết
                </div>
            </motion.div>
        </>
    );
}