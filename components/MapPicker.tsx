import React, { useState, useEffect, useRef } from 'react';

// Declare Leaflet in the global scope to avoid TypeScript errors
declare const L: any;

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  initialCenter: { lat: number; lon: number };
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({ isOpen, onClose, onLocationSelect, initialCenter }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [selectedLocation, setSelectedLocation] = useState(initialCenter);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Effect to initialize the map instance once
  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialCenter.lat, initialCenter.lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markerRef.current = L.marker([initialCenter.lat, initialCenter.lon]).addTo(map);
      
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lon: lng });
        setSearchResults([]); // Clear search results on map click
      });
      
      mapRef.current = map;
    }
  }, [isOpen]);

  // Effect to handle modal opening: reset state and fix map rendering
  useEffect(() => {
    if (isOpen && mapRef.current) {
      setSelectedLocation(initialCenter);
      setSearchQuery('');
      setSearchResults([]);
      setTimeout(() => {
        mapRef.current.invalidateSize();
        mapRef.current.setView([initialCenter.lat, initialCenter.lon], 13);
      }, 100);
    }
  }, [isOpen, initialCenter]);

  // Effect to update the map view and marker when selectedLocation changes
  useEffect(() => {
    if (isOpen && mapRef.current && markerRef.current) {
      const newLatLng = [selectedLocation.lat, selectedLocation.lon];
      mapRef.current.setView(newLatLng, mapRef.current.getZoom());
      markerRef.current.setLatLng(newLatLng);
    }
  }, [selectedLocation, isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data: NominatimResult[] = await response.json();
        if (data && data.length > 0) {
            setSearchResults(data);
        } else {
            alert('Location not found.');
        }
    } catch (error) {
        console.error('Search failed:', error);
        alert('Failed to search for location.');
    } finally {
        setIsSearching(false);
    }
  };

  const handleSuggestionClick = (result: NominatimResult) => {
    setSelectedLocation({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
    setSearchResults([]);
  };
  
  const handleConfirm = async () => {
    try {
        // Reverse geocode to get a display name
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&zoom=18&addressdetails=1`);
        const data = await response.json();
        const locationName = data.display_name || `Lat: ${selectedLocation.lat.toFixed(4)}, Lon: ${selectedLocation.lon.toFixed(4)}`;
        
        onLocationSelect({
            ...selectedLocation,
            name: locationName
        });
        onClose();
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        // Fallback to coordinates if API fails
        onLocationSelect({
            ...selectedLocation,
            name: `Lat: ${selectedLocation.lat.toFixed(4)}, Lon: ${selectedLocation.lon.toFixed(4)}`
        });
        onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary w-full max-w-2xl h-[90vh] flex flex-col border border-light-border dark:border-dark-border">
        <header className="p-4 border-b border-light-border dark:border-dark-border flex-shrink-0 flex justify-between items-center">
          <h2 className="text-lg font-bold">Select Location</h2>
          <button onClick={onClose} className="text-2xl font-bold p-1 leading-none" aria-label="Close">&times;</button>
        </header>
        <div className="p-4 flex-shrink-0 relative">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="flex-1 p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary"
            />
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold transition-colors hover:bg-primary-dark disabled:bg-gray-400" disabled={isSearching}>
              {isSearching ? '...' : 'Search'}
            </button>
          </form>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border shadow-lg max-h-60 overflow-y-auto z-10">
              {searchResults.map(result => (
                <button 
                  key={result.place_id} 
                  onClick={() => handleSuggestionClick(result)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-primary-light dark:hover:bg-dark-bg"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div ref={mapContainerRef} className="flex-grow bg-gray-200" style={{ minHeight: 0 }}></div>
        <footer className="p-4 border-t border-light-border dark:border-dark-border flex justify-end gap-4 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-primary text-white font-semibold transition-colors hover:bg-primary-dark">Confirm Location</button>
        </footer>
      </div>
    </div>
  );
};