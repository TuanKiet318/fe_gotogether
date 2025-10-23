import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, MoreVertical, User } from 'lucide-react';

const MyItinerariesPage = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [sortBy, setSortBy] = useState('Last Modified');

    const itineraries = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            startDate: '26 Nov 2025',
            endDate: '27 Nov 2025',
            title: '2 days to Quy Nhon',
            cities: 1,
            countries: 1
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop',
            startDate: '13 Nov 2025',
            endDate: '15 Nov 2025',
            title: '3-Day Hanoi Itinerary - A Balanced Cultural & Food Trip',
            cities: 1,
            countries: 1
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            startDate: '12 Nov 2025',
            endDate: '18 Nov 2025',
            title: '7 days to Quy Nhon',
            cities: 1,
            countries: 1
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop',
            startDate: '10 Nov 2025',
            endDate: '12 Nov 2025',
            title: '3 days to Da Nang',
            cities: 1,
            countries: 1
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            {/* Profile Section */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">Kiệt Bùi</h2>
                                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto">
                                    View profile
                                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <nav className="space-y-1">
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    <span className="text-lg">🎟️</span>
                                    <span>Promo Codes</span>
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 rounded-lg font-medium shadow-sm">
                                    <span className="text-lg">📋</span>
                                    <span>My Itineraries</span>
                                    <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">4</span>
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    <span className="text-lg">📅</span>
                                    <span>My Bookings</span>
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                    <span className="text-lg">❤️</span>
                                    <span>Wishlists</span>
                                </a>
                            </nav>

                            {/* Referral Card */}
                            <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-100">
                                <div className="flex gap-3 mb-3">
                                    <div className="text-3xl">🎁</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Invite Friend & Get Rewards</h3>
                                        <p className="text-sm text-gray-600">Get $5 off promo code for each successful referral.</p>
                                    </div>
                                </div>
                                <button className="w-full bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    See details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">My Itineraries</h1>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                                <span className="text-xl">+</span>
                                Plan a new trip
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-8 mb-6 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`pb-3 font-medium relative ${activeTab === 'upcoming'
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Upcoming
                                {activeTab === 'upcoming' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('ongoing')}
                                className={`pb-3 font-medium relative ${activeTab === 'ongoing'
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Ongoing
                                {activeTab === 'ongoing' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`pb-3 font-medium relative ${activeTab === 'past'
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Past
                                {activeTab === 'past' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for itinerary name"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <SlidersHorizontal className="w-5 h-5" />
                                Filters
                            </button>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none px-6 py-3 pr-10 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Last Modified</option>
                                    <option>Date Created</option>
                                    <option>Trip Date</option>
                                    <option>Name A-Z</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Itineraries Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            {itineraries.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="relative h-48">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white">
                                            <MoreVertical className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-sm text-gray-500 mb-2">
                                            {item.startDate} - {item.endDate}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>{item.cities} City</span>
                                            <span>{item.countries} Country</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-gray-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyItinerariesPage;