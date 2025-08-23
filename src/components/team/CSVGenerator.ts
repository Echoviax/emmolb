import { Player, EquipmentEffect } from "@/types/Player";
import { pitchingAttrs, battingAttrs, defenseAttrs, runningAttrs, trunc } from "./Constants";
import { lesserBoonTable } from "./BoonDictionary";

type getPlayerStatRowsProps = {
    statsPlayer: Player;
};

export type PlayerAttributesTableEntry = {
    PlayerName: string;
    Category: string;
    Stat: string;
    Stars: string | number;
    StarBucketLower: string | number;
    StarBucketUpper: string | number;
    ItemTotal: number;
    TotalBucketLower: string | number;
    TotalBucketUpper: string | number;
    NominalTotal: string | number;
}

const categories = {
    Pitching: pitchingAttrs,
    Batting: battingAttrs,
    Defense: defenseAttrs,
    Baserunning: runningAttrs
};

export function getPlayerStatRows({ statsPlayer, }: getPlayerStatRowsProps): PlayerAttributesTableEntry[] {
    const name = `${statsPlayer.first_name} ${statsPlayer.last_name}`;
    const talk = statsPlayer?.talk;
    const boon = statsPlayer?.lesser_boon?.name;

    const itemTotals: Map<string, number> = new Map();
    const items = [
        statsPlayer.equipment.head,
        statsPlayer.equipment.body,
        statsPlayer.equipment.hands,
        statsPlayer.equipment.feet,
        statsPlayer.equipment.accessory,
    ];

    items.forEach((item) => {
        if (!item || item.rarity === 'Normal') return;
        item.effects.forEach((effect: EquipmentEffect) => {
            const amt = Math.round(effect.value * 100);
            itemTotals.set(effect.attribute, amt + (itemTotals.get(effect.attribute) ?? 0));
        });
    });

    const rows: PlayerAttributesTableEntry[] = [];

    for (const [category, stats] of Object.entries(categories)) {
        const mappedCategory = category === 'Baserunning' ? 'base_running' : category.toLowerCase();
        const talkData = talk?.[mappedCategory];
        const talkDay = talkData?.day ?? 0;
        const talkSeason = talkData?.season ?? 0;
        const starsObj = talkData?.stars;

        for (const stat of stats) {
            const boonMultiplier = 1 + (boon ? lesserBoonTable?.[boon]?.[stat] ?? 0 : 0);
            const stars = starsObj?.[stat]?.length ?? null;

            const itemTotal = itemTotals.get(stat) ?? 0;

            const bottom = stars !== null ? stars * 25 - 12.5 : null;
            const top = stars !== null ? stars * 25 + 12.5 : null;
            const lower = bottom !== null ? bottom + itemTotal : null;
            const upper = top !== null ? top + itemTotal : null;
            const nominal = stars !== null ? stars * 25 + itemTotal : null;

            rows.push({
                PlayerName: name,
                Category: category,
                Stat: stat,
                Stars: stars ?? "???",
                StarBucketLower: bottom !== null ? trunc(bottom * boonMultiplier) : "???",
                StarBucketUpper: top !== null ? trunc(top * boonMultiplier) : "???",
                ItemTotal: Number(trunc(itemTotal * boonMultiplier)),
                TotalBucketLower: lower !== null ? trunc(lower * boonMultiplier) : "???",
                TotalBucketUpper: upper !== null ? trunc(upper * boonMultiplier) : "???",
                NominalTotal: nominal !== null ? trunc(nominal * boonMultiplier) : "???"
            });
        }
    }

    return rows;
}



const buildCSVRows = (teamPlayers: Player[]) => {
    const headers = [
        "PlayerName", "Category", "Stat", "Stars", "StarBucketLower", "StarBucketUpper",
        "ItemTotal", "TotalBucketLower", "TotalBucketUpper", "NominalTotal"
    ];

    const rows = [];
    for (const p of teamPlayers) {
        if (!p) continue;
        const statRows = getPlayerStatRows({statsPlayer: p});
        for (const row of statRows) {
            rows.push(headers.map(h => row[h as keyof PlayerAttributesTableEntry]));
        }
    }

    return [headers, ...rows];
};

export const downloadCSV = (players: Player[]) => {
    const rows = buildCSVRows(players);
    const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "player_stats.csv";
    a.click();
    URL.revokeObjectURL(url);
};