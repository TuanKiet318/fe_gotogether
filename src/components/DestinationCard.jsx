import { Star, MapPin } from 'lucide-react';
import useSearchStore from '../store/searchStore.js';

export default function DestinationCard({ destination }) {
  const { setQuery, setCenterLocation, clearSearch } = useSearchStore();
  
  const handleDestinationClick = () => {
    clearSearch();
    setCenterLocation({ lat: destination.lat, lng: destination.lng });
    setQuery(`attractions in ${destination.name}`);
  };
  
  return (
    <button
      onClick={handleDestinationClick}
      className="group card-elevated p-0 overflow-hidden text-left w-full hover:scale-[1.02] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Rating overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-slate-900">{destination.rating}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-slate-900 group-hover:text-sky-900 transition-colors">
          {destination.name}
        </h3>
        
        <p className="text-sm text-slate-600 line-clamp-1">
          {destination.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Explore destination
          </span>
          
          <span className="text-sky-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Search →
          </span>
        </div>
      </div>
    </button>
  );
}