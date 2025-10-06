import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

export default function DayColumn({ day }) {
  return (
    <Droppable droppableId={String(day.dayNumber)}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-white shadow rounded-2xl p-4 min-h-[250px]"
        >
          <h2 className="font-semibold mb-3">Ngày {day.dayNumber}</h2>

          {day.items.map((item, idx) => (
            <Draggable key={item.id} draggableId={item.id} index={idx}>
              {(prov) => (
                <div
                  ref={prov.innerRef}
                  {...prov.draggableProps}
                  {...prov.dragHandleProps}
                  className="border rounded-lg p-3 mb-3 bg-gray-50"
                >
                  <div className="font-medium">{item.placeName}</div>
                  <div className="text-sm text-gray-500">
                    {item.startTime} - {item.endTime}
                  </div>
                  <div className="text-sm text-gray-500 italic">
                    {item.transportMode}
                  </div>
                  <textarea
                    placeholder="Mô tả..."
                    className="mt-2 w-full text-sm border rounded p-1 resize-none"
                    rows={2}
                    value={item.description}
                    readOnly
                  />
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
