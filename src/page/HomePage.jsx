import { useState, useEffect } from 'react';
import { ArrowRight, Compass, Map, Share2, Calendar } from 'lucide-react';
import Header from '../components/Header.jsx';
import SearchResults from '../components/SearchResults.jsx';
import ItineraryForm from '../components/ItineraryForm.jsx';
import ItineraryTimeline from '../components/ItineraryTimeline.jsx';
import MapView from '../components/MapView.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import useSearchStore from '../store/searchStore.js';
import useItineraryStore from '../store/itineraryStore.js';
import { popularDestinations } from '../data/destinations.js';

export default function HomePage() {
    const [activeSection, setActiveSection] = useState('search');
    const { hasSearched, query } = useSearchStore();
    const { stops } = useItineraryStore();

    useEffect(() => {
        // Auto-switch to appropriate section based on user actions
        if (stops.length > 0) {
            setActiveSection('itinerary');
        } else if (hasSearched) {
            setActiveSection('search');
        }
    }, [hasSearched, stops.length]);

    const handleStartPlanning = () => {
        document.getElementById('search-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const sections = [
        { id: 'search', label: 'Search', icon: Compass },
        { id: 'itinerary', label: 'Itinerary', icon: Calendar },
        { id: 'map', label: 'Map', icon: Map }
    ];

    const howItWorksSteps = [
        {
            icon: Compass,
            title: 'Search & Discover',
            description: 'Find amazing places, restaurants, and attractions for your destination'
        },
        {
            icon: Calendar,
            title: 'Plan Your Days',
            description: 'Organize your finds into a day-by-day itinerary with smart recommendations'
        },
        {
            icon: Map,
            title: 'View on Map',
            description: 'See your entire trip route and get directions between locations'
        },
        {
            icon: Share2,
            title: 'Share & Go',
            description: 'Export your itinerary and share it with travel companions'
        }
    ];

    return (
        <div className="min-h-screen background-pattern">
            <Header setActiveSection={setActiveSection} />
            {/* ...rest of your layout... */}
            {/* {activeSection === 'search' && (
                <SearchResults />
            )} */}
            {/* ...other sections... */}

            {/* Hero Section */}
            <section className="py-16 lg:py-24">
                <div className="container-custom">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Plan your trip{' '}
                            <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                                effortlessly
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Discover amazing places, create perfect itineraries, and visualize your journey
                            with our intelligent travel planning platform.
                        </p>

                        <button
                            onClick={handleStartPlanning}
                            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3 group"
                        >
                            Start planning
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="py-16 bg-white/40 backdrop-blur-sm">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Popular Destinations
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Get inspired by these amazing destinations and start planning your next adventure
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {popularDestinations.map(destination => (
                            <DestinationCard key={destination.id} destination={destination} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section id="search-section" className="py-16">
                <div className="container-custom">
                    {/* Section Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-slate-200">
                            {sections.map(section => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeSection === section.id
                                            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {section.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Search Results or Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            {activeSection === 'search' && (
                                <SearchResults />
                            )}

                            {activeSection === 'itinerary' && (
                                <div className="space-y-8">
                                    <ItineraryForm />
                                    <ItineraryTimeline />
                                </div>
                            )}

                            {activeSection === 'map' && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                            Your Trip Map
                                        </h2>
                                        <p className="text-slate-600">
                                        </p>
                                    </div>
                                    <MapView />
                                </div>
                            )}
                        </div>

                        {/* Right Column - Context-aware content */}
                        <div className="space-y-8">
                            {activeSection === 'search' && !hasSearched && (
                                <ItineraryForm />
                            )}

                            {activeSection === 'search' && hasSearched && (
                                <>
                                    <MapView />
                                    <ItineraryForm />
                                </>
                            )}

                            {activeSection === 'itinerary' && (
                                <MapView />
                            )}

                            {activeSection === 'map' && (
                                <>
                                    <ItineraryForm />
                                    {stops.length > 0 && <ItineraryTimeline />}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-slate-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Create the perfect itinerary in just a few simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorksSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="text-center group">
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-slate-700 border-2 border-sky-200">
                                            {index + 1}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        {step.title}
                                    </h3>

                                    <p className="text-slate-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-900">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Compass className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">GoTogether</span>
                        </div>

                        <div className="flex items-center gap-8 text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
                        <p>&copy; 2025 GoTogether. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}