import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import useItineraryStore from '../store/itineraryStore.js';
import { paceOptions } from '../data/destinations.js';

export default function ItineraryForm() {
  const {
    startDate,
    endDate,
    partySize,
    pace,
    stops,
    setDates,
    setPartySize,
    setPace,
    getTotalDays
  } = useItineraryStore();
  
  const [localStartDate, setLocalStartDate] = useState(
    startDate || new Date().toISOString().split('T')[0]
  );
  const [localEndDate, setLocalEndDate] = useState(
    endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  useEffect(() => {
    setDates(localStartDate, localEndDate);
  }, [localStartDate, localEndDate, setDates]);
  
  const handleStartDateChange = (date) => {
    setLocalStartDate(date);
    // Ensure end date is not before start date
    if (new Date(date) >= new Date(localEndDate)) {
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setLocalEndDate(newEndDate.toISOString().split('T')[0]);
    }
  };
  
  const handleEndDateChange = (date) => {
    setLocalEndDate(date);
  };
  
  const totalDays = getTotalDays();
  const hasStops = stops.length > 0;
  
  return (
    <div className="card-elevated p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Trip Planning</h2>
      </div>
      
      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={localStartDate}
            className="input-field"
          />
        </div>
      </div>
      
      {/* Party size */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Party Size
        </label>
        <select
          value={partySize}
          onChange={(e) => setPartySize(parseInt(e.target.value))}
          className="input-field"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
            <option key={size} value={size}>
              {size} {size === 1 ? 'person' : 'people'}
            </option>
          ))}
        </select>
      </div>
      
      {/* Pace */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Travel Pace
        </label>
        <div className="space-y-3">
          {paceOptions.map(option => (
            <label key={option.value} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="pace"
                value={option.value}
                checked={pace === option.value}
                onChange={(e) => setPace(e.target.value)}
                className="mt-1 w-4 h-4 border-slate-300 text-sky-600 focus:ring-sky-500/50"
              />
              <div>
                <div className="font-medium text-slate-900">{option.label}</div>
                <div className="text-sm text-slate-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Trip summary */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="font-medium text-slate-900 mb-3">Trip Summary</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">
              {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Travelers:</span>
            <span className="font-medium">{partySize}</span>
          </div>
          <div className="flex justify-between">
            <span>Pace:</span>
            <span className="font-medium">{pace}</span>
          </div>
          <div className="flex justify-between">
            <span>Places added:</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {stops.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Call to action */}
      {!hasStops && (
        <div className="pt-4 border-t border-slate-200">
          <div className="text-center p-4 bg-sky-50 rounded-xl">
            <MapPin className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <p className="text-sm text-sky-700 mb-2">
              Start building your itinerary by searching for places above
            </p>
            <p className="text-xs text-sky-600">
              Add places to see them organized by day
            </p>
          </div>
        </div>
      )}
    </div>
  );
}