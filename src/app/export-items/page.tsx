'use client';

import { useState } from "react";
import { Equipment, EquipmentEffect } from "@/types/Player";

function parseInventoryHTML(html: string): Equipment[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const items: Equipment[] = [];

    const itemDivs = doc.querySelectorAll("div.relative.group");

    itemDivs.forEach(item => {
        const rareName = item.querySelector("div.text-\\[8px\\]")?.textContent?.trim();
        const emoji = item.querySelector("div.text-3xl")?.textContent?.trim() || "❓";

        if (!rareName) return;

        const tooltipDiv = item.querySelector("div[style*='transform: translateX']");

        let rarity = "Normal";
        let slot: string | undefined = undefined;
        const effects: EquipmentEffect[] = [];
        
        if (tooltipDiv) {
            const slotText = tooltipDiv.querySelector("div.text-\\[10px\\]")?.textContent?.trim() || "";
            const slotTextParts = slotText.split(' ');
            if (slotTextParts.length >= 2) {
                rarity = slotTextParts[0];
                slot = slotTextParts[1];
            }

            const statBonuses = tooltipDiv.querySelectorAll("div.text-blue-400, div.text-yellow-400"); // Accounts for magic and rare items
            statBonuses.forEach(line => {
                const bonus = line.querySelector("span.font-semibold");
                const stat = line.querySelector("span.opacity-80");

                if (bonus && stat) {
                    const value = parseInt(bonus.textContent?.trim() || "0", 10); // parseInt due to a +
                    const attribute = stat.textContent?.trim() || "Unknown";
                    
                    if (!isNaN(value) && attribute !== "Unknown") {
                        effects.push({
                            attribute: attribute,
                            type: "flat", // All bonuses are currently flat
                            value: value/100,
                        });
                    }
                }
            });
        }

        items.push({
            name: rareName,
            rareName,
            emoji,
            rarity,
            slot,
            effects,
        });
    });

    return items;
}

function generateEquipmentCSV(equipmentList: Equipment[]) {
    if (equipmentList.length === 0) {
        return "Name,Rarity,Slot,Emoji,Attribute,Value";
    }

    const headers = ["Name", "Rarity", "Slot", "Emoji", "Attribute", "Value"];
    let csvContent = headers.join(",") + "\n";

    equipmentList.forEach(item => {
        if (item.effects.length > 0) {
            item.effects.forEach(effect => {
                const row = [
                    `"${item.rareName || item.name}"`, // Wrap in quotes to handle commas in names
                    item.rarity,
                    item.slot || "",
                    item.emoji,
                    effect.attribute,
                    effect.value.toString(),
                ];
                csvContent += row.join(",") + "\n";
            });
        }
    });

    return csvContent;
}

export default function InventoryExporterPage() {
    const [entryText, setEntryText] = useState<string>('');
    const [parsedEquipment, setParsedEquipment] = useState<Equipment[]>([]);

    const handleParseAndDownload = () => {
        const parsedItems = parseInventoryHTML(entryText);
        setParsedEquipment(parsedItems);
        const csvContent = generateEquipmentCSV(parsedItems);
        downloadCSV(csvContent);
    };

    const downloadCSV = (content: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "inventory-data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="mt-16 p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Inventory Exporter 📝</h1>
            <p className="mb-4">
                Paste your inventory HTML below to parse your equipment and download it as a CSV file.
            </p>
            <div className="space-y-4">
                <div>
                    <textarea
                        className="w-full h-64 bg-theme-primary border border-theme-accent rounded p-2 text-sm"
                        onChange={(e) => setEntryText(e.target.value)}
                        value={entryText}
                        placeholder="Open inspect element on your browser, find the div that contains your inventory items, and paste the outerHTML here."
                    />
                </div>
                <button
                    onClick={handleParseAndDownload}
                    disabled={!entryText}
                    className="bg-theme-secondary hover:opacity-80 disabled:bg-gray-500 px-4 py-2 rounded"
                >
                    Parse & Download CSV
                </button>
            </div>

            {parsedEquipment.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2">Parsed Equipment Preview ({parsedEquipment.length})</h2>
                    <ul className="list-disc list-inside bg-theme-primary p-4 rounded-md h-40 overflow-auto">
                        {parsedEquipment.map((item, index) => (
                            <li key={index} className="mb-1 text-sm">
                                <span>{item.emoji} </span>
                                <strong>{item.rareName || item.name}</strong> ({item.rarity} {item.slot}): {item.effects.map(e => `+${e.value * 100} ${e.attribute}`).join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </main>
    );
}