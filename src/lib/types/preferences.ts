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

// TROPES constant removed in favor of DB fetching

export const PACING_OPTIONS = ["slow-burn", "fast-paced"] as const;

export const SCENE_LENGTH_OPTIONS = ["short", "medium", "long"] as const;

export const POV_CHARACTER_GENDER_OPTIONS = [
	"male",
	"female",
	"non-binary",
	"genderqueer",
	"trans-man",
	"trans-woman",
	"agender",
	"genderfluid",
] as const;

export type Genre = (typeof GENRES)[number];
export type Trope = string;
export type PacingOption = (typeof PACING_OPTIONS)[number];
export type SceneLengthOption = (typeof SCENE_LENGTH_OPTIONS)[number];
export type PovCharacterGender = (typeof POV_CHARACTER_GENDER_OPTIONS)[number];
export type SpiceLevel = 1 | 2 | 3 | 4 | 5;

export interface UserPreferences {
	genres: Genre[];
	tropes: Trope[];
	spiceLevel: SpiceLevel;
	pacing: PacingOption;
	sceneLength?: SceneLengthOption; // Optional with default "medium"
	povCharacterGender?: PovCharacterGender; // Optional with default "female"
}

export const GENRE_LABELS: Record<Genre, string> = {
	contemporary: "Contemporary",
	fantasy: "Fantasy",
	paranormal: "Paranormal",
	historical: "Historical",
	"sci-fi": "Sci-Fi",
	"small-town": "Small Town",
};

// TROPE_LABELS constant removed in favor of DB fetching

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

export const SCENE_LENGTH_LABELS: Record<
	SceneLengthOption,
	{ label: string; description: string; wordCount: string }
> = {
	short: {
		label: "Short",
		description: "Quick, punchy scenes",
		wordCount: "~500-700 words",
	},
	medium: {
		label: "Medium",
		description: "Balanced pacing",
		wordCount: "~800-1100 words",
	},
	long: {
		label: "Long",
		description: "Detailed, immersive scenes",
		wordCount: "~1100-1500 words",
	},
};

export const POV_CHARACTER_GENDER_LABELS: Record<
	PovCharacterGender,
	{ label: string; description: string }
> = {
	male: {
		label: "Male",
		description: "Male protagonist perspective",
	},
	female: {
		label: "Female",
		description: "Female protagonist perspective",
	},
	"non-binary": {
		label: "Non-binary",
		description: "Non-binary protagonist perspective",
	},
	genderqueer: {
		label: "Genderqueer",
		description: "Genderqueer protagonist perspective",
	},
	"trans-man": {
		label: "Trans Man",
		description: "Trans man protagonist perspective",
	},
	"trans-woman": {
		label: "Trans Woman",
		description: "Trans woman protagonist perspective",
	},
	agender: {
		label: "Agender",
		description: "Agender protagonist perspective",
	},
	genderfluid: {
		label: "Genderfluid",
		description: "Genderfluid protagonist perspective",
	},
};
