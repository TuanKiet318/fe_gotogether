import React from "react";

export default function CalendarMonth({
    monthDate,
    setMonthDate,
    days,
    selectedStartDate,
    selectedEndDate,
    isSameDay,
    isInRange,
    onSelect,
    next = false,
}) {
    const label = new Date(monthDate).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                {!next ? (
                    <button
                        onClick={() =>
                            setMonthDate(
                                new Date(monthDate.getFullYear(), monthDate.getMonth() - 1)
                            )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        ‹
                    </button>
                ) : (
                    <div className="w-9" />
                )}

                <h3 className="font-semibold text-lg">{label}</h3>

                {!next ? (
                    <div className="w-9" />
                ) : (
                    <button
                        onClick={() =>
                            setMonthDate(
                                new Date(monthDate.getFullYear(), monthDate.getMonth() + 1)
                            )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        ›
                    </button>
                )}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <div
                        key={d}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                    const isStart = isSameDay(day.date, selectedStartDate);
                    const isEnd = isSameDay(day.date, selectedEndDate);
                    const inRange = isInRange(day.date);

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = day.date < today;

                    return (
                        <button
                            key={idx}
                            onClick={() =>
                                day.isCurrentMonth && !isPast && onSelect(day.date)
                            }
                            disabled={!day.isCurrentMonth || isPast}
                            className={`
                aspect-square flex items-center justify-center rounded-lg text-sm transition-all duration-200
                ${!day.isCurrentMonth || isPast ? "text-gray-300 cursor-not-allowed" : ""}
                ${day.isCurrentMonth &&
                                    !isPast &&
                                    !isStart &&
                                    !isEnd &&
                                    !inRange
                                    ? "hover:bg-gray-100 text-gray-700"
                                    : ""
                                }
                ${isStart || isEnd ? "bg-blue-600 text-white font-semibold" : ""}
                ${inRange && !isStart && !isEnd ? "bg-blue-100 text-blue-700" : ""}
              `}
                        >
                            {day.date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}