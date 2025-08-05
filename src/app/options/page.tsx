'use client'
import { CopiedPopup } from "@/components/CopiedPopup";
import { EventBlock } from "@/components/EventBlock";
import { Settings, useSettings } from "@/components/Settings";
import { ThemeColors } from "@/types/ThemeColors";
import Link from "next/link";
import { useEffect, useState } from "react";

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

type CheckboxProps = {
    settings: Settings;
    settingKey: string;
    label: string;
    onChange: (key: string, value: boolean) => void;
};

function Checkbox({ settings, settingKey, label, onChange }: CheckboxProps) {
    return (
        <label className="w-full flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm font-medium text-theme-secondary opacity-80 overflow-hidden text-ellipsis whitespace-nowrap pr-4">{label}</span>
            <div className="relative flex-shrink-0">
                <input type="checkbox" checked={getNestedValue(settings, settingKey)} onChange={(e) => onChange(settingKey, e.target.checked)} className="sr-only peer"/>
                <div className={`w-11 h-6 rounded-full transition-colors ${settings[settingKey] ? 'bg-theme-primary' : 'bg-theme-secondary'}`} />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
        </label>
    );
}


export default function OptionsPage() {
    const { settings, updateSetting, resetTheme, resetSettings } = useSettings();
    const [importData, setImportData] = useState("");

    useEffect(() => {
        if (!settings.theme) return;

        for (const [key, value] of Object.entries(settings.theme))
            document.documentElement.style.setProperty(`--theme-${key}`, value);
    }, [JSON.stringify(settings.theme)]); // Re-run on every change

  return (
    <>
    <CopiedPopup />
    <main className="mt-12">
        <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
            <div className="text-2xl font-bold text-center mb-6">Options</div>
            <div className="mt-6 mb-10">
                <h2 className="text-lg font-semibold mb-3">Home Page</h2>
                <div className="pl-2">
                    <div className="space-y-2 my-2">
                        <Checkbox settings={settings} settingKey={'homePage.liveUpdate'} label="Live Update" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'homePage.showMiniplayer'} label="Show Game Miniplayer" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'homePage.showChangelog'} label="Show Website Changelog" onChange={updateSetting} />
                    </div>
                    <Checkbox settings={settings} settingKey={'homePage.useBlasesloaded'} label="Use BlasesLoaded UI" onChange={updateSetting} />
                    <Link href='https://github.com/RangerRick/blobile' className="text-theme-secondary opacity-70 text-xs text-bottom hover:underline">Credit to Ranger Rick's Blobile GitHub for most the code</Link>
                </div>
            </div>
            <div className="mt-6 mb-10">
                <h2 className="text-lg font-semibold mb-3">Game Page</h2>
                <div className="pl-2">
                    <div className="space-y-2 mt-2">
                        <Checkbox settings={settings} settingKey={'gamePage.showHandedness'} label="Show Handedness" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'gamePage.showStats'} label="Show OPS/ERA for Current Players" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'gamePage.modifyEvents'} label="QOL Event Message Changes" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'gamePage.useTeamColoredHeaders'} label="Change Event Log Headers to Match Team Colors" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'gamePage.showBaserunners'} label="Display Who Is on Base" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'gamePage.showExpandedScoreboard'} label="Show Expanded Scoreboard" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'gamePage.showAwayScoreboard'} label="Show Away Scoreboard" onChange={updateSetting} />
                    </div>
                </div>
            </div>
            <div className="mt-6 mb-10">
                <h2 className="text-lg font-semibold mb-3">Team Page</h2>
                <div className="pl-2">
                    <div className="space-y-2 mt-2">
                        <Checkbox settings={settings} settingKey={'teamPage.showLiveGames'} label="Show Live Games" onChange={updateSetting} />
                        <Checkbox settings={settings} settingKey={'teamPage.showMMOLBLinks'} label="Show Links That Lead to MMOLB" onChange={updateSetting} />
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-4 mb-10">
                <h2 className="text-lg font-semibold mb-0">Customize Theme</h2>
                <p className="text-xs text-color-secondary opacity-70">Enjoy Your Eldritch Horrors...</p>
                {(['primary', 'secondary', 'accent', 'background', 'score', 'weather_event', 'ejection', 'text', 'secondary_text'] as (keyof ThemeColors)[]).map((key) => (                    
                    <div key={key} className="pl-2 flex items-center justify-between">
                        <label className="capitalize text-md text-theme-secondary opacity-80">{key.toString().replace('_', ' ')} color</label>
                        <input
                            type="color"
                            value={settings.theme?.[key] || '#ffffff'}
                            onChange={(e) => updateSetting(`theme.${key}`, e.target.value)}
                            className="w-10 h-6 p-0 border-0 bg-transparent"
                        />
                    </div>
                ))}
                <div className="pl-2 space-y-4">
                    <EventBlock emoji='🧩' title='Secondary Text/Color' links={false} messages={[{index: 1, message: "Primary Text/Color"}, {index: 0, message: "Accent is used for outlines on some things"}]} />
                    <button onClick={resetTheme} className="link-hover px-4 py-2 bg-theme-accent text-sm text-theme-secondary rounded mb-4">
                        Reset Theme
                    </button>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-0">Import/Export Settings</h2>
            <textarea placeholder="Paste exported settings here" value={importData} onChange={(e) => setImportData(e.target.value)} className="w-full h-32 p-2 bg-theme-background text-theme-text border border-theme-accent rounded"/>
            <div>
                <button
                onClick={() => {
                    try {
                        const parsed = JSON.parse(importData);
                        Object.entries(parsed).forEach(([key, value]) => updateSetting(key, value));
                        alert("Settings imported!");
                    } catch (e) {
                        alert("Invalid settings JSON.");
                    }
                }}className="px-4 py-2 link-hover bg-theme-accent text-theme-secondary rounded mr-4">
                Import Settings
                </button>
                <button onClick={() => {
                    const json = JSON.stringify(settings, null, 2);
                    navigator.clipboard.writeText(json);
                    (window as any).showCopiedPopup?.();
                }} className="px-4 py-2 link-hover bg-theme-accent text-theme-secondary rounded">
                    Export Settings
                </button>
            </div>
            <button onClick={resetSettings} className="link-hover px-4 py-2 bg-theme-accent text-xs text-theme-secondary rounded mb-4 mt-10">
                Reset Settings
            </button>
        </div>
    </main>
    </>
  );
};
