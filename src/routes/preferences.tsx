import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { FullPageLoader } from "~/components/FullPageLoader";
import {
	GenresSection,
	TropesSection,
	SpiceLevelSection,
	PacingSection,
	SceneLengthSection,
} from "~/components/preferences";
import { useUserPreferencesQuery } from "~/hooks/useUserPreferencesQuery";
import { useUpdatePreferencesMutation } from "~/hooks/useUpdatePreferencesMutation";
import { ApiError } from "~/lib/api/client";
import type {
	Genre,
	PacingOption,
	SceneLengthOption,
	SpiceLevel,
	Trope,
	UserPreferences,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/preferences")({
	component: PreferencesPage,
});

function PreferencesPage() {
	const navigate = useNavigate();
	const { data: preferencesData, isLoading, error: queryError } = useUserPreferencesQuery();
	const updatePreferences = useUpdatePreferencesMutation();
	
	const [preferences, setPreferences] = useState<UserPreferences>({
		genres: [],
		tropes: [],
		spiceLevel: 3,
		pacing: "slow-burn",
		sceneLength: "medium",
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Load existing preferences when data arrives
	useEffect(() => {
		if (preferencesData) {
			setPreferences(preferencesData);
		}
	}, [preferencesData]);

	// Handle authentication errors
	useEffect(() => {
		if (queryError instanceof ApiError && queryError.status === 401) {
			navigate({ to: "/auth/login" });
		}
	}, [queryError, navigate]);

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
		setError(null);
		setSuccess(false);

		// Validate
		if (preferences.genres.length === 0) {
			setError("Please select at least one genre");
			return;
		}

		if (preferences.tropes.length === 0) {
			setError("Please select at least one trope");
			return;
		}

		try {
			await updatePreferences.mutateAsync(preferences);
			// Show success message
			setSuccess(true);
			// Auto-hide success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message || "Failed to save preferences");
			} else {
				setError("An error occurred");
			}
		}
	};

	if (isLoading) {
		return <FullPageLoader message="Loading your preferences..." />;
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
						<GenresSection
							selectedGenres={preferences.genres}
							onToggle={handleGenreToggle}
						/>

						<TropesSection
							selectedTropes={preferences.tropes}
							onToggle={handleTropeToggle}
						/>

						<SpiceLevelSection
							selectedLevel={preferences.spiceLevel}
							onSelect={handleSpiceLevelChange}
						/>

						<PacingSection
							selectedPacing={preferences.pacing}
							onSelect={handlePacingChange}
						/>

						<SceneLengthSection
							selectedLength={preferences.sceneLength || "medium"}
							onSelect={handleSceneLengthChange}
						/>

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
								disabled={updatePreferences.isPending}
								className="px-8 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{updatePreferences.isPending ? (
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
