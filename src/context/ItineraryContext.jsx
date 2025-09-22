import React, { createContext, useContext, useState, useEffect } from "react";

const ItineraryContext = createContext();

export const ItineraryProvider = ({ children }) => {
  const [itinerary, setItinerary] = useState([]);

  // load từ localStorage để giữ lại sau refresh
  useEffect(() => {
    const saved = localStorage.getItem("itinerary");
    if (saved) setItinerary(JSON.parse(saved));
  }, []);

  // lưu lại mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("itinerary", JSON.stringify(itinerary));
  }, [itinerary]);

  const addPlace = (place) => {
    // tránh trùng ID
    if (!itinerary.find((p) => p.id === place.id)) {
      setItinerary([...itinerary, place]);
    }
  };

  const removePlace = (id) => {
    setItinerary(itinerary.filter((p) => p.id !== id));
  };

  return (
    <ItineraryContext.Provider value={{ itinerary, addPlace, removePlace }}>
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = () => useContext(ItineraryContext);
