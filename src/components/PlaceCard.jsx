import { Star, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaceCard({
  place,
  index,
  onHover,
  onClick,
  disableNavigation = false,
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Nếu có onClick custom, ưu tiên dùng nó
    if (onClick) {
      e.stopPropagation();
      onClick(place);
      return;
    }

    // Nếu không disable navigation thì mới navigate
    if (!disableNavigation) {
      navigate(`/destination/place/${place.id}`);
    }
  };

  return (
    <div
      onMouseEnter={() => onHover?.(place)}
      onMouseLeave={() => onHover?.(null)}
      onClick={handleClick}
      className="flex flex-col md:flex-row justify-between items-start p-5 border border-gray-100 rounded-2xl shadow hover:shadow-lg transition duration-300 bg-white cursor-pointer group h-full"
    >
      {/* Left content */}
      <div className="flex-1 md:pr-5 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="bg-blue-600 text-white text-sm font-bold rounded-full px-3 py-1">
            {index}
          </span>
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors break-words">
            {place.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-medium">{place.rating}</span>
          <span className="text-gray-400">({place.reviews}) · Google</span>
        </div>

        {/* Tag */}
        {place.tag && (
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mb-3">
            {place.tag}
          </span>
        )}

        {/* Description */}
        <p className="text-gray-700 text-sm mb-3 line-clamp-4 break-words">
          {place.description}
        </p>

        {/* Quote Review */}
        {place.review && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-600 relative">
            <Quote className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <p className="pl-6 line-clamp-3">{place.review}</p>
            <div className="flex justify-between mt-2 items-center">
              <span className="text-xs text-gray-500">{place.reviewer}</span>
              <button className="text-blue-500 text-xs hover:underline">
                Xem thêm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right image */}
      <div className="relative w-full md:w-40 h-40 md:h-28 flex-shrink-0 rounded-lg overflow-hidden mt-4 md:mt-0">
        <img
          src={place.mainImage}
          alt={place.name}
          className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </div>
  );
}
