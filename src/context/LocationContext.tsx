'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type LocationData = { lat: number; lng: number; address: string; mode: string; branchId: string | null };

const LocationContext = createContext<{ location: LocationData, setLocation: (l: LocationData) => void }>({ 
    location: { lat: 0, lng: 0, address: '', mode: 'Delivery', branchId: null }, 
    setLocation: () => {} 
});

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData>({ lat: 0, lng: 0, address: '', mode: 'Delivery', branchId: null });
    return <LocationContext.Provider value={{ location, setLocation }}>{children}</LocationContext.Provider>;
}

export function useLocation() { return useContext(LocationContext); }
