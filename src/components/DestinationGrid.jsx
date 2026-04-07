import React from "react";
import DestinationCard from "./DestinationCard";

const DestinationGrid = ({
  destinations,
  loading,
  pagination,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Đang tải địa điểm...</p>
        </div>
      </div>
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Không tìm thấy địa điểm
        </h3>
        <p className="text-gray-500">
          Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Địa điểm du lịch</h2>
          <p className="text-gray-600">
            Hiển thị{" "}
            <span className="font-bold text-blue-600">
              {destinations.length}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-bold text-gray-900">
              {pagination?.totalElements || 0}
            </span>{" "}
            địa điểm
          </p>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <span className="text-gray-600">Hiển thị:</span>
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>9 địa điểm/trang</option>
            <option>12 địa điểm/trang</option>
            <option>24 địa điểm/trang</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {destinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-gray-600">
            Trang {pagination.page + 1} / {pagination.totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className={`px-4 py-2 rounded-lg flex items-center ${
                pagination.page === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Trước
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i;
                } else if (pagination.page < 3) {
                  pageNum = i;
                } else if (pagination.page > pagination.totalPages - 4) {
                  pageNum = pagination.totalPages - 5 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      pagination.page === pageNum
                        ? "bg-blue-500 text-white font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              {pagination.totalPages > 5 &&
                pagination.page < pagination.totalPages - 3 && (
                  <>
                    <span className="px-2">...</span>
                    <button
                      onClick={() => onPageChange(pagination.totalPages - 1)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
            </div>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.last}
              className={`px-4 py-2 rounded-lg flex items-center ${
                pagination.last
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sau
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationGrid;
