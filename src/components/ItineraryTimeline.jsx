import { useState } from 'react';
import { Calendar, Clock, MapPin, X, GripVertical, Star, Phone } from 'lucide-react';
import useItineraryStore from '../store/itineraryStore.js';

export default function ItineraryTimeline() {
  const {
    stops,
    getStopsByDay,
    removeStop,
    updateStopDuration,
    clearItinerary,
    getTotalDays
  } = useItineraryStore();

  const [draggedStop, setDraggedStop] = useState(null);

  const dayGroups = getStopsByDay();
  const totalDays = getTotalDays();

  const handleDurationChange = (stopId, duration) => {
    updateStopDuration(stopId, parseFloat(duration));
  };

  const handleDragStart = (e, stop) => {
    setDraggedStop(stop);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedStop(null);
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours % 1 === 0) {
      return `${hours}h`;
    } else {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    }
  };

  if (stops.length === 0) {
    return (
      <div className="card-elevated p-8 text-center">
        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No itinerary yet</h3>
        <p className="text-slate-600 mb-4">
          Search for places and add them to your trip to see your timeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Itinerary</h2>
        </div>

        {stops.length > 0 && (
          <button
            onClick={clearItinerary}
            className="text-sm text-slate-600 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {dayGroups.map(dayGroup => (
          <div
            key={dayGroup.day}
            className="card-elevated p-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedStop) {
                updateStopDay(draggedStop.id, dayGroup.day);
                setDraggedStop(null);
              }
            }}
          >
            {/* Day header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Day {dayGroup.day}
              </h3>
              <div className="text-sm text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(dayGroup.totalHours)}
              </div>
            </div>

            {/* Stops */}
            <div className="space-y-3">
              {dayGroup.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, stop)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 cursor-move ${draggedStop?.id === stop.id ? 'opacity-50' : ''
                    }`}
                >
                  {/* Drag handle */}
                  <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="absolute right-2 top-2 p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="ml-6 mr-8">
                    {/* Stop info */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">{stop.name}</h4>
                        {stop.address && (
                          <p className="text-sm text-slate-600 flex items-start gap-1 mb-2">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {stop.address}
                          </p>
                        )}

                        {/* Rating */}
                        {stop.rating && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{stop.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Photo */}
                      {stop.photoUrl && (
                        <img
                          src={stop.photoUrl}
                          alt={stop.name}
                          className="w-16 h-16 object-cover rounded-lg ml-3"
                        />
                      )}
                    </div>

                    {/* Duration control */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-700">Duration:</label>
                      <select
                        value={stop.durationHours}
                        onChange={(e) => handleDurationChange(stop.id, e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300"
                      >
                        <option value={0.5}>30 min</option>
                        <option value={1}>1 hour</option>
                        <option value={1.5}>1.5 hours</option>
                        <option value={2}>2 hours</option>
                        <option value={2.5}>2.5 hours</option>
                        <option value={3}>3 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={6}>6 hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Connection line to next stop */}
                  {index < dayGroup.stops.length - 1 && (
                    <div className="absolute left-8 bottom-0 w-px h-3 bg-slate-300 translate-y-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Empty day state */}
            {dayGroup.stops.length === 0 && (
              <div className="text-center p-8 text-slate-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activities planned for this day</p>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}