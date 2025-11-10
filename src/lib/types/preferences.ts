/**
 * User preference types for story customization
 */

export const GENRES = [
	"contemporary",
	"fantasy",
	"paranormal",
	"historical",
	"sci-fi",
	"small-town",
] as const;

export const TROPES = [
	"enemies-to-lovers",
	"fake-dating",
	"second-chance",
	"forced-proximity",
	"childhood-friends",
	"ceo-romance",
	"forbidden-love",
	"fated-mates",
	"time-travel",
] as const;

export const PACING_OPTIONS = ["slow-burn", "fast-paced"] as const;

export type Genre = (typeof GENRES)[number];
export type Trope = (typeof TROPES)[number];
export type PacingOption = (typeof PACING_OPTIONS)[number];
export type SpiceLevel = 1 | 2 | 3 | 4 | 5;

export interface UserPreferences {
	genres: Genre[];
	tropes: Trope[];
	spiceLevel: SpiceLevel;
	pacing: PacingOption;
}

export const GENRE_LABELS: Record<Genre, string> = {
	contemporary: "Contemporary",
	fantasy: "Fantasy",
	paranormal: "Paranormal",
	historical: "Historical",
	"sci-fi": "Sci-Fi",
	"small-town": "Small Town",
};

export const TROPE_LABELS: Record<Trope, string> = {
	"enemies-to-lovers": "Enemies to Lovers",
	"fake-dating": "Fake Dating",
	"second-chance": "Second Chance",
	"forced-proximity": "Forced Proximity",
	"childhood-friends": "Childhood Friends",
	"ceo-romance": "CEO Romance",
	"forbidden-love": "Forbidden Love",
	"fated-mates": "Fated Mates",
	"time-travel": "Time Travel",
};

export const SPICE_LABELS: Record<
	SpiceLevel,
	{ label: string; description: string }
> = {
	1: { label: "Sweet", description: "Kisses and hand-holding" },
	2: { label: "Warm", description: "Closed-door romance" },
	3: { label: "Spicy", description: "Some sensual scenes" },
	4: { label: "Extra Spicy", description: "Explicit scenes" },
	5: { label: "Fire", description: "Very explicit content" },
};

export const PACING_LABELS: Record<
	PacingOption,
	{ label: string; description: string }
> = {
	"slow-burn": {
		label: "Slow Burn",
		description: "Gradual relationship development",
	},
	"fast-paced": {
		label: "Fast-Paced",
		description: "Quick chemistry and passion",
	},
};
