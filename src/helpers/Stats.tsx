import { lesserBoonTable } from "@/components/team/BoonDictionary";
import { battingAttrs, defenseAttrs, pitchingAttrs, runningAttrs } from "@/components/team/Constants";
import { Boon, Equipment, Player } from "@/types/Player";

export type NewEquipmentEffect = {
    flatBonusValue: number;
    multiplierValue: number;
    items: Equipment[]
}

export function calculateMultItemBonuses(itemTotals: Map<string, NewEquipmentEffect>, stat: string, statTotal: number | null, baseTotal: number | null): number {
    if (statTotal == null || baseTotal == null) return 0;
    if (!itemTotals.has(stat)) return 0;
    const effect = itemTotals.get(stat)!;
    if (effect.multiplierValue == 0) return 0;

    const base = baseTotal + effect.flatBonusValue;
    return base * effect.multiplierValue;
}

export function calculateTotalStatSum(player: Player, boon: Boon, itemTotals: Map<string, NewEquipmentEffect>): number {
    if (!player.talk) return 0;

    let totalStatSum = 0;
    const allStatCategories = {
        batting: battingAttrs,
        pitching: pitchingAttrs,
        defense: defenseAttrs,
        base_running: runningAttrs,
    };

    for (const categoryKey in allStatCategories) {
        const talkCategory = player.talk[categoryKey as keyof typeof player.talk];
        if (!talkCategory) continue;

        const stats = allStatCategories[categoryKey as keyof typeof allStatCategories];
        
        stats.forEach(stat => {
            const boonMultiplier = 1 + (lesserBoonTable?.[boon.name]?.[stat] ?? 0);
            const statTotalFromData = talkCategory.stars?.[stat]?.total * 100 ?? null;
            const statBase = talkCategory.stars?.[stat]?.base_total * 100 ?? null;

            const multItemBonus = calculateMultItemBonuses(itemTotals, stat, statTotalFromData, statBase);
            const flatBonus = itemTotals.get(stat)?.flatBonusValue ?? 0;
            const itemBonus = flatBonus + multItemBonus;

            const totalBeforeBoon = (statBase ?? 0) + itemBonus;
            const finalStat = totalBeforeBoon * boonMultiplier;
            
            totalStatSum += finalStat;
        });
    }
    return totalStatSum;
}