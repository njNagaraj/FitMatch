import React, { useState, useEffect, useRef } from 'react';
import { useModal } from '../contexts/ModalContext';

// Declare Leaflet in the global scope to avoid TypeScript errors
declare const L: any;

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  initialCenter: { lat: number; lon: number };
}

interface NominatimResult {
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
  const [isSearching, setIsSearching] = useState(false);
  const { showAlert } = useModal();

  // Effect to initialize the map instance once when the modal opens
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
      });
      
      mapRef.current = map;
    }
  }, [isOpen, initialCenter]);

  // Effect to handle modal opening: reset state and fix map rendering
  useEffect(() => {
    if (isOpen && mapRef.current) {
      setSelectedLocation(initialCenter);
      setTimeout(() => {
        mapRef.current.invalidateSize();
        mapRef.current.setView([initialCenter.lat, initialCenter.lon], 13);
      }, 100); // Small delay to ensure modal is visible
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
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`);
        const data: NominatimResult[] = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setSelectedLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
        } else {
            showAlert({ title: 'Search Failed', message: 'Location not found. Please try a different search term.' });
        }
    } catch (error) {
        console.error('Search failed:', error);
        showAlert({ title: 'Error', message: 'An error occurred while searching for the location. Please check your connection and try again.' });
    } finally {
        setIsSearching(false);
    }
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
        <div className="p-4 flex-shrink-0">
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