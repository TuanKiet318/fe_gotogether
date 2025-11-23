import React from "react";
import { MapPin, Share2, LogOut } from "lucide-react";
import ShareModal from "./ShareModal.jsx";

export default function ItineraryHeader({
    itinerary,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    titleInputRef,
    handleTitleEdit,
    handleTitleSave,
    handleTitleKeyDown,
    showShareModal,
    setShowShareModal,
    inviteEmail,
    setInviteEmail,
    sharedUsers,
    linkPermission,
    setLinkPermission,
    navigate,
    grandTotal,
    formatVND,
    handleDateClick,
}) {
    return (
        <header className="bg-white shadow-md border-b border-gray-200 px-6 py-3 flex-shrink-0">
            {showShareModal && itinerary?.canEdit && (
                <ShareModal
                    onClose={() => setShowShareModal(false)}
                    inviteEmail={inviteEmail}
                    setInviteEmail={setInviteEmail}
                    sharedUsers={sharedUsers}
                    linkPermission={linkPermission}
                    setLinkPermission={setLinkPermission}
                    copyPlannerLink={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Đã copy link!");
                    }}
                    itineraryId={itinerary.id}
                />
            )}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div>
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleTitleKeyDown}
                                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-b-2 border-blue-500 outline-none px-1"
                                style={{
                                    width: `${Math.max(editedTitle.length * 16, 200)}px`,
                                    caretColor: "#2563eb",
                                }}
                            />
                        ) : (
                            <h1
                                onClick={handleTitleEdit}
                                className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${itinerary?.canEdit
                                        ? "cursor-pointer hover:opacity-70"
                                        : "cursor-default opacity-90"
                                    } transition relative group`}
                                title={itinerary?.canEdit ? "Click để sửa tên" : "Chỉ xem"}
                            >
                                {itinerary.title}
                                {!itinerary?.canEdit && (
                                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                        VIEW ONLY
                                    </span>
                                )}
                                {itinerary?.canEdit && (
                                    <span className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-gray-400 text-sm">
                                        ✏️
                                    </span>
                                )}
                            </h1>
                        )}

                        <p className="text-sm flex items-center gap-2 mt-1 flex-wrap">
                            <MapPin size={16} className="text-blue-500" />
                            <span className="font-semibold text-blue-600">
                                {itinerary.destination}
                            </span>
                            <span className="text-gray-300 mx-1">•</span>
                            <button
                                onClick={handleDateClick}
                                className={`text-gray-600 font-medium underline decoration-dotted transition ${itinerary?.canEdit
                                        ? "hover:text-blue-600 cursor-pointer"
                                        : "text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {itinerary.startDate} <span className="text-purple-500">→</span>{" "}
                                {itinerary.endDate}
                            </button>
                            <span className="text-gray-300 mx-1">•</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                💰 Tổng: <b className="ml-1">{formatVND(grandTotal)}</b>
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {itinerary?.canEdit && (
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                        >
                            <Share2 size={16} />
                            <span>Chia sẻ</span>
                        </button>
                    )}

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                    >
                        <LogOut size={16} />
                        <span>Thoát</span>
                    </button>
                </div>
            </div>
        </header>
    );
}