import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useItineraryStore = create(
  persist(
    (set, get) => ({
      // Itinerary settings
      startDate: null,
      endDate: null,
      partySize: 2,
      pace: 'Normal', // Slow, Normal, Fast
      
      // Stops array
      stops: [],
      
      // Actions
      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setPartySize: (size) => set({ partySize: size }),
      setPace: (pace) => set({ pace }),
      
      addStop: (place) => {
        const stops = get().stops;
        const newStop = {
          id: Date.now().toString(),
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          durationHours: getDurationByCategory(place.category),
          placeId: place.placeId,
          category: place.category,
          rating: place.rating,
          photoUrl: place.photoUrl,
          addedAt: new Date().toISOString(),
        };
        set({ stops: [...stops, newStop] });
      },
      
      removeStop: (stopId) => {
        const stops = get().stops.filter(stop => stop.id !== stopId);
        set({ stops });
      },
      
      reorderStops: (fromIndex, toIndex) => {
        const stops = [...get().stops];
        const [removed] = stops.splice(fromIndex, 1);
        stops.splice(toIndex, 0, removed);
        set({ stops });
      },
      
      updateStopDuration: (stopId, durationHours) => {
        const stops = get().stops.map(stop =>
          stop.id === stopId ? { ...stop, durationHours } : stop
        );
        set({ stops });
      },
      
      clearItinerary: () => set({
        startDate: null,
        endDate: null,
        partySize: 2,
        pace: 'Normal',
        stops: []
      }),
      
      // Computed values
      getTotalDays: () => {
        const { startDate, endDate } = get();
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      },
      
      getStopsByDay: () => {
        const { stops, getTotalDays, pace } = get();
        const totalDays = getTotalDays();
        if (totalDays === 0) return [];
        
        const stopsPerDay = getStopsPerDay(pace, stops.length, totalDays);
        const dayGroups = [];
        
        for (let day = 0; day < totalDays; day++) {
          const startIdx = day * stopsPerDay;
          const endIdx = Math.min(startIdx + stopsPerDay, stops.length);
          const dayStops = stops.slice(startIdx, endIdx);
          
          if (dayStops.length > 0 || day === 0) {
            dayGroups.push({
              day: day + 1,
              stops: dayStops,
              totalHours: dayStops.reduce((sum, stop) => sum + stop.durationHours, 0)
            });
          }
        }
        
        return dayGroups;
      }
    }),
    {
      name: 'travel-itinerary',
      version: 1,
    }
  )
);

// Helper functions
function getDurationByCategory(category) {
  const durations = {
    restaurant: 1.5,
    cafe: 0.5,
    museum: 2.0,
    park: 1.0,
    tourist_attraction: 1.5,
    shopping_mall: 1.5,
    church: 0.5,
    default: 1.0
  };
  
  return durations[category] || durations.default;
}

function getStopsPerDay(pace, totalStops, totalDays) {
  const paceMultipliers = {
    Slow: 0.7,
    Normal: 1.0,
    Fast: 1.4
  };
  
  const baseStopsPerDay = Math.ceil(totalStops / totalDays);
  return Math.max(1, Math.round(baseStopsPerDay * paceMultipliers[pace]));
}

export default useItineraryStore;