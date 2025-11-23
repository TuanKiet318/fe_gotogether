// This wraps around existing LeafletMap to highlight warnings
import React from "react";
import { LeafletMap } from "./LeafletMap.jsx";

export default function LeafletMapEnhanced({
  places = [],
  warningsByDay = {},
  itinerary,
  ...props
}) {
  // Enhance places with warning info
  const enhancedPlaces = places.map((place) => {
    const dayWarnings = warningsByDay?.[String(place.dayNumber)] || [];
    const itemWarnings = dayWarnings.filter((w) => w.itemId === place.id);
    return {
      ...place,
      hasWarning: itemWarnings.length > 0,
      warningCount: itemWarnings.length,
      warnings: itemWarnings,
    };
  });

  return <LeafletMap places={enhancedPlaces} {...props} />;
}