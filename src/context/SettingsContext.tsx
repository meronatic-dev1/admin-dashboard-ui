'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Settings = { logoUrl?: string; bannerUrl?: string; serviceCharge?: number; enableServiceCharge?: boolean; enableServiceChargeTakeaway?: boolean; };

const SettingsContext = createContext<{ settings: Settings, setSettings: (s: Settings) => void }>({ settings: {}, setSettings: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>({});
    return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings() { return useContext(SettingsContext); }
