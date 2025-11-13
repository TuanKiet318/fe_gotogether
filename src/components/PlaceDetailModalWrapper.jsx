import { X } from "lucide-react";
import { useEffect } from "react";
import PlaceDetailPage from "../page/PlaceDetailPage";

export default function PlaceDetailModalWrapper({ placeId, onClose }) {
  useEffect(() => {
    // Ngăn scroll body khi mở modal
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal: full height, 90% width, dính bên phải */}
      <div className="fixed top-0 right-0 h-full w-9/10 z-[9999] shadow-2xl bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết địa điểm</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <PlaceDetailPage placeId={placeId} isModal={true} />
        </div>
      </div>
    </>
  );
}
