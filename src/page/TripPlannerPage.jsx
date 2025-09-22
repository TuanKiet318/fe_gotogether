import React, { useState } from "react";
import { Calendar, Plus, Users } from "lucide-react";

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="p-12 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Lên kế hoạch chuyến đi mới
          </h1>
        </div>

        <div className="space-y-8">
          {/* Destination Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đi đâu?
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="vd. Hà Nội, Đà Nẵng, Phú Quốc..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-lg"
            />
          </div>

          {/* Date Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ngày (tùy chọn)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  placeholder="Ngày bắt đầu"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  placeholder="Ngày kết thúc"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center px-6 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
              <Plus className="w-5 h-5 mr-2" />
              Mời bạn đồng hành
            </button>

            <button className="flex items-center justify-center px-6 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
              <Users className="w-5 h-5 mr-2" />
              Bạn bè
            </button>
          </div>

          {/* Main Action Button */}
          <div className="pt-8">
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg">
              Bắt đầu lên kế hoạch
            </button>
          </div>

          {/* Alternative Option */}
          <div className="text-center pt-4">
            <button className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"></button>
          </div>
        </div>
      </div>
    </div>
  );
}
