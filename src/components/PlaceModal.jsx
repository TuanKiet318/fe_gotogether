import LocationMap from './LocationMap.jsx';

export default function PlaceModal({ place, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 rounded-xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 font-bold text-xl"
                >
                    &times;
                </button>
                <img src={place.image} alt={place.name} className="w-full h-64 object-cover" />
                <div className="p-6 space-y-4">
                    <h2 className="text-3xl font-bold">{place.name}</h2>
                    <p className="text-gray-700">{place.description}</p>
                    <div className="h-48 rounded-xl overflow-hidden shadow-md">
                        <LocationMap locations={[place]} />
                    </div>
                </div>
            </div>
        </div>
    );
}
