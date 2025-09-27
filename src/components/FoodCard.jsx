import React from "react";
import { Link } from "react-router-dom";

export default function FoodCard({ food }) {
  return (
    <Link to={`/foods/${food.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
        {food.imageUrl && (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-40 object-cover rounded-md mb-3"
          />
        )}
        <h3 className="text-lg font-semibold">{food.name}</h3>
        {food.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
            {food.description}
          </p>
        )}
      </div>
    </Link>
  );
}
