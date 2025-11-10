import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	CheckCircle2,
	Flame,
	Heart,
	Settings,
	ArrowLeft,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	GENRE_LABELS,
	GENRES,
	type Genre,
	PACING_LABELS,
	PACING_OPTIONS,
	type PacingOption,
	SCENE_LENGTH_LABELS,
	SCENE_LENGTH_OPTIONS,
	type SceneLengthOption,
	SPICE_LABELS,
	type SpiceLevel,
	TROPE_LABELS,
	TROPES,
	type Trope,
	type UserPreferences,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/preferences")({
	component: PreferencesPage,
});

function PreferencesPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [preferences, setPreferences] = useState<UserPreferences>({
		genres: [],
		tropes: [],
		spiceLevel: 3,
		pacing: "slow-burn",
		sceneLength: "medium",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Load existing preferences
	const fetchPreferences = useCallback(async () => {
		try {
			const response = await fetch("/api/preferences", {
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status === 401) {
					navigate({ to: "/auth/login" });
					return;
				}
				throw new Error("Failed to fetch preferences");
			}

			const data = await response.json();
			if (data.preferences) {
				// Parse the preferences if they're stored as JSON string
				const prefs =
					typeof data.preferences === "string"
						? JSON.parse(data.preferences)
						: data.preferences;

				setPreferences({
					genres: prefs.genres || [],
					tropes: prefs.tropes || [],
					spiceLevel: prefs.spiceLevel || 3,
					pacing: prefs.pacing || "slow-burn",
					sceneLength: prefs.sceneLength || "medium",
				});
			}
		} catch (error) {
			console.error("Error fetching preferences:", error);
			setError("Failed to load preferences");
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	useEffect(() => {
		fetchPreferences();
	}, [fetchPreferences]);

	const handleGenreToggle = (genre: Genre) => {
		setPreferences((prev) => ({
			...prev,
			genres: prev.genres.includes(genre)
				? prev.genres.filter((g) => g !== genre)
				: [...prev.genres, genre],
		}));
		setSuccess(false);
	};

	const handleTropeToggle = (trope: Trope) => {
		setPreferences((prev) => ({
			...prev,
			tropes: prev.tropes.includes(trope)
				? prev.tropes.filter((t) => t !== trope)
				: [...prev.tropes, trope],
		}));
		setSuccess(false);
	};

	const handleSpiceLevelChange = (level: SpiceLevel) => {
		setPreferences((prev) => ({ ...prev, spiceLevel: level }));
		setSuccess(false);
	};

	const handlePacingChange = (pacing: PacingOption) => {
		setPreferences((prev) => ({ ...prev, pacing }));
		setSuccess(false);
	};

	const handleSceneLengthChange = (sceneLength: SceneLengthOption) => {
		setPreferences((prev) => ({ ...prev, sceneLength }));
		setSuccess(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);
		setSuccess(false);

		// Validate
		if (preferences.genres.length === 0) {
			setError("Please select at least one genre");
			setIsSubmitting(false);
			return;
		}

		if (preferences.tropes.length === 0) {
			setError("Please select at least one trope");
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await fetch("/api/preferences", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(preferences),
				credentials: "include",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to save preferences");
			}

			// Show success message
			setSuccess(true);
			// Auto-hide success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100 flex items-center justify-center">
				<div className="text-center">
					<Settings className="w-12 h-12 text-romance-500 mx-auto mb-4 animate-spin" />
					<p className="text-slate-600">Loading your preferences...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<Link
							to="/profile"
							className="inline-flex items-center text-slate-600 hover:text-romance-600 mb-4 transition-colors"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Profile
						</Link>
						<div className="flex items-center gap-4">
							<Settings className="w-10 h-10 text-romance-500" />
							<div>
								<h1 className="text-3xl font-bold text-slate-900">
									Novel Generation Preferences
								</h1>
								<p className="text-slate-600">
									Customize how AI generates stories for you
								</p>
							</div>
						</div>
					</div>

					{/* Success Message */}
					{success && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
							<CheckCircle2 className="w-5 h-5" />
							<span>Your preferences have been saved successfully!</span>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
							{error}
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Genres Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex items-center mb-6">
								<BookOpen className="w-6 h-6 text-romance-500 mr-2" />
								<h2 className="text-2xl font-bold text-slate-900">Genres</h2>
							</div>
							<p className="text-slate-600 mb-6">
								Select your favorite romance genres
							</p>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{GENRES.map((genre) => (
									<button
										key={genre}
										type="button"
										onClick={() => handleGenreToggle(genre)}
										className={`p-4 rounded-lg border-2 transition-all ${
											preferences.genres.includes(genre)
												? "border-romance-500 bg-romance-50 text-romance-700"
												: "border-slate-200 hover:border-romance-300 text-slate-700"
										}`}
									>
										<div className="font-semibold">{GENRE_LABELS[genre]}</div>
									</button>
								))}
							</div>
						</div>

						{/* Tropes Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex items-center mb-6">
								<Heart className="w-6 h-6 text-romance-500 mr-2" />
								<h2 className="text-2xl font-bold text-slate-900">Tropes</h2>
							</div>
							<p className="text-slate-600 mb-6">
								Choose your favorite romance tropes
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{TROPES.map((trope) => (
									<button
										key={trope}
										type="button"
										onClick={() => handleTropeToggle(trope)}
										className={`p-4 rounded-lg border-2 transition-all text-left ${
											preferences.tropes.includes(trope)
												? "border-romance-500 bg-romance-50 text-romance-700"
												: "border-slate-200 hover:border-romance-300 text-slate-700"
										}`}
									>
										<div className="font-semibold">{TROPE_LABELS[trope]}</div>
									</button>
								))}
							</div>
						</div>

						{/* Spice Level Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex items-center mb-6">
								<Flame className="w-6 h-6 text-romance-500 mr-2" />
								<h2 className="text-2xl font-bold text-slate-900">
									Spice Level
								</h2>
							</div>
							<p className="text-slate-600 mb-6">
								Set your preferred heat level for intimate scenes
							</p>
							<div className="space-y-3">
								{([1, 2, 3, 4, 5] as SpiceLevel[]).map((level) => (
									<button
										key={level}
										type="button"
										onClick={() => handleSpiceLevelChange(level)}
										className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
											preferences.spiceLevel === level
												? "border-romance-500 bg-romance-50"
												: "border-slate-200 hover:border-romance-300"
										}`}
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="flex items-center gap-2">
													<span className="font-semibold text-slate-900">
														{SPICE_LABELS[level].label}
													</span>
													<div className="flex gap-1">
														{Array.from({ length: level }).map((_, i) => (
															<Flame
																key={i}
																className="w-4 h-4 text-romance-500"
																fill="currentColor"
															/>
														))}
													</div>
												</div>
												<p className="text-sm text-slate-600">
													{SPICE_LABELS[level].description}
												</p>
											</div>
											<div
												className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
													preferences.spiceLevel === level
														? "border-romance-500 bg-romance-500"
														: "border-slate-300"
												}`}
											>
												{preferences.spiceLevel === level && (
													<div className="w-2 h-2 bg-white rounded-full" />
												)}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Pacing Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-xl font-bold text-slate-900 mb-4">
								Relationship Pacing
							</h3>
							<p className="text-slate-600 mb-6">
								How quickly should relationships develop in your stories?
							</p>
							<div className="space-y-3">
								{PACING_OPTIONS.map((pacing) => (
									<button
										key={pacing}
										type="button"
										onClick={() => handlePacingChange(pacing)}
										className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
											preferences.pacing === pacing
												? "border-romance-500 bg-romance-50"
												: "border-slate-200 hover:border-romance-300"
										}`}
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="font-semibold text-slate-900">
													{PACING_LABELS[pacing].label}
												</div>
												<p className="text-sm text-slate-600">
													{PACING_LABELS[pacing].description}
												</p>
											</div>
											<div
												className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
													preferences.pacing === pacing
														? "border-romance-500 bg-romance-500"
														: "border-slate-300"
												}`}
											>
												{preferences.pacing === pacing && (
													<div className="w-2 h-2 bg-white rounded-full" />
												)}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Scene Length Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-xl font-bold text-slate-900 mb-4">
								Scene Length
							</h3>
							<p className="text-slate-600 mb-6">
								Choose your preferred scene length
							</p>
							<div className="space-y-3">
								{SCENE_LENGTH_OPTIONS.map((length) => (
									<button
										key={length}
										type="button"
										onClick={() => handleSceneLengthChange(length)}
										className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
											preferences.sceneLength === length
												? "border-romance-500 bg-romance-50"
												: "border-slate-200 hover:border-romance-300"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<div className="font-semibold text-slate-900">
													{SCENE_LENGTH_LABELS[length].label}
												</div>
												<p className="text-sm text-slate-600">
													{SCENE_LENGTH_LABELS[length].description}
												</p>
												<p className="text-xs text-slate-500 mt-1">
													{SCENE_LENGTH_LABELS[length].wordCount}
												</p>
											</div>
											<div
												className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
													preferences.sceneLength === length
														? "border-romance-500 bg-romance-500"
														: "border-slate-300"
												}`}
											>
												{preferences.sceneLength === length && (
													<div className="w-2 h-2 bg-white rounded-full" />
												)}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Save Button */}
						<div className="flex justify-end gap-4">
							<Link
								to="/profile"
								className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
							>
								Cancel
							</Link>
							<button
								type="submit"
								disabled={isSubmitting}
								className="px-8 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{isSubmitting ? (
									<>
										<Settings className="w-5 h-5 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<CheckCircle2 className="w-5 h-5" />
										Save Preferences
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

