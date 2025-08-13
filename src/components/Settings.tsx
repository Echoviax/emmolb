'use client';
import { ThemeColors } from '@/types/ThemeColors';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type SettingsProviderProps = { 
    children: React.ReactNode;
}

export type Settings = {
    theme?: ThemeColors;
    homePage?: {
        useBlasesloaded: boolean;
        liveUpdate: boolean;
        showMiniplayer: boolean;
        showChangelog: boolean;
    }
    gamePage?: {
        showHandedness: boolean;
        useTeamColoredHeaders: boolean;
        showBaserunners: boolean;
        showStats: boolean;
        modifyEvents: boolean;
        showExpandedScoreboard: boolean;
        showAwayScoreboard: boolean;
    }
    teamPage?: {
        showLiveGames: boolean;
        showMMOLBLinks: boolean;
    }
    [key: string]: any;
};

type SettingsContextType = {
    settings: Settings;
    updateSetting: (key: string, value: any) => void;
    resetSettings?: () => void;
    resetTheme?: () => void;
    ready: boolean;
};

const defaultSettings: Settings = {
    theme: {
        primary: '#1e2a36',
        secondary: '#0f1a2b',
        score: '#14532D',
        accent: '#17212b',
        background: '#0c111b',
        text: '#ffffff',
        selected: '#155dfc',
        secondary_text: '#fef4e5',
        weather_event: '#0D47A1',
        ejection: '#7f1d1d',
    },
    homePage: {
        useBlasesloaded: false,
        liveUpdate: true,
        showMiniplayer: true,
        showChangelog: false,
    },
    gamePage: {
        showHandedness: true,
        useTeamColoredHeaders: false,
        showBaserunners: false,
        showStats: true,
        modifyEvents: true,
        showExpandedScoreboard: true,
        showAwayScoreboard: true,
    },
    teamPage: {
        showLiveGames: true,
        showMMOLBLinks: false,
    },
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    updateSetting: () => {},
    ready: false,
});

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [ready, setReady] = useState(false);
    const hasLoadedRef = useRef(false);

    const resetTheme = () => {
        setSettings((prev) => ({...prev, theme: defaultSettings.theme,}));
    };


    const resetSettings = () => {
        setSettings(() => {
            const newSettings = { ...defaultSettings };
            localStorage.setItem('appSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem('appSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Deep merge: saved settings override defaults, but defaults fill gaps
                const merged = {
                    ...defaultSettings,
                    ...parsed,
                    theme: {
                        ...defaultSettings.theme,
                        ...(parsed.theme || {}),
                    },
                    homePage: {
                        ...defaultSettings.homePage,
                        ...(parsed.homePage || {}),
                    },
                    gamePage: {
                        ...defaultSettings.gamePage,
                        ...(parsed.gamePage || {}),
                    },
                    teamPage: {
                        ...defaultSettings.teamPage,
                        ...(parsed.teamPage || {}),
                    },
                };
                setSettings(merged);
            }
        } catch (e) {
            console.error('Error loading settings', e);
        } finally {
            hasLoadedRef.current = true;
            setReady(true);
        }
    }, []);

    useEffect(() => {
        if (hasLoadedRef.current)
            localStorage.setItem('appSettings', JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key: string, value: any) => {
        setSettings((prev) => {
            const keys = key.split('.');
            const updated = { ...prev };
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!(keys[i] in obj)) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, resetTheme, ready  }}>
            {ready ? children : null}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
