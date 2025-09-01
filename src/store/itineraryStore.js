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

      addStop: (place, day = 1) => {
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
          day, // mặc định ngày 1
        };
        set({ stops: [...stops, newStop] });
      },

      updateStopDay: (stopId, newDay) => {
        const stops = get().stops.map(stop =>
          stop.id === stopId ? { ...stop, day: newDay } : stop
        );
        set({ stops });
      },

      removeStop: (stopId) => {
        const stops = get().stops.filter(stop => stop.id !== stopId);
        set({ stops });
      },

      reorderStops: (fromIndex, toIndex, day) => {
        const stops = [...get().stops];
        const dayStops = stops.filter(s => s.day === day);
        const [removed] = dayStops.splice(fromIndex, 1);
        dayStops.splice(toIndex, 0, removed);

        // giữ nguyên các stop của ngày khác
        const otherStops = stops.filter(s => s.day !== day);
        set({ stops: [...otherStops, ...dayStops] });
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
        const { stops, getTotalDays } = get();
        const totalDays = getTotalDays();
        if (totalDays === 0) return [];

        const dayGroups = [];
        for (let day = 1; day <= totalDays; day++) {
          const dayStops = stops.filter(s => s.day === day);
          dayGroups.push({
            day,
            stops: dayStops,
            totalHours: dayStops.reduce((sum, stop) => sum + stop.durationHours, 0),
          });
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

export default useItineraryStore;
