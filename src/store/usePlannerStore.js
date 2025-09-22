// src/store/usePlannerStore.js
import { create } from "zustand";
import { nanoid } from "nanoid";

const today = new Date().toISOString().split("T")[0];

export const usePlannerStore = create((set) => ({
  itinerary: {
    id: nanoid(),
    name: "Chuyến đi mới",
    startDate: today,
    endDate: today,
    days: [
      {
        date: today,
        places: [],
      },
    ],
  },

  setName: (name) =>
    set((state) => ({
      itinerary: { ...state.itinerary, name },
    })),

  setDates: (startDate, endDate) =>
    set((state) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: new Date(d).toISOString().split("T")[0],
          places: [],
        });
      }

      return {
        itinerary: {
          ...state.itinerary,
          startDate,
          endDate,
          days,
        },
      };
    }),

  addPlaceToDay: (date, place) =>
    set((state) => ({
      itinerary: {
        ...state.itinerary,
        days: state.itinerary.days.map((day) =>
          day.date === date
            ? {
                ...day,
                places: [...day.places, place],
              }
            : day
        ),
      },
    })),

  removePlaceFromDay: (date, placeId) =>
    set((state) => ({
      itinerary: {
        ...state.itinerary,
        days: state.itinerary.days.map((day) =>
          day.date === date
            ? {
                ...day,
                places: day.places.filter((p) => p.id !== placeId),
              }
            : day
        ),
      },
    })),
}));
