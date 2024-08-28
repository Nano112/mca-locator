// biomeUtils.js

export const biomeColors = {
	0: "#000070", // Ocean
	1: "#8DB360", // Plains
	2: "#FA9418", // Desert
	3: "#606060", // Extreme Hills
	4: "#056621", // Forest
	5: "#0B6659", // Taiga
	6: "#07F9B2", // Swampland
	7: "#0000FF", // River
	8: "#FF0000", // Hell (Nether)
	9: "#8080FF", // The End (Sky)
	10: "#9090A0", // Frozen Ocean
	11: "#A0A0FF", // Frozen River
	12: "#FFFFFF", // Ice Plains
	13: "#A0A0A0", // Ice Mountains
	14: "#FF00FF", // MushroomIsland
	15: "#A000FF", // MushroomIslandShore
	16: "#FADE55", // Beach
	17: "#D25F12", // DesertHills
	18: "#22551C", // ForestHills
	19: "#163933", // TaigaHills
	20: "#72789A", // Extreme Hills Edge
	21: "#537B09", // Jungle
	22: "#2C4205", // JungleHills
	23: "#628B17", // JungleEdge
	24: "#000030", // Deep Ocean
	25: "#A2A284", // Stone Beach
	26: "#FAF0C0", // Cold Beach
	27: "#307444", // Birch Forest
	28: "#1F5F32", // Birch Forest Hills
	29: "#40511A", // Roofed Forest
	30: "#31554A", // Cold Taiga
	31: "#243F36", // Cold Taiga Hills
	32: "#596651", // Mega Taiga
	33: "#545F3E", // Mega Taiga Hills
	34: "#507050", // Extreme Hills+
	35: "#BDB25F", // Savanna
	36: "#A79D64", // Savanna Plateau
	37: "#D94515", // Mesa
	38: "#B09765", // Mesa Plateau F
	39: "#CA8C65", // Mesa Plateau
	127: "#000000", // The Void
	129: "#B5DB88", // Sunflower Plains
	130: "#FFBC40", // Desert M
	131: "#888888", // Extreme Hills M
	132: "#2d8e48", // Flower Forest
	133: "#596651", // Taiga M
	134: "#2FFFDA", // Swampland M
	140: "#B4DCDC", // Ice Plains Spikes
	149: "#7BA331", // Jungle M
	151: "#8AB33F", // JungleEdge M
	155: "#589C6C", // Birch Forest M
	156: "#47875A", // Birch Forest Hills M
	157: "#687942", // Roofed Forest M
	158: "#597D72", // Cold Taiga M
	160: "#818e79", // Mega Spruce Taiga
	161: "#6d7766", // Redwood Taiga Hills M
	162: "#789878", // Extreme Hills+ M
	163: "#E5DA87", // Savanna M
	164: "#CFC58C", // Savanna Plateau M
	165: "#FF6D3D", // Mesa (Bryce)
	166: "#D8BF8D", // Mesa Plateau F M
	167: "#F2B48D", // Mesa Plateau M
};

export const biomeNames = {
	0: "Ocean",
	1: "Plains",
	2: "Desert",
	3: "Extreme Hills",
	4: "Forest",
	5: "Taiga",
	6: "Swampland",
	7: "River",
	8: "Hell (Nether)",
	9: "The End (Sky)",
	10: "Frozen Ocean",
	11: "Frozen River",
	12: "Ice Plains",
	13: "Ice Mountains",
	14: "MushroomIsland",
	15: "MushroomIslandShore",
	16: "Beach",
	17: "DesertHills",
	18: "ForestHills",
	19: "TaigaHills",
	20: "Extreme Hills Edge",
	21: "Jungle",
	22: "JungleHills",
	23: "JungleEdge",
	24: "Deep Ocean",
	25: "Stone Beach",
	26: "Cold Beach",
	27: "Birch Forest",
	28: "Birch Forest Hills",
	29: "Roofed Forest",
	30: "Cold Taiga",
	31: "Cold Taiga Hills",
	32: "Mega Taiga",
	33: "Mega Taiga Hills",
	34: "Extreme Hills+",
	35: "Savanna",
	36: "Savanna Plateau",
	37: "Mesa",
	38: "Mesa Plateau F",
	39: "Mesa Plateau",
	127: "The Void",
	129: "Sunflower Plains",
	130: "Desert M",
	131: "Extreme Hills M",
	132: "Flower Forest",
	133: "Taiga M",
	134: "Swampland M",
	140: "Ice Plains Spikes",
	149: "Jungle M",
	151: "JungleEdge M",
	155: "Birch Forest M",
	156: "Birch Forest Hills M",
	157: "Roofed Forest M",
	158: "Cold Taiga M",
	160: "Mega Spruce Taiga",
	161: "Redwood Taiga Hills M",
	162: "Extreme Hills+ M",
	163: "Savanna M",
	164: "Savanna Plateau M",
	165: "Mesa (Bryce)",
	166: "Mesa Plateau F M",
	167: "Mesa Plateau M",
};

/**
 * Get the color associated with a biome ID.
 * @param {number} biomeId - The ID of the biome.
 * @return {string} - The hex color associated with the biome.
 */
export function getBiomeColor(biomeId) {
	return biomeColors[biomeId] || "#000000";
}

/**
 * Get the name associated with a biome ID.
 * @param {number} biomeId - The ID of the biome.
 * @return {string} - The name of the biome.
 */
export function getBiomeName(biomeId) {
	return biomeNames[biomeId] || "Unknown";
}
