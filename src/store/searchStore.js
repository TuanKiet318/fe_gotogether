import { create } from 'zustand';

const useSearchStore = create((set, get) => ({
  // Search state
  query: '',
  results: [],
  isLoading: false,
  error: null,
  hasSearched: false,
  
  // Filters
  filters: {
    category: 'all',
    minRating: 0,
    priceLevel: 'all',
    openNow: false
  },
  
  // Sorting
  sortBy: 'relevance', // relevance, rating, distance
  
  // UI state
  hoveredResultId: null,
  selectedResult: null,
  showDetailDrawer: false,
  
  // Pagination
  currentPage: 1,
  resultsPerPage: 12,
  totalResults: 0,
  
  // Location context
  centerLocation: { lat: 10.762622, lng: 106.660172 }, // Default: Ho Chi Minh City
  
  // Actions
  setQuery: (query) => set({ query }),
  
  setResults: (results, totalResults = null) => set({ 
    results, 
    totalResults: totalResults ?? results.length,
    hasSearched: true 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ filters, currentPage: 1 });
  },
  
  setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),
  
  setHoveredResult: (hoveredResultId) => set({ hoveredResultId }),
  
  setSelectedResult: (selectedResult) => set({ selectedResult }),
  
  setShowDetailDrawer: (showDetailDrawer) => set({ showDetailDrawer }),
  
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  setCenterLocation: (centerLocation) => set({ centerLocation }),
  
  // Clear search
  clearSearch: () => set({
    query: '',
    results: [],
    error: null,
    hasSearched: false,
    currentPage: 1,
    totalResults: 0,
    hoveredResultId: null,
    selectedResult: null,
    showDetailDrawer: false
  }),
  
  // Reset filters
  resetFilters: () => set({
    filters: {
      category: 'all',
      minRating: 0,
      priceLevel: 'all',
      openNow: false
    },
    sortBy: 'relevance',
    currentPage: 1
  }),
  
  // Computed getters
  getFilteredResults: () => {
    const { results, filters, sortBy, centerLocation } = get();
    let filtered = [...results];
    
    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter(result => 
        result.category === filters.category ||
        (result.types && result.types.includes(filters.category))
      );
    }
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(result => 
        result.rating && result.rating >= filters.minRating
      );
    }
    
    if (filters.priceLevel !== 'all') {
      filtered = filtered.filter(result => 
        result.priceLevel === parseInt(filters.priceLevel)
      );
    }
    
    if (filters.openNow) {
      filtered = filtered.filter(result => result.openNow === true);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
        break;
      default: // relevance
        // Keep original order from search results
        break;
    }
    
    return filtered;
  },
  
  getPaginatedResults: () => {
    const { getFilteredResults, currentPage, resultsPerPage } = get();
    const filtered = getFilteredResults();
    const startIdx = (currentPage - 1) * resultsPerPage;
    const endIdx = startIdx + resultsPerPage;
    
    return {
      results: filtered.slice(startIdx, endIdx),
      totalPages: Math.ceil(filtered.length / resultsPerPage),
      totalFiltered: filtered.length
    };
  }
}));

export default useSearchStore;