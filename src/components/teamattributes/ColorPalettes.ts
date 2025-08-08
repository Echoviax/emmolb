const goldGradient = 'radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%), radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%)';
const defaultPalette = [
    'oklch(0.82 0.01 100)',
    'oklch(0.74 0.07 120)',
    'oklch(0.61 0.11 150)',
    'oklch(0.55 0.12 190)',
    'oklch(0.50 0.13 240)',
    'oklch(0.47 0.14 280)',
    'oklch(0.45 0.15 310)',
    'oklch(0.47 0.16 330)',
    'oklch(0.49 0.17 10)',
    'oklch(0.52 0.18 30)',
    'oklch(0.56 0.18 50)',
    'oklch(0.60 0.18 70)',
    goldGradient,
];

const viridis = ["#440154","#472d7b","#3b528b","#2c728e","#21918c","#1fa088","#28ae80","#3fbc73","#5ec962","#84d44b","#addc30","#d8e219","#fde725"];
const viridisReversed = ["#440154","#48186a","#472d7b","#424086","#3b528b","#33638d","#2c728e","#26828e","#21918c","#28ae80","#5ec962","#addc30","#fde725"].reverse();
const inferno = ["#000004","#210c4a","#57106e","#8a226a","#bc3754","#d24644","#e45a31","#f1731d","#f98e09","#fcac11","#f9cb35","#f2ea69","#fcffa4"];
const infernoReversed = ["#000004","#0b0724","#210c4a","#3d0965","#57106e","#71196e","#8a226a","#a32c61","#bc3754","#e45a31","#f98e09","#f9cb35","#fcffa4"].reverse();
const magma = ["#000004","#1d1147","#51127c","#832681","#b73779","#d0416f","#e75263","#f56b5c","#fc8961","#fea772","#fec488","#fde2a3","#fcfdbf"];
const magmaReversed = ["#000004","#0a0822","#1d1147","#36106b","#51127c","#6a1c81","#832681","#9c2e7f","#b73779","#e75263","#fc8961","#fec488","#fcfdbf"].reverse();
const plasma = ["#0d0887","#4c02a1","#7e03a8","#aa2395","#cc4778","#da5a6a","#e66c5c","#f0804e","#f89540","#fdac33","#fdc527","#f8df25","#f0f921"];
const plasmaReversed = ["#0d0887","#310597","#4c02a1","#6600a7","#7e03a8","#9511a1","#aa2395","#bc3587","#cc4778","#e66c5c","#f89540","#fdc527","#f0f921"].reverse();
const cividis = ["#002051","#11366c","#3c4d6e","#62646f","#7f7c75","#8c8877","#9a9478","#a9a177","#bbaf71","#cebd68","#e2cb5c","#f3da4f","#fdea45"];
const cividisReversed = ["#002051","#012b65","#11366c","#26426e","#3c4d6e","#51586e","#62646f","#727071","#7f7c75","#9a9478","#bbaf71","#e2cb5c","#fdea45"].reverse();

export type Palette = {
    colorScale: string[],
    isLightToDark: boolean,
}

export const palettes: Record<string, Palette> = {
    default: {
        colorScale: defaultPalette,
        isLightToDark: true,
    },
    viridis: {
        colorScale: viridis,
        isLightToDark: false,
    },
    viridisReversed: {
        colorScale: viridisReversed,
        isLightToDark: true,
    },
    inferno: {
        colorScale: inferno,
        isLightToDark: false,
    },
    infernoReversed: {
        colorScale: infernoReversed,
        isLightToDark: true,
    },
    magma: {
        colorScale: magma,
        isLightToDark: false,
    },
    magmaReversed: {
        colorScale: magmaReversed,
        isLightToDark: true,
    },
    plasma: {
        colorScale: plasma,
        isLightToDark: false,
    },
    plasmaReversed: {
        colorScale: plasmaReversed,
        isLightToDark: true,
    },
    cividis: {
        colorScale: cividis,
        isLightToDark: false,
    },
    cividisReversed: {
        colorScale: cividisReversed,
        isLightToDark: true,
    },
};